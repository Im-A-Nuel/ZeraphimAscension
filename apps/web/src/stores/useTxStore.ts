"use client";

import { create } from "zustand";
import { onchainExecutor } from "@/lib/onchain";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TxResult } from "@/types";

export type TxStatus = "idle" | "pending" | "success" | "error";

interface TxToastEvent {
  id: string;
  status: TxStatus;
  message: string;
}

interface TxState {
  status: TxStatus;
  txDigest: string | null;
  errorMessage: string | null;
  lastToastEvent: TxToastEvent | null;
  completeQuest: (questId: number) => Promise<TxResult | null>;
  openLootbox: () => Promise<TxResult | null>;
  mintWings: () => Promise<TxResult | null>;
  evolveWings: () => Promise<TxResult | null>;
}

const TX_PENDING_TIMEOUT_MS = 45_000;

const emit = (
  set: (
    partial:
      | Partial<TxState>
      | ((state: TxState) => Partial<TxState>),
  ) => void,
  status: TxStatus,
  message: string,
  txDigest: string | null = null,
): void => {
  set({
    status,
    txDigest,
    errorMessage: status === "error" ? message : null,
    lastToastEvent: {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      status,
      message,
    },
  });
};

const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  try {
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeoutHandle !== null) {
      clearTimeout(timeoutHandle);
    }
  }
};

const mapOnchainErrorMessage = (rawMessage: string): string => {
  const message = rawMessage.toLowerCase();

  if (message.includes("transaction rejected")) {
    return "Transaction rejected in OneWallet.";
  }

  if (message.includes("abort") && message.match(/\b4\b/)) {
    return "Quest cooldown is still active. Wait until cooldown finishes.";
  }

  if (message.includes("abort") && message.match(/\b5\b/)) {
    return "No loot tickets available.";
  }

  if (message.includes("abort") && message.match(/\b6\b/)) {
    return "Wings already minted.";
  }

  if (message.includes("abort") && message.match(/\b7\b/)) {
    return "Mint wings first.";
  }

  if (message.includes("abort") && message.match(/\b8\b/)) {
    return "Wings already at maximum tier.";
  }

  if (message.includes("abort") && message.match(/\b9\b/)) {
    return "Insufficient shards for this action.";
  }

  if (message.includes("abort") && message.match(/\b10\b/)) {
    return "Evolution requirements are not met yet.";
  }

  if (message.includes("wallet address is invalid")) {
    return "Wallet address is invalid.";
  }

  if (message.includes("next_public_package_address")) {
    return "Package address is not configured.";
  }

  if (message.includes("did not respond in time") || message.includes("timeout")) {
    return "OneWallet did not respond in time. Re-open wallet popup and retry.";
  }

  return rawMessage;
};

const execute = async (
  set: (
    partial:
      | Partial<TxState>
      | ((state: TxState) => Partial<TxState>),
  ) => void,
  get: () => TxState,
  action: () => Promise<TxResult>,
  pendingMessage: string,
): Promise<TxResult | null> => {
  if (get().status === "pending") {
    return null;
  }

  emit(set, "pending", pendingMessage);
  try {
    const result = await withTimeout(
      action(),
      TX_PENDING_TIMEOUT_MS,
      "OneWallet did not respond in time. Please check wallet popup and retry.",
    );
    emit(set, "success", result.message, result.digest);
    return result;
  } catch (issue) {
    const message = issue instanceof Error ? issue.message : "Transaction failed.";
    emit(set, "error", mapOnchainErrorMessage(message));
    return null;
  }
};

const buildExecutorContext = (): { address: string; walletMode: "mock" | "onewallet" } => {
  const { address, walletType } = useAuthStore.getState();
  if (!address) {
    throw new Error("Wallet is not connected.");
  }

  return {
    address,
    walletMode: walletType,
  };
};

export const useTxStore = create<TxState>((set, get) => ({
  status: "idle",
  txDigest: null,
  errorMessage: null,
  lastToastEvent: null,
  completeQuest: (questId: number) =>
    execute(
      set,
      get,
      () => onchainExecutor.completeQuest(buildExecutorContext(), questId),
      "Submitting quest transaction.",
    ),
  openLootbox: () =>
    execute(
      set,
      get,
      () => onchainExecutor.openLootbox(buildExecutorContext()),
      "Opening loot box transaction.",
    ),
  mintWings: () =>
    execute(
      set,
      get,
      () => onchainExecutor.mintWings(buildExecutorContext()),
      "Submitting wings mint transaction.",
    ),
  evolveWings: () =>
    execute(
      set,
      get,
      () => onchainExecutor.evolveWings(buildExecutorContext()),
      "Submitting wings evolve transaction.",
    ),
}));
