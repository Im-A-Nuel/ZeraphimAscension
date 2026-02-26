"use client";

import { useEffect, useState } from "react";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import styles from "./RewardPopup.module.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "800"] });
const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: ["400"] });

export interface RewardData {
  questTitle: string;
  xp: number;
  shards: number;
  tickets: number;
}

interface RewardPopupProps {
  reward: RewardData | null;
  onClose: () => void;
}

const AUTO_DISMISS_MS = 4000;

export const RewardPopup = ({ reward, onClose }: RewardPopupProps) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!reward) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setProgress(100);

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (elapsed < AUTO_DISMISS_MS) {
        requestAnimationFrame(tick);
      } else {
        onClose();
      }
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reward, onClose]);

  if (!reward || !visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal>
      <div
        className={`${styles.popup} ${visible ? styles.popupVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner decorations */}
        <span className={styles.cornerTL} aria-hidden />
        <span className={styles.cornerBR} aria-hidden />

        {/* Scan line */}
        <div className={styles.scanline} aria-hidden />

        {/* Header */}
        <div className={styles.header}>
          <span className={`${shareTechMono.className} ${styles.missionLabel}`}>
            Mission Complete
          </span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Quest title */}
        <h2 className={`${orbitron.className} ${styles.questTitle}`}>
          {reward.questTitle}
        </h2>

        {/* Divider */}
        <div className={styles.divider} aria-hidden />

        {/* Rewards */}
        <p className={`${shareTechMono.className} ${styles.rewardsCopy}`}>
          Rewards Earned
        </p>
        <div className={styles.rewardRow}>
          <div className={styles.rewardBlock}>
            <span className={`${shareTechMono.className} ${styles.rewardBlockLabel}`}>XP</span>
            <span className={`${orbitron.className} ${styles.rewardBlockValue}`}>
              +{reward.xp}
            </span>
          </div>
          <div className={styles.rewardDividerV} aria-hidden />
          <div className={styles.rewardBlock}>
            <span className={`${shareTechMono.className} ${styles.rewardBlockLabel}`}>Shards</span>
            <span className={`${orbitron.className} ${styles.rewardBlockValue}`}>
              +{reward.shards}
            </span>
          </div>
          <div className={styles.rewardDividerV} aria-hidden />
          <div className={styles.rewardBlock}>
            <span className={`${shareTechMono.className} ${styles.rewardBlockLabel}`}>Tickets</span>
            <span className={`${orbitron.className} ${styles.rewardBlockValue}`}>
              +{reward.tickets}
            </span>
          </div>
        </div>

        {/* Auto-dismiss progress bar */}
        <div className={styles.progressTrack} aria-hidden>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
