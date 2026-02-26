import type { OnchainEvent, ServiceResult } from "../../types/index.js";

interface RpcCursor {
  txDigest: string;
  eventSeq: string;
}

interface RpcErrorPayload {
  code: number;
  message: string;
}

interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: RpcErrorPayload;
}

interface RawEventPayload {
  id?: RpcCursor;
  sender?: string;
  type?: string;
  parsedJson?: Record<string, unknown>;
  timestampMs?: string;
}

interface EventQueryResult {
  data?: RawEventPayload[];
  hasNextPage?: boolean;
}

const DEFAULT_TIMEOUT_MS = 4_000;
const DEFAULT_RETRIES = 3;
const MODULE_FILTERS = ["quest", "lootbox", "wings"] as const;

const isValidPackageId = (value: string): boolean => /^0x[a-fA-F0-9]+$/.test(value);

const parseCursor = (cursor: string | null): RpcCursor | null => {
  if (!cursor) {
    return null;
  }

  const [txDigest, eventSeq] = cursor.split(":");
  if (!txDigest || !eventSeq) {
    return null;
  }

  return { txDigest, eventSeq };
};

const buildCursor = (event: RawEventPayload, index: number): string => {
  const txDigest = event.id?.txDigest ?? `unknown-${index}`;
  const eventSeq = event.id?.eventSeq ?? `${index}`;
  return `${txDigest}:${eventSeq}`;
};

const compareEvents = (left: OnchainEvent, right: OnchainEvent): number => {
  if (left.timestampMs !== right.timestampMs) {
    return left.timestampMs - right.timestampMs;
  }

  if (left.txDigest !== right.txDigest) {
    return left.txDigest.localeCompare(right.txDigest);
  }

  const leftSeq = left.cursor.split(":")[1] ?? "0";
  const rightSeq = right.cursor.split(":")[1] ?? "0";

  try {
    const delta = BigInt(leftSeq) - BigInt(rightSeq);
    if (delta < 0n) return -1;
    if (delta > 0n) return 1;
    return 0;
  } catch {
    return leftSeq.localeCompare(rightSeq);
  }
};

export class OnchainClient {
  private readonly rpcUrl: string;
  private readonly packageId: string;
  private readonly explorerUrl: string;

  public constructor() {
    this.rpcUrl = process.env.ONECHAIN_RPC_URL ?? "";
    this.packageId = process.env.MOVE_PACKAGE_ID ?? "";
    this.explorerUrl = process.env.ONECHAIN_EXPLORER_URL ?? "";
  }

  public txLink(txDigest: string): string {
    const base = this.explorerUrl.replace(/\/$/, "");
    if (base.includes("onescan.cc")) {
      return `${base}/txblock/${txDigest}`;
    }

    return `${base}/tx/${txDigest}`;
  }

  public async fetchEvents(
    cursor: string | null,
    limit = 50,
  ): Promise<ServiceResult<OnchainEvent[]>> {
    if (!this.rpcUrl || !this.packageId) {
      return {
        ok: false,
        message: "RPC environment is not configured.",
        data: null,
        code: 500,
      };
    }

    if (!isValidPackageId(this.packageId)) {
      return {
        ok: false,
        message: "MOVE_PACKAGE_ID is invalid. Expected hex format like 0xabc123.",
        data: null,
        code: 400,
      };
    }

    const queryCursor = parseCursor(cursor);
    const responses = await Promise.all(
      MODULE_FILTERS.map(async (moduleName) => {
        const params = [
          { MoveModule: { package: this.packageId, module: moduleName } },
          queryCursor,
          limit,
          false,
        ];

        const response = await this.rpcRequest<EventQueryResult>("suix_queryEvents", params);
        return { moduleName, response };
      }),
    );

    const successfulResponses = responses.filter(
      (item) => item.response.ok && item.response.data !== null,
    );

    if (successfulResponses.length === 0) {
      const firstFailure = responses[0]?.response;
      return {
        ok: false,
        message: firstFailure?.message ?? "RPC request failed after retries.",
        data: null,
        code: firstFailure?.code ?? 500,
      };
    }

    const now = Date.now();
    const seen = new Set<string>();
    const events: OnchainEvent[] = [];

    successfulResponses.forEach(({ response }) => {
      (response.data?.data ?? []).forEach((event, index) => {
        const cursorValue = buildCursor(event, index);
        if (seen.has(cursorValue)) {
          return;
        }
        seen.add(cursorValue);

        events.push({
          cursor: cursorValue,
          txDigest: event.id?.txDigest ?? "unknown",
          eventType: event.type ?? "unknown",
          address:
            event.sender ??
            (typeof event.parsedJson?.user === "string" ? event.parsedJson.user : "0x0"),
          payload: event.parsedJson ?? {},
          timestampMs: Number(event.timestampMs ?? now),
        });
      });
    });

    events.sort(compareEvents);

    const boundedEvents = events.slice(0, limit);

    return {
      ok: true,
      message: "Events fetched.",
      data: boundedEvents,
      code: 200,
    };
  }

  private async rpcRequest<T>(
    method: string,
    params: unknown[],
  ): Promise<ServiceResult<T>> {
    for (let attempt = 1; attempt <= DEFAULT_RETRIES; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      try {
        const response = await fetch(this.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method,
            params,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        if (!response.ok) {
          continue;
        }

        const payload = (await response.json()) as RpcResponse<T>;
        if (payload.error) {
          return {
            ok: false,
            message: payload.error.message,
            data: null,
            code: payload.error.code,
          };
        }

        if (payload.result === undefined) {
          continue;
        }

        return {
          ok: true,
          message: "RPC request succeeded.",
          data: payload.result,
          code: 200,
        };
      } catch {
        clearTimeout(timeout);
      }
    }

    return {
      ok: false,
      message: "RPC request failed after retries.",
      data: null,
      code: 503,
    };
  }
}

let onchainClient: OnchainClient | null = null;

export const getOnchainClient = (): OnchainClient => {
  if (onchainClient) {
    return onchainClient;
  }

  onchainClient = new OnchainClient();
  return onchainClient;
};
