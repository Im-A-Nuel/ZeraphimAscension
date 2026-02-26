import type { Router } from "express";
import { getRecentActivity } from "./handler.js";

export const registerActivityRoutes = (router: Router): void => {
  router.get("/activity", getRecentActivity);
};
