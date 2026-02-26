import type { Request, Response } from "express";
import { resolvePeriod } from "../../domain/index.js";
import { getDb } from "../../infra/index.js";
import { error, isValidAddress, parseLimit, success } from "../../lib/index.js";
import type { LeaderboardEntry } from "../../types/index.js";

const readAddressParam = (request: Request): string | null => {
  const raw = request.params.address;
  if (Array.isArray(raw)) {
    return raw.length > 0 ? (raw[0] ?? null) : null;
  }

  return typeof raw === "string" ? raw : null;
};

const ensureUserStatsExists = (address: string): void => {
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

const getLiveLeaderboard = (limit: number): Omit<LeaderboardEntry, "period" | "updatedAt">[] => {
  const db = getDb();

  return db
    .prepare(
      `
        SELECT
          address,
          ROUND(
            (
              xp
              + (shards * 0.2)
              + (wings_tier * 200)
              + (
                CASE
                  WHEN streak_count < 0 THEN 0
                  WHEN streak_count > 7 THEN 7
                  ELSE streak_count
                END
              ) * 40
              + (
                CASE
                  WHEN quests_completed_total < 0 THEN 0
                  ELSE quests_completed_total
                END
              ) * 2
            ),
            2
          ) AS score,
          ROW_NUMBER() OVER (
            ORDER BY (
              xp
              + (shards * 0.2)
              + (wings_tier * 200)
              + (
                CASE
                  WHEN streak_count < 0 THEN 0
                  WHEN streak_count > 7 THEN 7
                  ELSE streak_count
                END
              ) * 40
              + (
                CASE
                  WHEN quests_completed_total < 0 THEN 0
                  ELSE quests_completed_total
                END
              ) * 2
            ) DESC,
            address ASC
          ) AS rank
        FROM user_stats
        LIMIT ?
      `,
    )
    .all(limit) as unknown as Omit<LeaderboardEntry, "period" | "updatedAt">[];
};

export const getLeaderboard = (request: Request, response: Response): void => {
  const period = resolvePeriod(
    typeof request.query.period === "string" ? request.query.period : undefined,
  );
  const limit = parseLimit(request.query.limit, 10, 1, 100);

  try {
    const db = getDb();
    const rows = db
      .prepare(
        `
          SELECT
            period,
            address,
            score,
            rank,
            updated_at AS updatedAt
          FROM leaderboard_entries
          WHERE period = ?
          ORDER BY rank ASC
          LIMIT ?
        `,
      )
      .all(period, limit) as unknown as LeaderboardEntry[];

    if (rows.length > 0) {
      response.status(200).json(success(rows, "Leaderboard loaded."));
      return;
    }

    const fallbackRows = getLiveLeaderboard(limit).map((row) => ({
      period,
      address: row.address,
      score: row.score,
      rank: row.rank,
      updatedAt: new Date().toISOString(),
    }));

    response.status(200).json(success(fallbackRows, "Leaderboard loaded from live stats."));
  } catch {
    const failure = error("Failed to load leaderboard.", 500);
    response.status(failure.httpCode).json(failure.body);
  }
};

export const getLeaderboardByAddress = (request: Request, response: Response): void => {
  const address = readAddressParam(request);
  if (!address || !isValidAddress(address)) {
    const failure = error("Invalid wallet address.", 400);
    response.status(failure.httpCode).json(failure.body);
    return;
  }

  const period = resolvePeriod(
    typeof request.query.period === "string" ? request.query.period : undefined,
  );

  try {
    ensureUserStatsExists(address);

    const db = getDb();
    const savedEntry = db
      .prepare(
        `
          SELECT
            period,
            address,
            score,
            rank,
            updated_at AS updatedAt
          FROM leaderboard_entries
          WHERE period = ? AND address = ?
        `,
      )
      .get(period, address) as unknown as LeaderboardEntry | undefined;

    if (savedEntry) {
      response.status(200).json(success(savedEntry, "User leaderboard entry loaded."));
      return;
    }

    const fallbackEntry = db
      .prepare(
        `
        WITH ranked AS (
            SELECT
              address,
              ROUND(
                (
                  xp
                  + (shards * 0.2)
                  + (wings_tier * 200)
                  + (
                    CASE
                      WHEN streak_count < 0 THEN 0
                      WHEN streak_count > 7 THEN 7
                      ELSE streak_count
                    END
                  ) * 40
                  + (
                    CASE
                      WHEN quests_completed_total < 0 THEN 0
                      ELSE quests_completed_total
                    END
                  ) * 2
                ),
                2
              ) AS score,
              ROW_NUMBER() OVER (
                ORDER BY (
                  xp
                  + (shards * 0.2)
                  + (wings_tier * 200)
                  + (
                    CASE
                      WHEN streak_count < 0 THEN 0
                      WHEN streak_count > 7 THEN 7
                      ELSE streak_count
                    END
                  ) * 40
                  + (
                    CASE
                      WHEN quests_completed_total < 0 THEN 0
                      ELSE quests_completed_total
                    END
                  ) * 2
                ) DESC,
                address ASC
              ) AS rank
            FROM user_stats
          )
          SELECT address, score, rank
          FROM ranked
          WHERE address = ?
        `,
      )
      .get(address) as unknown as
      | {
          address: string;
          score: number;
          rank: number;
        }
      | undefined;

    if (!fallbackEntry) {
      response.status(200).json(
        success(
          {
            period,
            address,
            score: 0,
            rank: 0,
            updatedAt: new Date().toISOString(),
          },
          "User leaderboard entry loaded.",
        ),
      );
      return;
    }

    response.status(200).json(
      success(
        {
          period,
          address: fallbackEntry.address,
          score: fallbackEntry.score,
          rank: fallbackEntry.rank,
          updatedAt: new Date().toISOString(),
        },
        "User leaderboard entry loaded.",
      ),
    );
  } catch {
    const failure = error("Failed to load user leaderboard entry.", 500);
    response.status(failure.httpCode).json(failure.body);
  }
};
