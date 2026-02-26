import type { ApiResponse } from "../types/index.js";

export const success = <T>(data: T, message = "OK"): ApiResponse<T> => ({
  status: "success",
  message,
  data,
});

export const error = <T>(
  message: string,
  httpCode = 400,
  data: T | null = null,
): { httpCode: number; body: ApiResponse<T> } => ({
  httpCode,
  body: {
    status: "error",
    message,
    data,
  },
});
