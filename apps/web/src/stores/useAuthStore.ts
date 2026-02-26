"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appConfig } from "@/lib/config";
import {
  extractWalletAddress,
  extractWalletNetwork,
  isWalletNetworkMismatch,
  readWalletNetwork,
  resolveConnectedWalletAddress,
  waitForOneWallet,
} from "@/lib/onewallet";

export interface WalletOption {
  id: string;
  label: string;
  address: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "oracle-runner",
    label: "Oracle Runner",
    address: "0x08fe81e0a0ac4f9cbb938adced62333a00000000",
  },
  {
    id: "ascendant-alpha",
    label: "Ascendant Alpha",
    address: "0x1c103cebc31ff3c4fd769cdc132ee4e2d486c3f1",
  },
  {
    id: "valor-node",
    label: "Valor Node",
    address: "0x7e3ee4aba4b9341c0398c06882b502d23314df1c",
  },
  {
    id: "wisdom-sentinel",
    label: "Wisdom Sentinel",
    address: "0x6f7cae2d8f8dd26d6432207bb77f6da295f1f88a",
  },
  {
    id: "grace-vanguard",
    label: "Grace Vanguard",
    address: "0x5bc6d6a36d9ac8655b245fbc4d8a1a0ff98e7229",
  },
];

const defaultWallet = walletOptions[0];

const normalizeExpectedNetwork = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return "testnet";
  }

  if (normalized.includes("mainnet")) {
    return "mainnet";
  }

  if (normalized.includes("testnet")) {
    return "testnet";
  }

  if (normalized.includes("devnet")) {
    return "devnet";
  }

  if (normalized.includes("localnet") || normalized.includes("localhost") || normalized === "local") {
    return "localnet";
  }

  if (normalized.includes(":")) {
    const parts = normalized.split(":");
    return normalizeExpectedNetwork(parts[parts.length - 1] ?? "");
  }

  return normalized;
};

const expectedNetwork = normalizeExpectedNetwork(appConfig.network);
const expectedNetworkLabel = `onechain ${expectedNetwork}`;
const enableMockWallet = appConfig.enableMockWallet;
const preferredChain = `onechain:${expectedNetwork}`;
type ConnectPayload = {
  chain?: string;
  network?: string;
};
const chainAliases = Array.from(
  new Set([
    preferredChain,
    preferredChain.replace(":", "_"),
    preferredChain.replace(":", " "),
    preferredChain.toUpperCase().replace(":", "_"),
    preferredChain.toUpperCase().replace(":", " "),
  ]),
);
const connectPayloads: ConnectPayload[] = chainAliases.flatMap((chain) => [
  { chain, network: chain },
  { chain },
  { network: chain },
]);

const findWallet = (walletId: string): WalletOption =>
  walletOptions.find((wallet) => wallet.id === walletId) ?? defaultWallet;

