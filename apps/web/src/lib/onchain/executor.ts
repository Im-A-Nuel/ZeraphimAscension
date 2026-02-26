import { SuiClient } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { appConfig } from "@/lib/config";
import {
  getOneWallet,
  isWalletNetworkMismatch,
  readWalletNetwork,
  type OneWalletAPI,
  type WalletTxExecutionResult,
} from "@/lib/onewallet";
import type { TxResult } from "@/types";

type WalletMode = "mock" | "onewallet";

interface ExecutorContext {
  address: string;
  walletMode: WalletMode;
}

const DEFAULT_GAS_BUDGET = 30_000_000;
const USER_STATE_TYPE_SUFFIX = "::quest::UserState";
const SYSTEM_CLOCK_OBJECT_ID = "0x6";
const RETRY_COUNT = 6;
const RETRY_DELAY_MS = 1_000;

let onechainClient: SuiClient | null = null;

const getClient = (): SuiClient => {
  if (onechainClient) {
    return onechainClient;
  }

  onechainClient = new SuiClient({
    url: appConfig.onechainRpcUrl,
  });

  return onechainClient;
};

const randomDigest = (): string =>
  `0x${crypto.randomUUID().replaceAll("-", "").slice(0, 40)}`;

const wait = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const ensureAddress = (address: string): string => {
  const normalized = address.trim();
  if (!/^0x[a-fA-F0-9]+$/.test(normalized)) {
    throw new Error("Wallet address is invalid.");
  }
  return normalized;
};

const ensurePackageId = (): string => {
  const packageId = appConfig.packageId.trim();
  if (!/^0x[a-fA-F0-9]+$/.test(packageId) || packageId === "0x0") {
    throw new Error("NEXT_PUBLIC_PACKAGE_ADDRESS is not configured.");
  }
  return packageId;
};

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

const resolveWalletChains = (): string[] => {
  const network = normalizeExpectedNetwork(appConfig.network);
  const preferredChain = `onechain:${network}`;
  return Array.from(
    new Set([
      preferredChain,
      preferredChain.replace(":", "_"),
      preferredChain.replace(":", " "),
      preferredChain.toUpperCase().replace(":", "_"),
      preferredChain.toUpperCase().replace(":", " "),
    ]),
  );
};

const pickDigest = (result: WalletTxExecutionResult): string | null => {
  if (typeof result.digest === "string" && result.digest.length > 0) {
    return result.digest;
  }

  if (typeof result.hash === "string" && result.hash.length > 0) {
    return result.hash;
  }

  if (typeof result.txDigest === "string" && result.txDigest.length > 0) {
    return result.txDigest;
  }

  if (typeof result.transactionHash === "string" && result.transactionHash.length > 0) {
    return result.transactionHash;
  }

  const txDigest = result.effects?.transactionDigest;
  if (typeof txDigest === "string" && txDigest.length > 0) {
    return txDigest;
  }

  return null;
};

const getWalletOrThrow = (): OneWalletAPI => {
  const wallet = getOneWallet();
  if (!wallet) {
    throw new Error("OneWallet extension not found.");
  }
  return wallet;
};

const assertWalletNetwork = async (wallet: OneWalletAPI): Promise<void> => {
  const walletNetwork = await readWalletNetwork(wallet);
  const expectedNetwork = normalizeExpectedNetwork(appConfig.network);
  const expectedNetworkLabel = `onechain ${expectedNetwork}`;

  if (isWalletNetworkMismatch(walletNetwork, expectedNetwork)) {
    throw new Error(
      `OneWallet is on ${walletNetwork}. Switch to ${expectedNetworkLabel} in OneWallet, then try again.`,
    );
  }
};

const REJECTED_CODES = new Set(["4001", "ACTION_REJECTED", "USER_REJECTED", "REJECTED_BY_USER"]);
const REJECTED_PATTERNS =
  /reject|rejected|denied|cancelled|canceled|declined|abort|closed by user/i;

const isUserRejected = (issue: unknown, depth = 0): boolean => {
  if (depth > 3 || issue === null || issue === undefined) {
    return false;
  }

  if (typeof issue === "string") {
    return REJECTED_PATTERNS.test(issue);
  }

  if (typeof issue === "number") {
    return issue === 4001;
  }

  if (issue instanceof Error) {
    if (REJECTED_PATTERNS.test(issue.message) || REJECTED_PATTERNS.test(issue.name)) {
      return true;
    }

    const errorRecord = issue as Error & { cause?: unknown; code?: unknown };
    if (REJECTED_CODES.has(String(errorRecord.code ?? ""))) {
      return true;
    }

    return isUserRejected(errorRecord.cause, depth + 1);
  }

  if (typeof issue === "object") {
    const record = issue as Record<string, unknown>;

    if (REJECTED_CODES.has(String(record.code ?? ""))) {
      return true;
    }

    const possibleMessages = [record.message, record.error, record.reason, record.details];
    if (possibleMessages.some((value) => typeof value === "string" && REJECTED_PATTERNS.test(value))) {
      return true;
    }

    return (
      isUserRejected(record.cause, depth + 1) ||
      isUserRejected(record.data, depth + 1) ||
      isUserRejected(record.error, depth + 1)
    );
  }

  return false;
};

