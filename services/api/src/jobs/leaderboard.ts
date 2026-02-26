import { calculateScore, getIsoWeekPeriod } from "../domain/index.js";
import { getDb } from "../infra/index.js";
import { logError, logInfo } from "../lib/index.js";

const REFRESH_INTERVAL_MS = 60_000;

const refreshLeaderboard = (period: string): void => {
  const db = getDb();
  const now = new Date().toISOString();

  const rows = db
    .prepare(
      `
        SELECT
          address,
          xp,
          shards,
          wings_tier AS wingsTier,
          streak_count AS streakCount,
          quests_completed_total AS questsCompletedTotal
        FROM user_stats
      `,
    )
    .all() as Array<{
    address: string;
    xp: number;
    shards: number;
    wingsTier: number;
    streakCount: number;
    questsCompletedTotal: number;
  }>;

  const scored = rows
    .map((row) => ({
      address: row.address,
      score: calculateScore({
        xp: row.xp,
        shards: row.shards,
        wingsTier: row.wingsTier,
        streakCount: row.streakCount,
        questsCompletedTotal: row.questsCompletedTotal,
      }),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.address.localeCompare(right.address);
    });

  db.exec("BEGIN");
  try {
    db.prepare(
      `
        DELETE FROM leaderboard_entries
        WHERE period = ?
      `,
    ).run(period);

    const statement = db.prepare(
      `
        INSERT INTO leaderboard_entries (
          period,
          address,
          score,
          rank,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?)
      `,
    );

    scored.forEach((entry, index) => {
      statement.run(period, entry.address, entry.score, index + 1, now);
    });
    db.exec("COMMIT");
  } catch (issue) {
    db.exec("ROLLBACK");
    throw issue;
  }
  logInfo("Leaderboard refreshed.", { period, entries: scored.length });
};

export const startLeaderboardJob = (): NodeJS.Timeout => {
  logInfo("Leaderboard job started.", { intervalMs: REFRESH_INTERVAL_MS });

  const tick = (): void => {
    try {
      refreshLeaderboard(getIsoWeekPeriod());
    } catch (issue) {
      logError("Leaderboard refresh failed.", {
        error: issue instanceof Error ? issue.message : String(issue),
      });
    }
  };

  tick();
  return setInterval(tick, REFRESH_INTERVAL_MS);
};
