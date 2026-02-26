import type { Request, Response } from "express";
import { getDb } from "../../infra/index.js";
import { error, isValidAddress, parseLimit, success } from "../../lib/index.js";
import type { ActivityItem, UserStats } from "../../types/index.js";

const readAddressParam = (request: Request): string | null => {
  const raw = request.params.address;
  if (Array.isArray(raw)) {
    return raw.length > 0 ? (raw[0] ?? null) : null;
  }

  return typeof raw === "string" ? raw : null;
};

const ensureUserStats = (address: string): UserStats => {
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

  const user = db
    .prepare(
      `
        SELECT
          address,
          xp,
          level,
          shards,
          loot_tickets AS lootTickets,
          quests_completed_total AS questsCompletedTotal,
          streak_count AS streakCount,
          wings_tier AS wingsTier,
          updated_at AS updatedAt
        FROM user_stats
        WHERE address = ?
      `,
    )
    .get(address) as unknown as UserStats | undefined;

  return (
    user ?? {
      address,
      xp: 0,
      level: 0,
      shards: 0,
      lootTickets: 0,
      questsCompletedTotal: 0,
      streakCount: 0,
      wingsTier: 0,
      updatedAt: now,
    }
  );
};

export const getUserByAddress = (request: Request, response: Response): void => {
  const address = readAddressParam(request);
  if (!address || !isValidAddress(address)) {
    const failure = error("Invalid wallet address.", 400);
    response.status(failure.httpCode).json(failure.body);
    return;
  }

  try {
    const user = ensureUserStats(address);
    response.status(200).json(success(user, "User stats loaded."));
  } catch {
    const failure = error("Failed to load user stats.", 500);
    response.status(failure.httpCode).json(failure.body);
  }
};

export const getUserActivities = (request: Request, response: Response): void => {
  const address = readAddressParam(request);
  if (!address || !isValidAddress(address)) {
    const failure = error("Invalid wallet address.", 400);
    response.status(failure.httpCode).json(failure.body);
    return;
  }

  const limit = parseLimit(request.query.limit, 20, 1, 100);

  try {
    const db = getDb();
    const rows = db
      .prepare(
        `
          SELECT
            id,
            address,
            type,
            tx_hash AS txHash,
            payload_json AS payloadJson,
            created_at AS createdAt
          FROM activities
          WHERE address = ?
          ORDER BY created_at DESC
          LIMIT ?
        `,
      )
      .all(address, limit) as unknown as Array<{
      id: string;
      address: string;
      type: ActivityItem["type"];
      txHash: string;
      payloadJson: string;
      createdAt: string;
    }>;

    const data: ActivityItem[] = rows.map((row) => ({
      id: row.id,
      address: row.address,
      type: row.type,
      txHash: row.txHash,
      payload: JSON.parse(row.payloadJson) as Record<string, unknown>,
      createdAt: row.createdAt,
    }));

    response.status(200).json(success(data, "User activities loaded."));
  } catch {
    const failure = error("Failed to load activities.", 500);
    response.status(failure.httpCode).json(failure.body);
  }
};
