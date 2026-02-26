export interface OneWalletAPI {
  connect: (input?: unknown) => Promise<unknown>;
  disconnect?: () => Promise<void>;
  isConnected?: () => Promise<boolean>;
  getAccounts?: () => Promise<unknown>;
  requestAccounts?: () => Promise<unknown>;
  getAccount?: () => Promise<unknown>;
  account?: (() => Promise<unknown>) | unknown;
  getAddress?: () => Promise<unknown>;
  accounts?: unknown;
  address?: unknown;
  selectedAddress?: unknown;
  signAndSubmitTransaction?: (input: unknown) => Promise<WalletTxExecutionResult>;
  signAndExecuteTransaction?: (input: unknown) => Promise<WalletTxExecutionResult>;
  signAndExecuteTransactionBlock?: (input: unknown) => Promise<WalletTxExecutionResult>;
  network?: (() => Promise<unknown>) | unknown;
  chain?: unknown;
  onAccountChange?: (callback: (account: string | null) => void) => void;
  onNetworkChange?: (callback: (network: unknown) => void) => void;
}

export interface WalletTxExecutionResult {
  digest?: string;
  hash?: string;
  txDigest?: string;
  transactionHash?: string;
  effects?: {
    transactionDigest?: string;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    onewallet?: OneWalletAPI;
    OneWallet?: OneWalletAPI;
    oneWallet?: OneWalletAPI;
    suiWallet?: OneWalletAPI;
    onechain?: OneWalletAPI;
    oneChain?: OneWalletAPI;
    sui?: OneWalletAPI;
  }
}

const hasTxSigningCapability = (wallet: Partial<OneWalletAPI>): boolean => {
  return (
    typeof wallet.signAndExecuteTransaction === "function" ||
    typeof wallet.signAndExecuteTransactionBlock === "function" ||
    typeof wallet.signAndSubmitTransaction === "function"
  );
};

const isWalletLike = (value: unknown): value is OneWalletAPI => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<OneWalletAPI>;
  if (typeof candidate.connect !== "function") {
    return false;
  }

  return hasTxSigningCapability(candidate) || typeof candidate.disconnect === "function";
};

const nestedKeys = ["wallet", "provider", "suiWallet", "oneWallet", "onechain", "oneChain"] as const;

const preferredAddressKeys = [
  "address",
  "selectedAddress",
  "walletAddress",
  "publicAddress",
  "account",
  "accounts",
  "data",
  "result",
] as const;

const preferredNetworkKeys = [
  "network",
  "chain",
  "networkName",
  "chainId",
  "name",
  "id",
  "value",
  "data",
  "result",
] as const;

const normalizeAddress = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalizedHex = /^0x/i.test(trimmed) ? trimmed.slice(2) : trimmed;
  if (!/^[a-fA-F0-9]{8,128}$/.test(normalizedHex)) {
    return null;
  }

  return `0x${normalizedHex.toLowerCase()}`;
};

const normalizeNetwork = (value: string): string | null => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("mainnet")) {
    return "mainnet";
  }

  if (trimmed.includes("testnet")) {
    return "testnet";
  }

  if (trimmed.includes("devnet")) {
    return "devnet";
  }

  if (trimmed.includes("localnet") || trimmed.includes("localhost") || trimmed === "local") {
    return "localnet";
  }

  if (trimmed.includes(":")) {
    const [, suffix] = trimmed.split(":");
    if (suffix) {
      const normalizedSuffix = normalizeNetwork(suffix);
      if (normalizedSuffix) {
        return normalizedSuffix;
      }
    }
  }

  return trimmed;
};

