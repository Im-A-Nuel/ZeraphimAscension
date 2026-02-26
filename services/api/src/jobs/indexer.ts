import { calculateLevel } from "../domain/index.js";
import { getDb, getOnchainClient } from "../infra/index.js";
import { asNumber, logError, logInfo, logWarn } from "../lib/index.js";
import type { ActivityType, OnchainEvent } from "../types/index.js";

const POLL_INTERVAL_MS = 8_000;
let lastFetchErrorKey: string | null = null;

interface ParsedEvent {
  type: ActivityType;
  xpDelta: number;
  shardsDelta: number;
  lootTicketDelta: number;
  questsDelta: number;
  streakValue: number | null;
  wingsTierValue: number | null;
}

const parseType = (eventType: string): ActivityType | null => {
  if (eventType.includes("QuestCompletedEvent")) {
    return "QUEST";
  }

  if (eventType.includes("LootOpenedEvent")) {
    return "LOOT";
  }

  if (eventType.includes("WingsMintedEvent")) {
    return "MINT";
  }

  if (eventType.includes("WingsEvolvedEvent")) {
    return "EVOLVE";
  }

  return null;
};

const parseEvent = (event: OnchainEvent): ParsedEvent | null => {
  const type = parseType(event.eventType);
  if (!type) {
    return null;
  }

  const payload = event.payload;

  if (type === "QUEST") {
    return {
      type,
      xpDelta: asNumber(payload.xp_gained ?? payload.xpGained),
      shardsDelta: asNumber(payload.shards_gained ?? payload.shardsGained),
      lootTicketDelta: asNumber(payload.ticket_gained ?? payload.ticketGained, 1),
      questsDelta: 1,
      streakValue: asNumber(payload.new_streak ?? payload.newStreak, 0),
      wingsTierValue: null,
    };
  }

  if (type === "LOOT") {
    const rewardType = String(payload.reward_type ?? payload.rewardType ?? "");
    const rewardAmount = asNumber(payload.reward_amount ?? payload.rewardAmount);
    const xpBonus = asNumber(payload.xp_bonus ?? payload.xpBonus);
    return {
      type,
      xpDelta: xpBonus + (rewardType.includes("xp") ? rewardAmount : 0),
      shardsDelta: rewardType.includes("shards") ? rewardAmount : 0,
      lootTicketDelta: -1,
      questsDelta: 0,
      streakValue: null,
      wingsTierValue: null,
    };
  }

  if (type === "MINT") {
    return {
      type,
      xpDelta: 0,
      shardsDelta: 0,
      lootTicketDelta: 0,
      questsDelta: 0,
      streakValue: null,
      wingsTierValue: 1,
    };
  }

  return {
    type,
    xpDelta: 0,
    shardsDelta: -Math.abs(asNumber(payload.shards_spent ?? payload.shardsSpent)),
    lootTicketDelta: 0,
    questsDelta: 0,
    streakValue: null,
    wingsTierValue: asNumber(payload.to_tier ?? payload.toTier, 0),
  };
};

const upsertUserAndStats = (address: string): void => {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(
    `
      INSERT INTO users (address, created_at, last_seen_at)
      VALUES (?, ?, ?)
      ON CONFLICT(address) DO UPDATE SET
        last_seen_at = excluded.last_seen_at
    `,
  ).run(address, now, now);

  db.prepare(
    `
      INSERT INTO user_stats (
        address,
        xp,
        level,
        shards,
        loot_tickets,
        quests_completed_total,
        streak_count,
        wings_tier,
        updated_at
      )
      VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?)
      ON CONFLICT(address) DO NOTHING
    `,
  ).run(address, now);
};

