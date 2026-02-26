"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { UserStats } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface UserState {
  user: UserStats | null;
  status: Status;
  errorMessage: string | null;
  fetchUserStats: (address: string) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  status: "idle",
  errorMessage: null,
  fetchUserStats: async (address: string) => {
    set({ status: "loading", errorMessage: null });
    try {
      const user = await apiClient.getUserStats(address);
      set({ user, status: "success", errorMessage: null });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to load user stats.";
      toast.error(message);
      set({ status: "error", errorMessage: message });
    }
  },
  reset: () =>
    set({
      user: null,
      status: "idle",
      errorMessage: null,
    }),
}));
