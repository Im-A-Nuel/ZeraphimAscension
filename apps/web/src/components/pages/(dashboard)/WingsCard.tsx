import { ChevronDown, ChevronUp, Feather } from "lucide-react";
import { AssetIcon } from "@/components/ui";
import { iconSlots } from "@/lib/assets/iconSlots";
import type { UserStats } from "@/types";
import styles from "./WingsCard.module.css";

interface WingsCardProps {
  user: UserStats | null;
  locale: "en" | "zh";
  isPending: boolean;
  onMint: () => void;
  onEvolve: () => void;
}

const copy = {
  en: {
    title: "Wings Evolution",
    tier: "Tier",
    currentStatus: "Current Status",
    readyToMint: "Ready to Mint",
    processing: "Processing...",
    mintWings: "Mint Wings",
    evolveToTier: "Evolve to Tier",
    maxTierReached: "Max Tier Reached",
    mintFirstHint: "Mint wings first to unlock evolution.",
    needTier2Hint: "Need 200 Shards and 3 Quests.",
    needTier3Hint: "Need 500 Shards and 8 Quests.",
    evolveReadyHint: "Evolution requirements complete.",
    requirements: "Evolution Requirements",
    mintAvailable: "Mint Available",
    tier0to1: "Tier 0 -> 1",
    tier1to2: "Tier 1 -> 2",
    tier2to3: "Tier 2 -> 3",
    reqTier1to2: "200 Shards + 3 Quests",
    reqTier2to3: "500 Shards + 8 Quests",
  },
  zh: {
    title: "Wings Evolution",
    tier: "Tier",
    currentStatus: "Current Status",
    readyToMint: "Ready to Mint",
    processing: "Processing...",
    mintWings: "Mint Wings",
    evolveToTier: "Evolve to Tier",
    maxTierReached: "Max Tier Reached",
    mintFirstHint: "Mint wings first to unlock evolution.",
    needTier2Hint: "Need 200 Shards and 3 Quests.",
    needTier3Hint: "Need 500 Shards and 8 Quests.",
    evolveReadyHint: "Evolution requirements complete.",
    requirements: "Evolution Requirements",
    mintAvailable: "Mint Available",
    tier0to1: "Tier 0 -> 1",
    tier1to2: "Tier 1 -> 2",
    tier2to3: "Tier 2 -> 3",
    reqTier1to2: "200 Shards + 3 Quests",
    reqTier2to3: "500 Shards + 8 Quests",
  },
} as const;

export const WingsCard = ({ user, locale, isPending, onMint, onEvolve }: WingsCardProps) => {
  const ui = copy[locale];
  const wingsTier = user?.wingsTier ?? 0;
  const canMint = wingsTier === 0;
  const canEvolveTo2 =
    wingsTier === 1 && (user?.shards ?? 0) >= 200 && (user?.questsCompletedTotal ?? 0) >= 3;
  const canEvolveTo3 =
    wingsTier === 2 && (user?.shards ?? 0) >= 500 && (user?.questsCompletedTotal ?? 0) >= 8;
  const canEvolve = canEvolveTo2 || canEvolveTo3;
  const isMaxTier = wingsTier >= 3;
  const canAttemptEvolve = !isPending && !isMaxTier && wingsTier > 0;

  const tierNames = ["Unawakened", "Initiate", "Ascendant", "Transcendent"];
  const nextTier = wingsTier + 1;

  const progress =
    wingsTier === 0
      ? 0
      : wingsTier === 1
        ? ((user?.shards ?? 0) / 200) * 100
        : ((user?.shards ?? 0) / 500) * 100;

  const evolveHint = isMaxTier
    ? ui.maxTierReached
    : canEvolve
      ? ui.evolveReadyHint
      : wingsTier === 0
        ? ui.mintFirstHint
        : wingsTier === 1
          ? ui.needTier2Hint
          : ui.needTier3Hint;

  return (
    <section className={styles.wings}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <AssetIcon
            src={iconSlots.wings}
            alt={ui.title}
            size={18}
            className={styles.titleIcon}
            fallback={<Feather size={18} strokeWidth={2.4} className={styles.titleIcon} />}
          />
          <h2 className={styles.title}>{ui.title}</h2>
        </div>
        <div className={styles.tierBadge}>
          <span className={styles.tierLabel}>{ui.tier}</span>
          <span className={styles.tierValue}>{wingsTier}</span>
        </div>
      </div>

      <div className={styles.wingsVisual} aria-hidden>
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={116}
          className={`${styles.visualWing} ${styles.visualWingLeft}`}
        />
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={116}
          className={`${styles.visualWing} ${styles.visualWingRight}`}
        />
        <AssetIcon src={iconSlots.halo} alt="" size={46} className={styles.visualHalo} />
        <span className={styles.visualCore} />
        <span className={styles.visualTier}>{`Tier ${wingsTier}`}</span>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.currentTier}>
          <p className={styles.statusLabel}>{ui.currentStatus}</p>
          <p className={styles.statusValue}>{tierNames[wingsTier]}</p>
        </div>

        {!isMaxTier && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
            <span className={styles.progressText}>
              {wingsTier === 0 ? ui.readyToMint : `${Math.min(progress, 100).toFixed(0)}%`}
            </span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnMint}
          type="button"
          onClick={onMint}
          disabled={!canMint || isPending}
        >
          <span className={styles.btnIcon}>
            <ChevronDown size={14} strokeWidth={2.5} />
          </span>
          {isPending ? ui.processing : ui.mintWings}
        </button>
        <button
          className={styles.btnEvolve}
          type="button"
          onClick={onEvolve}
          disabled={!canAttemptEvolve}
        >
          <span className={styles.btnIcon}>
            <ChevronUp size={14} strokeWidth={2.5} />
          </span>
          {isMaxTier
            ? ui.maxTierReached
            : isPending
              ? ui.processing
              : `${ui.evolveToTier} ${nextTier}`}
        </button>
      </div>

      <p className={styles.actionHint}>{isPending ? ui.processing : evolveHint}</p>

      <div className={styles.requirements}>
        <p className={styles.reqTitle}>{ui.requirements}</p>
        <div className={styles.reqGrid}>
          <div className={styles.reqItem}>
            <span className={styles.reqLabel}>{ui.tier0to1}</span>
            <span className={styles.reqValue}>{ui.mintAvailable}</span>
          </div>
          <div className={styles.reqItem}>
            <span className={styles.reqLabel}>{ui.tier1to2}</span>
            <span className={styles.reqValue}>{ui.reqTier1to2}</span>
          </div>
          <div className={styles.reqItem}>
            <span className={styles.reqLabel}>{ui.tier2to3}</span>
            <span className={styles.reqValue}>{ui.reqTier2to3}</span>
          </div>
        </div>
      </div>

      <div className={styles.glow} />
    </section>
  );
};