const applyStatDelta = (address: string, parsedEvent: ParsedEvent): void => {
  const db = getDb();
  const current = db
    .prepare(
      `
        SELECT
          xp,
          level,
          shards,
          loot_tickets AS lootTickets,
          quests_completed_total AS questsCompletedTotal,
          streak_count AS streakCount,
          wings_tier AS wingsTier
        FROM user_stats
        WHERE address = ?
      `,
    )
    .get(address) as
    | {
        xp: number;
        level: number;
        shards: number;
        lootTickets: number;
        questsCompletedTotal: number;
        streakCount: number;
        wingsTier: number;
      }
    | undefined;

  if (!current) {
    return;
  }

  const xp = Math.max(0, current.xp + parsedEvent.xpDelta);
  const level = calculateLevel(xp);
  const shards = Math.max(0, current.shards + parsedEvent.shardsDelta);
  const lootTickets = Math.max(0, current.lootTickets + parsedEvent.lootTicketDelta);
  const questsCompletedTotal = Math.max(0, current.questsCompletedTotal + parsedEvent.questsDelta);
  const streakCount =
    parsedEvent.streakValue !== null ? Math.max(0, parsedEvent.streakValue) : current.streakCount;
  const wingsTier =
    parsedEvent.wingsTierValue !== null
      ? Math.max(current.wingsTier, parsedEvent.wingsTierValue)
      : current.wingsTier;

  db.prepare(
    `
      UPDATE user_stats
      SET
        xp = ?,
        level = ?,
        shards = ?,
        loot_tickets = ?,
        quests_completed_total = ?,
        streak_count = ?,
        wings_tier = ?,
        updated_at = ?
      WHERE address = ?
    `,
  ).run(
    xp,
    level,
    shards,
    lootTickets,
    questsCompletedTotal,
    streakCount,
    wingsTier,
    new Date().toISOString(),
    address,
  );
};

const saveActivity = (event: OnchainEvent, activityType: ActivityType): void => {
  const db = getDb();

  db.prepare(
    `
      INSERT INTO activities (
        id,
        address,
        type,
        tx_hash,
        payload_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `,
  ).run(
    event.cursor,
    event.address,
    activityType,
    event.txDigest,
    JSON.stringify(event.payload),
    new Date(event.timestampMs).toISOString(),
  );
};

const readIndexerCursor = (): string | null => {
  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT cursor
        FROM indexer_state
        WHERE id = 1
      `,
    )
    .get() as { cursor: string | null } | undefined;

  return row?.cursor ?? null;
};

const saveIndexerCursor = (cursor: string): void => {
  const db = getDb();
  db.prepare(
    `
      INSERT INTO indexer_state (id, cursor, last_synced_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        cursor = excluded.cursor,
        last_synced_at = excluded.last_synced_at
    `,
  ).run(cursor, new Date().toISOString());
};

const syncOnce = async (): Promise<void> => {
  const cursor = readIndexerCursor();
  const onchainClient = getOnchainClient();
  const result = await onchainClient.fetchEvents(cursor, 100);

  if (!result.ok || !result.data) {
    const errorKey = `${String(result.code ?? "unknown")}:${result.message}`;
    if (errorKey !== lastFetchErrorKey) {
      logWarn("Indexer fetch skipped due to RPC error.", {
        reason: result.message,
        code: result.code,
      });
      lastFetchErrorKey = errorKey;
    }
    return;
  }

  lastFetchErrorKey = null;

  if (result.data.length === 0) {
    logInfo("Indexer poll completed with zero events.");
    return;
  }

  let processed = 0;
  let newestCursor = cursor;

  for (const event of result.data) {
    const parsedEvent = parseEvent(event);
    if (!parsedEvent) {
      newestCursor = event.cursor;
      continue;
    }

    upsertUserAndStats(event.address);
    saveActivity(event, parsedEvent.type);
    applyStatDelta(event.address, parsedEvent);

    newestCursor = event.cursor;
    processed += 1;
  }

  if (newestCursor) {
    saveIndexerCursor(newestCursor);
  }

  logInfo("Indexer poll processed events.", {
    processed,
    fetched: result.data.length,
    cursor: newestCursor,
  });
};

export const startIndexerJob = (): NodeJS.Timeout => {
  logInfo("Indexer job started.", { intervalMs: POLL_INTERVAL_MS });

  const timer = setInterval(() => {
    void syncOnce().catch((issue) => {
      logError("Indexer job failed unexpectedly.", {
        error: issue instanceof Error ? issue.message : String(issue),
      });
    });
  }, POLL_INTERVAL_MS);

  void syncOnce().catch((issue) => {
    logError("Indexer warmup sync failed.", {
      error: issue instanceof Error ? issue.message : String(issue),
    });
  });

  return timer;
};
