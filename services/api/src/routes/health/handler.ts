import type { Request, Response } from "express";
import { success } from "../../lib/index.js";

export const getHealth = (_request: Request, response: Response): void => {
  response.status(200).json(
    success(
      {
        service: "zeraphim-api",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      "Service is healthy.",
    ),
  );
};
