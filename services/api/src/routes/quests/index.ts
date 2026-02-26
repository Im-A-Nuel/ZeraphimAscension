import type { Router } from "express";
import { getQuests } from "./handler.js";

export const registerQuestRoutes = (router: Router): void => {
  router.get("/quests", getQuests);
};
