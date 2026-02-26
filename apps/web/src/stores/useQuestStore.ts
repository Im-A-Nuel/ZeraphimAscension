"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { ActivityItem, Quest } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

interface QuestState {
  quests: Quest[];
  selectedQuestId: number | null;
  status: Status;
  errorMessage: string | null;
  fetchQuests: () => Promise<void>;
  selectQuest: (questId: number) => void;
  markQuestCompleted: (questId: number) => void;
  resetQuestCooldown: (questId: number) => void;
  hydrateQuestCooldowns: (activities: ActivityItem[]) => void;
}

export const useQuestStore = create<QuestState>((set) => ({
  quests: [],
  selectedQuestId: null,
  status: "idle",
  errorMessage: null,
  fetchQuests: async () => {
    set({ status: "loading", errorMessage: null });
    try {
      const quests = await apiClient.getQuests();
      set({ quests, status: "success", errorMessage: null });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to load quests.";
      toast.error(message);
      set({ status: "error", errorMessage: message });
    }
  },
  selectQuest: (questId: number) => set({ selectedQuestId: questId }),
  markQuestCompleted: (questId: number) =>
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId
          ? { ...q, completed: true, completedAt: new Date().toISOString() }
          : q,
      ),
    })),
  resetQuestCooldown: (questId: number) =>
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId
          ? { ...q, completed: false, completedAt: undefined }
          : q,
      ),
    })),
  hydrateQuestCooldowns: (activities: ActivityItem[]) =>
    set((state) => {
      if (state.quests.length === 0 || activities.length === 0) {
        return state;
      }

      const latestQuestCompletion = new Map<number, string>();

      activities.forEach((activity) => {
        if (activity.type !== "QUEST") {
          return;
        }

        const questIdRaw = activity.payload.quest_id ?? activity.payload.questId;
        const questId = Number(questIdRaw);
        if (!Number.isInteger(questId) || questId < 0) {
          return;
        }

        const previous = latestQuestCompletion.get(questId);
        if (!previous || new Date(activity.createdAt).getTime() > new Date(previous).getTime()) {
          latestQuestCompletion.set(questId, activity.createdAt);
        }
      });

      const nowMs = Date.now();
      const quests = state.quests.map((quest) => {
        const completedAt = latestQuestCompletion.get(quest.id);
        if (!completedAt) {
          return quest;
        }

        const elapsedSeconds = Math.floor((nowMs - new Date(completedAt).getTime()) / 1000);
        const isOnCooldown = Number.isFinite(elapsedSeconds) && elapsedSeconds < quest.cooldownSeconds;

        if (isOnCooldown) {
          return {
            ...quest,
            completed: true,
            completedAt,
          };
        }

        return {
          ...quest,
          completed: false,
          completedAt: undefined,
        };
      });

      return { quests };
    }),
}));
