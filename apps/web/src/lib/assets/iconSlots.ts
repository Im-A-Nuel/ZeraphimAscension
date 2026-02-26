export const iconSlots = {
  xp: "/icons/icon-xp.svg",
  shard: "/icons/icon-shard.svg",
  wings: "/icons/icon-wings.svg",
  halo: "/icons/icon-halo.svg",
  ticket: "/icons/icon-ticket.svg",
  streak: "/icons/icon-streak.svg",
  level: "/icons/icon-level.svg",
  lootbox: "/icons/icon-lootbox.svg",
  pathValor: "/icons/icon-path-valor.svg",
  pathWisdom: "/icons/icon-path-wisdom.svg",
  pathGrace: "/icons/icon-path-grace.svg",
} as const;

export type IconSlotKey = keyof typeof iconSlots;
