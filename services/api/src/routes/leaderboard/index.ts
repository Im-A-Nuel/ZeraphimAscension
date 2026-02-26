import type { Router } from "express";
import { getLeaderboard, getLeaderboardByAddress } from "./handler.js";

export const registerLeaderboardRoutes = (router: Router): void => {
  router.get("/leaderboard", getLeaderboard);
  router.get("/leaderboard/:address", getLeaderboardByAddress);
};
