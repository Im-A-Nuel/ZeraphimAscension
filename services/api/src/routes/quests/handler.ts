import type { Request, Response } from "express";
import { questCatalog } from "../../domain/index.js";
import { success } from "../../lib/index.js";

export const getQuests = (_request: Request, response: Response): void => {
  response.status(200).json(success(questCatalog, "Quest catalog loaded."));
};
