"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { ActivityItem } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface ActivityState {
  items: ActivityItem[];
  status: Status;
  errorMessage: string | null;
  fetchRecent: (limit?: number) => Promise<void>;
  fetchUserActivities: (address: string, limit?: number) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set) => ({
  items: [],
  status: "idle",
  errorMessage: null,
  fetchRecent: async (limit = 20) => {
    set({ status: "loading", errorMessage: null });
    try {
      const items = await apiClient.getRecentActivity(limit);
      set({ items, status: "success", errorMessage: null });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to load activity.";
      toast.error(message);
      set({ status: "error", errorMessage: message });
    }
  },
  fetchUserActivities: async (address: string, limit = 20) => {
    set({ status: "loading", errorMessage: null });
    try {
      const items = await apiClient.getUserActivities(address, limit);
      set({ items, status: "success", errorMessage: null });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to load activity.";
      toast.error(message);
      set({ status: "error", errorMessage: message });
    }
  },
}));
