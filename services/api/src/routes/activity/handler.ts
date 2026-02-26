import type { Request, Response } from "express";
import { getDb } from "../../infra/index.js";
import { error, parseLimit, success } from "../../lib/index.js";
import type { ActivityItem } from "../../types/index.js";

export const getRecentActivity = (request: Request, response: Response): void => {
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
          ORDER BY created_at DESC
          LIMIT ?
        `,
      )
      .all(limit) as Array<{
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

    response.status(200).json(success(data, "Recent activity loaded."));
  } catch {
    const failure = error("Failed to load recent activity.", 500);
    response.status(failure.httpCode).json(failure.body);
  }
};
