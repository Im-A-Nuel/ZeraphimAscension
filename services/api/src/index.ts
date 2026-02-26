import "dotenv/config";
import { startJobs } from "./jobs/index.js";
import { runMigrations } from "./infra/index.js";
import { logError, logInfo } from "./lib/index.js";
import { createServer } from "./server/index.js";

const port = Number(process.env.API_PORT ?? "3001");

const boot = (): void => {
  runMigrations();

  const app = createServer();
  const timers = startJobs();

  const server = app.listen(port, () => {
    logInfo("API server started.", { port });
  });

  const shutdown = (): void => {
    timers.forEach((timer) => clearInterval(timer));
    server.close(() => {
      logInfo("API server stopped.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

try {
  boot();
} catch (issue) {
  logError("API boot failed.", {
    error: issue instanceof Error ? issue.message : String(issue),
  });
  process.exit(1);
}
