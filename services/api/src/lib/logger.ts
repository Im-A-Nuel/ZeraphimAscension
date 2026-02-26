type Level = "info" | "warn" | "error";

interface LogPayload {
  level: Level;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const write = (payload: LogPayload): void => {
  const output = JSON.stringify(payload);
  if (payload.level === "error") {
    console.error(output);
    return;
  }

  if (payload.level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
};

const buildPayload = (
  level: Level,
  message: string,
  context?: Record<string, unknown>,
): LogPayload => {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    payload.context = context;
  }

  return payload;
};

export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  write(buildPayload("info", message, context));
};

export const logWarn = (message: string, context?: Record<string, unknown>): void => {
  write(buildPayload("warn", message, context));
};

export const logError = (message: string, context?: Record<string, unknown>): void => {
  write(buildPayload("error", message, context));
};