const executeWithWallet = async (
  wallet: OneWalletAPI,
  transaction: Transaction,
): Promise<WalletTxExecutionResult> => {
  await assertWalletNetwork(wallet);

  const chains = resolveWalletChains();
  const options = {
    showEffects: true,
    showObjectChanges: true,
    showEvents: true,
  };
  let latestError: unknown = null;

  if (wallet.signAndExecuteTransaction) {
    for (const chain of chains) {
      try {
        return await wallet.signAndExecuteTransaction({
          transaction,
          chain,
          options,
        });
      } catch (issue) {
        if (isUserRejected(issue)) {
          throw new Error("Transaction rejected in OneWallet.");
        }
        latestError = issue;
      }

      try {
        return await wallet.signAndExecuteTransaction({
          transactionBlock: transaction,
          chain,
          options,
        });
      } catch (issue) {
        if (isUserRejected(issue)) {
          throw new Error("Transaction rejected in OneWallet.");
        }
        latestError = issue;
      }
    }
  }

  if (wallet.signAndExecuteTransactionBlock) {
    for (const chain of chains) {
      try {
        return await wallet.signAndExecuteTransactionBlock({
          transactionBlock: transaction,
          chain,
          options,
        });
      } catch (issue) {
        if (isUserRejected(issue)) {
          throw new Error("Transaction rejected in OneWallet.");
        }
        latestError = issue;
      }

      try {
        return await wallet.signAndExecuteTransactionBlock({
          transaction,
          chain,
          options,
        });
      } catch (issue) {
        if (isUserRejected(issue)) {
          throw new Error("Transaction rejected in OneWallet.");
        }
        latestError = issue;
      }
    }
  }

  if (wallet.signAndSubmitTransaction) {
    for (const chain of chains) {
      try {
        return await wallet.signAndSubmitTransaction({
          transaction,
          chain,
          options,
        });
      } catch (issue) {
        if (isUserRejected(issue)) {
          throw new Error("Transaction rejected in OneWallet.");
        }
        latestError = issue;
      }

      try {
        return await wallet.signAndSubmitTransaction({
          transactionBlock: transaction,
          chain,
          options,
        });
      } catch (issue) {
        if (isUserRejected(issue)) {
          throw new Error("Transaction rejected in OneWallet.");
        }
        latestError = issue;
      }
    }

    try {
      return await wallet.signAndSubmitTransaction(transaction);
    } catch (issue) {
      if (isUserRejected(issue)) {
        throw new Error("Transaction rejected in OneWallet.");
      }
      latestError = issue;
    }
  }

  if (latestError instanceof Error) {
    throw latestError;
  }

  throw new Error("Wallet does not support transaction execution.");
};

const buildTransaction = async (
  sender: string,
  build: (tx: Transaction) => void,
): Promise<Transaction> => {
  const tx = new Transaction();
  tx.setSender(sender);
  tx.setGasBudget(DEFAULT_GAS_BUDGET);
  build(tx);
  await tx.build({ client: getClient() });
  return tx;
};

const findUserStateObjectId = async (address: string): Promise<string | null> => {
  const packageId = ensurePackageId();
  const owner = ensureAddress(address);
  const client = getClient();
  const structType = `${packageId}::quest::UserState`;

  const queryWithFilter = async () =>
    client.getOwnedObjects({
      owner,
      filter: { StructType: structType },
      options: { showType: true },
      limit: 50,
    });

  const queryFallback = async () =>
    client.getOwnedObjects({
      owner,
      options: { showType: true },
      limit: 50,
    });

  const response = await queryWithFilter().catch(queryFallback);
  const match = response.data.find((item) => {
    const objectType = item.data?.type;
    return typeof objectType === "string" && objectType.endsWith(USER_STATE_TYPE_SUFFIX);
  });

  return match?.data?.objectId ?? null;
};

const waitForUserStateObjectId = async (address: string): Promise<string | null> => {
  for (let attempt = 0; attempt < RETRY_COUNT; attempt += 1) {
    const objectId = await findUserStateObjectId(address);
    if (objectId) {
      return objectId;
    }
    await wait(RETRY_DELAY_MS);
  }

  return null;
};

