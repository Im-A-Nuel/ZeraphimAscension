import type { Router } from "express";
import { getHealth } from "./handler.js";

export const registerHealthRoutes = (router: Router): void => {
  router.get("/health", getHealth);
};
