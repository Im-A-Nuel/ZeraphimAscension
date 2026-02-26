import type { Quest } from "../types/index.js";

export const questCatalog: Quest[] = [
  {
    id: 0,
    path: "valor",
    title: "Aegis Patrol",
    description: "Clear hostile zones and secure divine relays.",
    cooldownSeconds: 120,
    xpReward: 80,
    shardsReward: 45,
    lootTicketReward: 1,
  },
  {
    id: 1,
    path: "valor",
    title: "Sanctum Breach",
    description: "Lead a strike and claim strategic control points.",
    cooldownSeconds: 180,
    xpReward: 110,
    shardsReward: 70,
    lootTicketReward: 1,
  },
  {
    id: 2,
    path: "wisdom",
    title: "Archive Cipher",
    description: "Decode corrupted archives to recover elder knowledge.",
    cooldownSeconds: 90,
    xpReward: 120,
    shardsReward: 35,
    lootTicketReward: 1,
  },
  {
    id: 3,
    path: "wisdom",
    title: "Oracle Alignment",
    description: "Stabilize oracle channels for tactical foresight.",
    cooldownSeconds: 150,
    xpReward: 150,
    shardsReward: 50,
    lootTicketReward: 1,
  },
  {
    id: 4,
    path: "grace",
    title: "Mercy Circuit",
    description: "Restore shrines and reinforce citizen sanctuaries.",
    cooldownSeconds: 60,
    xpReward: 70,
    shardsReward: 30,
    lootTicketReward: 1,
  },
  {
    id: 5,
    path: "grace",
    title: "Resonance Rite",
    description: "Perform a rite to strengthen streak continuity.",
    cooldownSeconds: 75,
    xpReward: 95,
    shardsReward: 40,
    lootTicketReward: 2,
  },
];

export const getQuestById = (questId: number): Quest | null =>
  questCatalog.find((quest) => quest.id === questId) ?? null;
