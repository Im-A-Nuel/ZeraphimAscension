export type ApiStatus = "success" | "error";

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T | null;
}

export interface Quest {
  id: number;
  path: "valor" | "wisdom" | "grace";
  title: string;
  description: string;
  cooldownSeconds: number;
  xpReward: number;
  shardsReward: number;
  lootTicketReward: number;
}

export interface UserStats {
  address: string;
  xp: number;
  level: number;
  shards: number;
  lootTickets: number;
  questsCompletedTotal: number;
  streakCount: number;
  wingsTier: number;
  updatedAt: string;
}

export type ActivityType = "QUEST" | "LOOT" | "MINT" | "EVOLVE";

export interface ActivityItem {
  id: string;
  address: string;
  type: ActivityType;
  txHash: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface LeaderboardEntry {
  period: string;
  address: string;
  score: number;
  rank: number;
  updatedAt: string;
}

export interface OnchainEvent {
  cursor: string;
  txDigest: string;
  eventType: string;
  address: string;
  payload: Record<string, unknown>;
  timestampMs: number;
}

export interface ServiceResult<T> {
  ok: boolean;
  message: string;
  data: T | null;
  code?: number;
}