interface AuthState {
  wallets: WalletOption[];
  selectedWalletId: string;
  address: string | null;
  walletNetwork: string | null;
  isConnected: boolean;
  status: "idle" | "loading" | "success" | "error";
  walletType: "mock" | "onewallet";
  connect: () => void;
  disconnect: () => void;
  selectWallet: (walletId: string) => void;
  switchWalletType: (type: "mock" | "onewallet") => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectOneWallet: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      wallets: walletOptions,
      selectedWalletId: defaultWallet.id,
      address: null,
      walletNetwork: null,
      isConnected: false,
      status: "idle",
      walletType: enableMockWallet ? "mock" : "onewallet",
      connect: () => {
        if (!enableMockWallet) {
          set({
            status: "error",
          });
          return;
        }

        const selectedWallet = findWallet(get().selectedWalletId);
        set({
          address: selectedWallet.address,
          walletNetwork: null,
          isConnected: true,
          status: "success",
        });
      },
      disconnect: () => {
        set({
          address: null,
          walletNetwork: null,
          isConnected: false,
          status: "idle",
        });
      },
      selectWallet: (walletId: string) => {
        const selectedWallet = findWallet(walletId);
        const currentState = get();

        if (currentState.isConnected) {
          set({
            selectedWalletId: selectedWallet.id,
            address: selectedWallet.address,
            status: "success",
          });
        } else {
          set({
            selectedWalletId: selectedWallet.id,
          });
        }
      },
      connectWallet: async () => {
        set({ status: "loading" });
        if (get().walletType === "onewallet" || !enableMockWallet) {
          await get().connectOneWallet();
          return;
        }

        get().connect();
      },
      disconnectWallet: () => {
        if (get().walletType === "onewallet") {
          void waitForOneWallet(1500)
            .then((wallet) => wallet.disconnect?.())
            .catch(() => null);
        }
        get().disconnect();
      },
      switchWalletType: (type: "mock" | "onewallet") => {
        const nextType = !enableMockWallet && type === "mock" ? "onewallet" : type;
        const currentState = get();
        if (currentState.isConnected) {
          get().disconnect();
        }
        set({ walletType: nextType });
      },
      connectOneWallet: async () => {
        set({ status: "loading" });
        try {
          const oneWallet = await waitForOneWallet(5000);

          let result: unknown = null;
          let connected = false;

          for (const payload of connectPayloads) {
            try {
              result = await oneWallet.connect(payload);
              connected = true;
              break;
            } catch {
              // Try next payload shape for compatibility with wallet API variants.
            }
          }

          if (!connected) {
            throw new Error(
              "Failed to request OneChain permission from OneWallet. Please ensure OneWallet is set to OneChain Testnet and try again.",
            );
          }

          let address = await resolveConnectedWalletAddress(oneWallet, result);
          if (!address) {
            // Some wallet versions only expose account after a second lightweight connect call.
            const reconnectResult = await oneWallet.connect().catch(() => null);
            address = await resolveConnectedWalletAddress(oneWallet, reconnectResult);
          }

          if (!address) {
            throw new Error(
              "Permission granted, but wallet address is unavailable. Please unlock/select an account in OneWallet and try again.",
            );
          }

          const walletNetwork = await readWalletNetwork(oneWallet);
          if (isWalletNetworkMismatch(walletNetwork, expectedNetwork)) {
            throw new Error(
              `OneWallet is on ${walletNetwork}. Switch to ${expectedNetworkLabel} in OneWallet, then reconnect.`,
            );
          }

          set({
            address,
            walletNetwork,
            isConnected: true,
            status: "success",
            walletType: "onewallet",
          });

          oneWallet.onAccountChange?.((account) => {
            const nextAddress = extractWalletAddress(account);
            if (!nextAddress) {
              return;
            }

            set((state) => ({
              address: nextAddress,
              walletNetwork: state.walletNetwork,
              isConnected: true,
              status: "success",
              walletType: "onewallet",
            }));
          });

          oneWallet.onNetworkChange?.((network) => {
            const nextNetwork = extractWalletNetwork(network);
            if (!nextNetwork) {
              return;
            }

            set((state) => ({
              walletNetwork: nextNetwork,
              status: isWalletNetworkMismatch(nextNetwork, expectedNetwork) ? "error" : state.status,
            }));
          });
        } catch (error) {
          set({ status: "error", address: null, isConnected: false, walletNetwork: null });
          const errorMessage = error instanceof Error ? error.message : "Failed to connect OneWallet";
          console.error("OneWallet connection failed:", errorMessage);
          throw new Error(errorMessage);
        }
      },
    }),
    {
      name: "zeraphim-auth",
      partialize: (state) => ({
        selectedWalletId: state.selectedWalletId,
        address: state.address,
        walletNetwork: state.walletNetwork,
        isConnected: state.isConnected,
        status: state.status,
        walletType: state.walletType,
      }),
      merge: (persistedState, currentState) => {
        const nextState = {
          ...currentState,
          ...(persistedState as Partial<AuthState>),
        };

        if (!enableMockWallet && nextState.walletType === "mock") {
          return {
            ...nextState,
            walletType: "onewallet" as const,
          };
        }

        return nextState;
      },
    }
  )
);
