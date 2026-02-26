import "dotenv/config";

const FAUCET_BASE_URL =
  process.env.ONECHAIN_FAUCET_URL?.trim() || "https://faucet-testnet.onelabs.cc:443";
const BASE_URL = FAUCET_BASE_URL.replace(/\/+$/, "");
const REQUEST_URL = `${BASE_URL}/v1/gas`;

const MAX_STATUS_RETRIES = 12;
const STATUS_DELAY_MS = 1200;

interface FaucetRequestResponse {
  task?: string;
  error?: string | null;
}

interface FaucetStatusResponse {
  status?: {
    status?: string;
    transferred_gas_objects?: {
      sent?: Array<{
        amount?: number;
        transferTxDigest?: string;
        id?: string;
      }>;
    };
  };
  error?: string | null;
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isHexAddress = (value: string): boolean => /^0x[a-fA-F0-9]{32,128}$/.test(value.trim());

const requestFaucet = async (address: string): Promise<void> => {
  const recipient = address.trim();
  if (!isHexAddress(recipient)) {
    throw new Error("Invalid address format.");
  }

  console.log(`Requesting OCT faucet for address: ${recipient}`);
  console.log(`Faucet endpoint: ${REQUEST_URL}`);

  const response = await fetch(REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      FixedAmountRequest: {
        recipient,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Faucet request failed: ${response.status} - ${text}`);
  }

  const data = (await response.json()) as FaucetRequestResponse;
  if (data.error) {
    throw new Error(`Faucet request error: ${data.error}`);
  }

  if (!data.task) {
    console.log("Faucet accepted request:", JSON.stringify(data, null, 2));
    return;
  }

  console.log(`Task created: ${data.task}`);

  const statusUrl = `${BASE_URL}/v1/status/${data.task}`;
  for (let attempt = 1; attempt <= MAX_STATUS_RETRIES; attempt += 1) {
    await wait(STATUS_DELAY_MS);

    const statusResponse = await fetch(statusUrl);
    if (!statusResponse.ok) {
      const text = await statusResponse.text();
      throw new Error(`Faucet status failed: ${statusResponse.status} - ${text}`);
    }

    const statusData = (await statusResponse.json()) as FaucetStatusResponse;
    const status = statusData.status?.status ?? "UNKNOWN";

    if (status === "SUCCEEDED") {
      const sent = statusData.status?.transferred_gas_objects?.sent ?? [];
      const digests = sent
        .map((item) => item.transferTxDigest)
        .filter((digest): digest is string => typeof digest === "string" && digest.length > 0);

      console.log("OCT tokens requested successfully.");
      if (digests.length > 0) {
        console.log("Transfer tx digest(s):", digests.join(", "));
      }
      console.log("Status payload:", JSON.stringify(statusData, null, 2));
      return;
    }

    if (status === "FAILED") {
      throw new Error(`Faucet task failed: ${JSON.stringify(statusData)}`);
    }

    if (attempt === MAX_STATUS_RETRIES) {
      throw new Error(`Faucet task timeout after ${MAX_STATUS_RETRIES} checks.`);
    }
  }
};

const address = process.argv[2];

if (!address) {
  console.error("Usage: pnpm faucet <ADDRESS>");
  process.exit(1);
}

requestFaucet(address).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
