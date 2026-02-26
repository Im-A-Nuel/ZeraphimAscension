import type { Express } from "express";
import { Router } from "express";
import { error } from "../lib/index.js";
import { registerActivityRoutes } from "./activity/index.js";
import { registerHealthRoutes } from "./health/index.js";
import { registerLeaderboardRoutes } from "./leaderboard/index.js";
import { registerQuestRoutes } from "./quests/index.js";
import { registerUserRoutes } from "./users/index.js";

export const registerRoutes = (app: Express): void => {
  const apiRouter = Router();

  registerHealthRoutes(apiRouter);
  registerQuestRoutes(apiRouter);
  registerUserRoutes(apiRouter);
  registerLeaderboardRoutes(apiRouter);
  registerActivityRoutes(apiRouter);

  app.use("/api", apiRouter);
  app.use(apiRouter);

  app.use((_request, response) => {
    const failure = error("Route not found.", 404);
    response.status(failure.httpCode).json(failure.body);
  });
};
