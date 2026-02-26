import { appConfig } from "../config/index";
import type { ActivityItem, ApiResponse, LeaderboardEntry, Quest, UserStats } from "@/types";

type HttpMethod = "GET" | "POST";

const readBody = async <T>(response: Response): Promise<T> => {
  const json = (await response.json()) as ApiResponse<T>;
  if (json.status !== "success") {
    throw new Error(json.message || "Request failed.");
  }
  if (json.data === null) {
    throw new Error(json.message || "No response data.");
  }
  return json.data;
};

const request = async <T>(path: string, method: HttpMethod = "GET"): Promise<T> => {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const fallbackMessage = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as ApiResponse<unknown>;
      throw new Error(body.message || fallbackMessage);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  return readBody<T>(response);
};

export const apiClient = {
  getQuests: (): Promise<Quest[]> => request<Quest[]>("/quests"),
  getUserStats: (address: string): Promise<UserStats> =>
    request<UserStats>(`/users/${address}`),
  getUserActivities: (address: string, limit = 20): Promise<ActivityItem[]> =>
    request<ActivityItem[]>(`/users/${address}/activities?limit=${limit}`),
  getRecentActivity: (limit = 20): Promise<ActivityItem[]> =>
    request<ActivityItem[]>(`/activity?limit=${limit}`),
  getLeaderboard: (period = "current", limit = 10): Promise<LeaderboardEntry[]> =>
    request<LeaderboardEntry[]>(`/leaderboard?period=${period}&limit=${limit}`),
  getLeaderboardByAddress: (
    address: string,
    period = "current",
  ): Promise<LeaderboardEntry> => request<LeaderboardEntry>(`/leaderboard/${address}?period=${period}`),
};
