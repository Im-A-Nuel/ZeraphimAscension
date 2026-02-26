const readEnv = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value : fallback;

const readBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

export const appConfig = {
  apiBaseUrl: readEnv(process.env.NEXT_PUBLIC_API_URL, "http://localhost:3001"),
  onechainRpcUrl: readEnv(
    process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL,
    process.env.ONECHAIN_RPC_URL ?? "https://rpc-testnet.onelabs.cc:443",
  ),
  onechainExplorerUrl: trimTrailingSlash(
    readEnv(
      process.env.NEXT_PUBLIC_ONECHAIN_EXPLORER_URL,
      process.env.ONECHAIN_EXPLORER_URL ?? "https://onescan.cc/testnet",
    ),
  ),
  packageId: readEnv(process.env.NEXT_PUBLIC_PACKAGE_ADDRESS, "0x0"),
  network: readEnv(process.env.NEXT_PUBLIC_NETWORK, "testnet"),
  enableMockWallet: readBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_MOCK_WALLET, false),
};

export const buildExplorerTxUrl = (txDigest: string): string => {
  const digest = txDigest.trim();
  const baseUrl = appConfig.onechainExplorerUrl;

  if (baseUrl.includes("onescan.cc")) {
    return `${baseUrl}/txblock/${digest}`;
  }

  return `${baseUrl}/tx/${digest}`;
};
