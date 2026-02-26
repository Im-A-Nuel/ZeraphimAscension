"use client";

import { ShieldCheck, Snowflake, X } from "lucide-react";
import { useEffect, useState } from "react";
import { appConfig } from "@/lib/config";
import styles from "./ConnectWalletModal.module.css";

export type WalletProvider = "slush" | "onewallet";

interface ConnectWalletModalProps {
  open: boolean;
  isConnecting?: boolean;
  onClose: () => void;
  onConnect: (provider: WalletProvider) => Promise<void> | void;
}

interface ProviderInfo {
  title: string;
  pitch: string;
  loginNote: string;
  assetNote: string;
}

const providerInfo: Record<WalletProvider, ProviderInfo> = {
  slush: {
    title: "Slush",
    pitch: "Fast demo wallet for local testing.",
    loginNote: "Use instant demo access to explore gameplay without extension setup.",
    assetNote: "Great for UI flow checks and functional walkthrough before real on-chain usage.",
  },
  onewallet: {
    title: "OneWallet",
    pitch: "Native wallet for OneChain testnet transactions.",
    loginNote: "Connect once and sign securely for every quest, lootbox, and wings upgrade.",
    assetNote: "Store and manage OCT assets directly with verifiable on-chain execution.",
  },
};

const selectableProviders: WalletProvider[] = appConfig.enableMockWallet
  ? ["onewallet", "slush"]
  : ["onewallet"];

const providerIcon = (provider: WalletProvider) =>
  provider === "onewallet" ? (
    <ShieldCheck size={16} strokeWidth={2.4} />
  ) : (
    <Snowflake size={16} strokeWidth={2.4} />
  );

export const ConnectWalletModal = ({
  open,
  isConnecting = false,
  onClose,
  onConnect,
}: ConnectWalletModalProps) => {
  const [selectedProvider, setSelectedProvider] = useState<WalletProvider>("onewallet");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedProvider("onewallet");

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConnecting) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConnecting, onClose, open]);

  if (!open) {
    return null;
  }

  const info = providerInfo[selectedProvider];

  return (
    <div
      className={styles.overlay}
      onMouseDown={() => {
        if (!isConnecting) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Connect a wallet"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <section className={styles.providerPane}>
          <h2 className={styles.sectionTitle}>Connect a Wallet</h2>

          <div className={styles.providerList}>
            {selectableProviders.map((provider) => (
              <button
                key={provider}
                type="button"
                className={`${styles.providerButton} ${
                  selectedProvider === provider ? styles.providerButtonActive : ""
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <span className={styles.providerIcon}>{providerIcon(provider)}</span>
                <span className={styles.providerName}>{providerInfo[provider].title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.infoPane}>
          <button
            type="button"
            aria-label="Close connect wallet modal"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isConnecting}
          >
            <X size={16} />
          </button>

          <h3 className={styles.sectionTitle}>What is a Wallet</h3>
          <p className={styles.providerPitch}>{info.pitch}</p>

          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>Easy Login</p>
            <p className={styles.infoText}>{info.loginNote}</p>
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>Store Your Digital Assets</p>
            <p className={styles.infoText}>{info.assetNote}</p>
          </div>

          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isConnecting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.connectButton}
              disabled={isConnecting}
              onClick={() => {
                void onConnect(selectedProvider);
              }}
            >
              {isConnecting ? "Connecting..." : `Connect ${info.title}`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
