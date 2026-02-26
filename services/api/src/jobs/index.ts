import { startIndexerJob } from "./indexer.js";
import { startLeaderboardJob } from "./leaderboard.js";

export const startJobs = (): NodeJS.Timeout[] => [startIndexerJob(), startLeaderboardJob()];

export * from "./indexer.js";
export * from "./leaderboard.js";
