import type { Router } from "express";
import { getUserActivities, getUserByAddress } from "./handler.js";

export const registerUserRoutes = (router: Router): void => {
  router.get("/users/:address", getUserByAddress);
  router.get("/users/:address/activities", getUserActivities);
};
