import { getDb } from "./connection.js";

export const runMigrations = (): void => {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      address TEXT PRIMARY KEY REFERENCES users(address) ON DELETE CASCADE,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 0,
      shards INTEGER NOT NULL DEFAULT 0,
      loot_tickets INTEGER NOT NULL DEFAULT 0,
      quests_completed_total INTEGER NOT NULL DEFAULT 0,
      streak_count INTEGER NOT NULL DEFAULT 0,
      wings_tier INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
      type TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      period TEXT NOT NULL,
      address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
      score REAL NOT NULL,
      rank INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (period, address)
    );

    CREATE TABLE IF NOT EXISTS indexer_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      cursor TEXT,
      last_synced_at TEXT NOT NULL
    );
  `);
};
