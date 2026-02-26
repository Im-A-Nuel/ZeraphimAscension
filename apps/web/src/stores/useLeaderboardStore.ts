"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { LeaderboardEntry } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface LeaderboardState {
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  status: Status;
  errorMessage: string | null;
  fetchLeaderboard: (period?: string, limit?: number) => Promise<void>;
  fetchUserRank: (address: string, period?: string) => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  currentUserEntry: null,
  status: "idle",
  errorMessage: null,
  fetchLeaderboard: async (period = "current", limit = 10) => {
    set({ status: "loading", errorMessage: null });
    try {
      const entries = await apiClient.getLeaderboard(period, limit);
      set({ entries, status: "success", errorMessage: null });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to load leaderboard.";
      toast.error(message);
      set({ status: "error", errorMessage: message });
    }
  },
  fetchUserRank: async (address: string, period = "current") => {
    try {
      const entry = await apiClient.getLeaderboardByAddress(address, period);
      set({ currentUserEntry: entry });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to load your rank.";
      toast.error(message);
      set({ errorMessage: message });
    }
  },
}));
