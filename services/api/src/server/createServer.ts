import express from "express";
import cors from "cors";
import { registerRoutes } from "../routes/index.js";

export const createServer = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  registerRoutes(app);

  return app;
};