export const extractWalletAddress = (value: unknown, depth = 0): string | null => {
  if (depth > 4 || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return normalizeAddress(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = extractWalletAddress(item, depth + 1);
      if (resolved) {
        return resolved;
      }
    }
    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of preferredAddressKeys) {
    if (key in record) {
      const resolved = extractWalletAddress(record[key], depth + 1);
      if (resolved) {
        return resolved;
      }
    }
  }

  for (const nested of Object.values(record)) {
    const resolved = extractWalletAddress(nested, depth + 1);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

export const extractWalletNetwork = (value: unknown, depth = 0): string | null => {
  if (depth > 4 || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return normalizeNetwork(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = extractWalletNetwork(item, depth + 1);
      if (resolved) {
        return resolved;
      }
    }
    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of preferredNetworkKeys) {
    if (key in record) {
      const resolved = extractWalletNetwork(record[key], depth + 1);
      if (resolved) {
        return resolved;
      }
    }
  }

  for (const nested of Object.values(record)) {
    const resolved = extractWalletNetwork(nested, depth + 1);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

const pickNestedWallet = (value: unknown): OneWalletAPI | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  for (const key of nestedKeys) {
    const nested = source[key];
    if (isWalletLike(nested)) {
      return nested;
    }
  }

  return null;
};

export const getOneWallet = (): OneWalletAPI | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const directCandidates: unknown[] = [
    window.onechain,
    window.oneChain,
    window.onewallet,
    window.OneWallet,
    window.oneWallet,
    window.suiWallet,
    window.sui,
  ];

  for (const candidate of directCandidates) {
    if (isWalletLike(candidate)) {
      return candidate;
    }

    const nested = pickNestedWallet(candidate);
    if (nested) {
      return nested;
    }
  }

  // Heuristic fallback for providers injected under unexpected keys.
  const scope = window as unknown as Record<string, unknown>;
  const keys = Object.keys(scope);

  for (const key of keys) {
    if (!/(wallet|one|sui)/i.test(key)) {
      continue;
    }

    if (/aptos/i.test(key)) {
      continue;
    }

    const candidate = scope[key];
    if (isWalletLike(candidate)) {
      return candidate;
    }

    const nested = pickNestedWallet(candidate);
    if (nested) {
      return nested;
    }
  }

  return null;
};

export const isOneWalletInstalled = (): boolean => {
  return getOneWallet() !== null;
};

export const waitForOneWallet = (timeout = 3000): Promise<OneWalletAPI> => {
  return new Promise((resolve, reject) => {
    const wallet = getOneWallet();
    if (wallet) {
      resolve(wallet);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const wallet = getOneWallet();
      if (wallet) {
        clearInterval(interval);
        resolve(wallet);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error("OneWallet not found. Please install OneWallet extension."));
      }
    }, 100);
  });
};

const ADDRESS_RETRY_TIMEOUT_MS = 3500;
const ADDRESS_RETRY_INTERVAL_MS = 250;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const callWalletMethod = async (
  wallet: OneWalletAPI,
  methodName: "getAccounts" | "requestAccounts" | "getAccount" | "account" | "getAddress",
): Promise<unknown> => {
  const method = wallet[methodName];
  if (typeof method !== "function") {
    return null;
  }

  try {
    return await (method as (...args: unknown[]) => Promise<unknown>).call(wallet);
  } catch {
    return null;
  }
};

const resolveAddressFromWallet = async (wallet: OneWalletAPI): Promise<string | null> => {
  const fromWalletObject = extractWalletAddress(wallet);
  if (fromWalletObject) {
    return fromWalletObject;
  }

  const propertySources: unknown[] = [
    wallet.address,
    wallet.selectedAddress,
    wallet.accounts,
    wallet.account,
  ];

  for (const source of propertySources) {
    const resolved = extractWalletAddress(source);
    if (resolved) {
      return resolved;
    }
  }

  const methodSources: Array<"getAccounts" | "requestAccounts" | "getAccount" | "account" | "getAddress"> = [
    "getAccounts",
    "requestAccounts",
    "getAccount",
    "account",
    "getAddress",
  ];

  for (const methodName of methodSources) {
    const value = await callWalletMethod(wallet, methodName);
    const resolved = extractWalletAddress(value);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

export const resolveConnectedWalletAddress = async (
  wallet: OneWalletAPI,
  connectResult?: unknown,
): Promise<string | null> => {
  const fromConnectResult = extractWalletAddress(connectResult);
  if (fromConnectResult) {
    return fromConnectResult;
  }

  const immediate = await resolveAddressFromWallet(wallet);
  if (immediate) {
    return immediate;
  }

  const start = Date.now();
  while (Date.now() - start < ADDRESS_RETRY_TIMEOUT_MS) {
    await wait(ADDRESS_RETRY_INTERVAL_MS);
    const resolved = await resolveAddressFromWallet(wallet);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

export const readWalletNetwork = async (wallet: OneWalletAPI): Promise<string | null> => {
  const fromWalletObject = extractWalletNetwork(wallet);
  if (fromWalletObject) {
    return fromWalletObject;
  }

  const networkSource = wallet.network;
  if (networkSource && typeof networkSource !== "function") {
    const resolved = extractWalletNetwork(networkSource);
    if (resolved) {
      return resolved;
    }
  }

  if (typeof networkSource === "function") {
    try {
      const value = await networkSource.call(wallet);
      const resolved = extractWalletNetwork(value);
      if (resolved) {
        return resolved;
      }
    } catch {
      // Ignore and fallback to chain field.
    }
  }

  if (wallet.chain) {
    const resolved = extractWalletNetwork(wallet.chain);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

export const isWalletNetworkMismatch = (
  walletNetwork: string | null,
  expectedNetwork: string,
): boolean => {
  if (!walletNetwork) {
    return false;
  }

  const actual = walletNetwork.toLowerCase();
  const expected = expectedNetwork.toLowerCase();

  const expectsTestnet = expected.includes("testnet");
  const expectsMainnet = expected.includes("mainnet");

  if (expectsTestnet) {
    return actual.includes("mainnet");
  }

  if (expectsMainnet) {
    return actual.includes("testnet") || actual.includes("devnet") || actual.includes("localnet");
  }

  return false;
};