const initUserStateIfMissing = async (wallet: OneWalletAPI, address: string): Promise<string> => {
  const existingObjectId = await findUserStateObjectId(address);
  if (existingObjectId) {
    return existingObjectId;
  }

  const packageId = ensurePackageId();
  const tx = await buildTransaction(address, (draft) => {
    draft.moveCall({
      target: `${packageId}::quest::init_user`,
    });
  });

  const initResult = await executeWithWallet(wallet, tx);
  const digest = pickDigest(initResult);
  if (!digest) {
    throw new Error("init_user transaction submitted but digest was not returned by wallet.");
  }

  const resolvedObjectId = await waitForUserStateObjectId(address);
  if (!resolvedObjectId) {
    throw new Error("UserState object was not found after init_user transaction.");
  }

  return resolvedObjectId;
};

const runMoveCall = async (
  address: string,
  build: (tx: Transaction, userStateObjectId: string) => void,
): Promise<string> => {
  const wallet = getWalletOrThrow();
  const owner = ensureAddress(address);
  const userStateObjectId = await initUserStateIfMissing(wallet, owner);

  const tx = await buildTransaction(owner, (draft) => {
    build(draft, userStateObjectId);
  });

  const result = await executeWithWallet(wallet, tx);
  const digest = pickDigest(result);
  if (!digest) {
    throw new Error("Wallet did not return transaction digest.");
  }

  return digest;
};

const executeMock = async (message: string): Promise<TxResult> => {
  await wait(900);
  return {
    digest: randomDigest(),
    message: `${message} (simulated with demo wallet).`,
  };
};

const requireContext = (context: ExecutorContext): { address: string; walletMode: WalletMode } => {
  const address = ensureAddress(context.address);
  return {
    address,
    walletMode: context.walletMode,
  };
};

export const onchainExecutor = {
  initUser: async (context: ExecutorContext): Promise<TxResult> => {
    const { address, walletMode } = requireContext(context);
    if (walletMode === "mock") {
      return executeMock("User initialized on-chain.");
    }

    const wallet = getWalletOrThrow();
    const existingObjectId = await findUserStateObjectId(address);
    if (existingObjectId) {
      return {
        digest: existingObjectId,
        message: "User state is already initialized on-chain.",
      };
    }

    const packageId = ensurePackageId();
    const tx = await buildTransaction(address, (draft) => {
      draft.moveCall({
        target: `${packageId}::quest::init_user`,
      });
    });
    const result = await executeWithWallet(wallet, tx);
    const digest = pickDigest(result);
    if (!digest) {
      throw new Error("Failed to read init transaction digest.");
    }

    return {
      digest,
      message: "User initialized on-chain.",
    };
  },

  completeQuest: async (context: ExecutorContext, questId: number): Promise<TxResult> => {
    const { address, walletMode } = requireContext(context);
    if (walletMode === "mock") {
      return executeMock(`Quest ${questId} completed on-chain.`);
    }

    const packageId = ensurePackageId();
    const digest = await runMoveCall(address, (tx, userStateObjectId) => {
      tx.moveCall({
        target: `${packageId}::quest::complete_quest`,
        arguments: [
          tx.object(userStateObjectId),
          tx.pure.u64(questId),
          tx.object(SYSTEM_CLOCK_OBJECT_ID),
        ],
      });
    });

    return {
      digest,
      message: `Quest ${questId} completed on-chain.`,
    };
  },

  openLootbox: async (context: ExecutorContext): Promise<TxResult> => {
    const { address, walletMode } = requireContext(context);
    if (walletMode === "mock") {
      return executeMock("Loot box opened on-chain.");
    }

    const packageId = ensurePackageId();
    const digest = await runMoveCall(address, (tx, userStateObjectId) => {
      tx.moveCall({
        target: `${packageId}::lootbox::open_lootbox`,
        arguments: [tx.object(userStateObjectId), tx.object(SYSTEM_CLOCK_OBJECT_ID)],
      });
    });

    return {
      digest,
      message: "Loot box opened on-chain.",
    };
  },

  mintWings: async (context: ExecutorContext): Promise<TxResult> => {
    const { address, walletMode } = requireContext(context);
    if (walletMode === "mock") {
      return executeMock("Wings minted on-chain.");
    }

    const packageId = ensurePackageId();
    const digest = await runMoveCall(address, (tx, userStateObjectId) => {
      tx.moveCall({
        target: `${packageId}::wings::mint_wings`,
        arguments: [tx.object(userStateObjectId), tx.object(SYSTEM_CLOCK_OBJECT_ID)],
      });
    });

    return {
      digest,
      message: "Wings minted on-chain.",
    };
  },

  evolveWings: async (context: ExecutorContext): Promise<TxResult> => {
    const { address, walletMode } = requireContext(context);
    if (walletMode === "mock") {
      return executeMock("Wings evolved on-chain.");
    }

    const packageId = ensurePackageId();
    const digest = await runMoveCall(address, (tx, userStateObjectId) => {
      tx.moveCall({
        target: `${packageId}::wings::evolve_wings`,
        arguments: [tx.object(userStateObjectId), tx.object(SYSTEM_CLOCK_OBJECT_ID)],
      });
    });

    return {
      digest,
      message: "Wings evolved on-chain.",
    };
  },
};
