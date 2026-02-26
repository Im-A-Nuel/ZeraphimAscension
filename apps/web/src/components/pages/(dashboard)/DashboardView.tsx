"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, Gamepad2, Globe2, House, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { AssetIcon, ConnectWalletModal, type WalletProvider } from "@/components/ui";
import { iconSlots } from "@/lib/assets/iconSlots";
import { appConfig } from "@/lib/config";
import { isWalletNetworkMismatch } from "@/lib/onewallet";
import {
  useActivityStore,
  useAuthStore,
  useLeaderboardStore,
  useQuestStore,
  useTxStore,
  useUiStore,
  useUserStore,
} from "@/stores";
import { ProfilePanel } from "./ProfilePanel";
import { RewardPopup, type RewardData } from "./RewardPopup";
import { SanctumPanel } from "./SanctumPanel";
import { TxToastHandler } from "./TxToastHandler";
import { WingsCard } from "./WingsCard";
import styles from "./DashboardView.module.css";

const QuestBoard = dynamic(
  () => import("@/components/pages/(dashboard)").then((module) => module.QuestBoard),
  {
    ssr: false,
    loading: () => <div className="card text-sm text-mute">Loading quest board...</div>,
  },
);

const LootBoxPanel = dynamic(
  () => import("@/components/pages/(dashboard)").then((module) => module.LootBoxPanel),
  {
    ssr: false,
    loading: () => <div className="card text-sm text-mute">Loading loot panel...</div>,
  },
);

type Locale = "en" | "zh";
type SideModuleTab = "wings" | "loot" | "sanctum";

const copy: Record<
  Locale,
  {
    home: string;
    play: string;
    docs: string;
    dashboard: string;
    leaderboard: string;
    activity: string;
    connectWallet: string;
    disconnectWallet: string;
    soundOn: string;
    soundOff: string;
    status: string;
    modulesTitle: string;
    wingsTab: string;
    lootTab: string;
    sanctumTab: string;
    quickActivity: string;
    quickLeaderboard: string;
    noAddress: string;
    oneWalletConnected: string;
    slushConnected: string;
    connectFailed: string;
    networkLabel: string;
    expectedLabel: string;
    unknownNetwork: string;
  }
> = {
  en: {
    home: "Home",
    play: "Play",
    docs: "Docs",
    dashboard: "Dashboard",
    leaderboard: "Leaderboard",
    activity: "Activity",
    connectWallet: "Connect Wallet",
    disconnectWallet: "Disconnect",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    status: "Command Center Active",
    modulesTitle: "Ascension Modules",
    wingsTab: "Wings",
    lootTab: "Loot",
    sanctumTab: "Sanctum",
    quickActivity: "Activity",
    quickLeaderboard: "Leaderboard",
    noAddress: "No Address",
    oneWalletConnected: "OneWallet connected.",
    slushConnected: "Slush wallet connected.",
    connectFailed: "Failed to connect wallet.",
    networkLabel: "Network",
    expectedLabel: "Expected",
    unknownNetwork: "unknown",
  },
  zh: {
    home: "首页",
    play: "玩法",
    docs: "文档",
    dashboard: "仪表盘",
    leaderboard: "排行榜",
    activity: "动态",
    connectWallet: "连接钱包",
    disconnectWallet: "断开连接",
    soundOn: "声音开",
    soundOff: "声音关",
    status: "指挥中心在线",
    modulesTitle: "飞升模块",
    wingsTab: "羽翼",
    lootTab: "战利品",
    sanctumTab: "圣域",
    quickActivity: "动态",
    quickLeaderboard: "排行榜",
    noAddress: "无地址",
    oneWalletConnected: "OneWallet 已连接。",
    slushConnected: "Slush 钱包已连接。",
    connectFailed: "连接钱包失败。",
    networkLabel: "网络",
    expectedLabel: "预期",
    unknownNetwork: "未知",
  },
};

export const DashboardView = () => {
  const address = useAuthStore((state) => state.address);
  const isConnected = useAuthStore((state) => state.isConnected);
  const walletType = useAuthStore((state) => state.walletType);
  const walletNetwork = useAuthStore((state) => state.walletNetwork);
  const authStatus = useAuthStore((state) => state.status);
  const switchWalletType = useAuthStore((state) => state.switchWalletType);
  const connectWallet = useAuthStore((state) => state.connectWallet);
  const disconnectWallet = useAuthStore((state) => state.disconnectWallet);

  const quests = useQuestStore((state) => state.quests);
  const fetchQuests = useQuestStore((state) => state.fetchQuests);
  const markQuestCompleted = useQuestStore((state) => state.markQuestCompleted);
  const hydrateQuestCooldowns = useQuestStore((state) => state.hydrateQuestCooldowns);

  const user = useUserStore((state) => state.user);
  const fetchUserStats = useUserStore((state) => state.fetchUserStats);

  const activityItems = useActivityStore((state) => state.items);
  const fetchLeaderboard = useLeaderboardStore((state) => state.fetchLeaderboard);
  const fetchUserRank = useLeaderboardStore((state) => state.fetchUserRank);
  const fetchUserActivities = useActivityStore((state) => state.fetchUserActivities);

  const txStatus = useTxStore((state) => state.status);
  const completeQuest = useTxStore((state) => state.completeQuest);
  const openLootbox = useTxStore((state) => state.openLootbox);
  const mintWings = useTxStore((state) => state.mintWings);
  const evolveWings = useTxStore((state) => state.evolveWings);
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);

  const isPending = txStatus === "pending";
  const expectedNetworkRaw = appConfig.network.trim().toLowerCase();
  const expectedNetwork =
    expectedNetworkRaw.includes("mainnet")
      ? "mainnet"
      : expectedNetworkRaw.includes("testnet")
        ? "testnet"
        : expectedNetworkRaw.includes("devnet")
          ? "devnet"
          : expectedNetworkRaw.includes("local")
            ? "localnet"
            : expectedNetworkRaw || "testnet";
  const expectedNetworkLabel = `one chain ${expectedNetwork}`;
  const hasNetworkMismatch =
    walletType === "onewallet" && isWalletNetworkMismatch(walletNetwork, expectedNetwork);

  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [pendingReward, setPendingReward] = useState<RewardData | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [isPlayMenuOpen, setPlayMenuOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<SideModuleTab>("wings");

  const playMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const ui = copy[locale];
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ui.noAddress;

  const handleConnectWallet = async (provider: WalletProvider): Promise<void> => {
    const selectedProvider =
      provider === "slush" && !appConfig.enableMockWallet ? "onewallet" : provider;

    try {
      switchWalletType(selectedProvider === "onewallet" ? "onewallet" : "mock");
      await connectWallet();
      setConnectModalOpen(false);
      if (selectedProvider === "onewallet") {
        toast.success(ui.oneWalletConnected);
      } else {
        toast.success(ui.slushConnected);
      }
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : ui.connectFailed;
      toast.error(message);
    }
  };

  const playUiClickTone = () => {
    if (!soundOn || typeof window === "undefined") {
      return;
    }

    try {
      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const now = context.currentTime;

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(760, now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.03, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
      oscillator.onended = () => {
        void context.close();
      };
    } catch {
      // Ignore browser audio restrictions.
    }
  };

  useEffect(() => {
    void fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    void fetchUserStats(address);
    void fetchLeaderboard("current", 10);
    void fetchUserRank(address, "current");
    void fetchUserActivities(address, 20);
  }, [address, fetchLeaderboard, fetchUserActivities, fetchUserRank, fetchUserStats, isConnected]);

  useEffect(() => {
    if (quests.length === 0 || activityItems.length === 0) {
      return;
    }

    hydrateQuestCooldowns(activityItems);
  }, [activityItems, hydrateQuestCooldowns, quests.length]);

  useEffect(() => {
    if (!isConnected) {
      setAccountMenuOpen(false);
    }
  }, [isConnected]);

  useEffect(() => {
    const closeMenusOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (playMenuRef.current && !playMenuRef.current.contains(target)) {
        setPlayMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", closeMenusOnOutsideClick);
    return () => window.removeEventListener("mousedown", closeMenusOnOutsideClick);
  }, []);

  const refresh = async (): Promise<void> => {
    if (!address) {
      return;
    }

    await Promise.all([
      fetchUserStats(address),
      fetchLeaderboard("current", 10),
      fetchUserRank(address, "current"),
      fetchUserActivities(address, 20),
    ]);
  };

  const refreshAfterTransaction = async (): Promise<void> => {
    const attempts = 6;
    for (let index = 0; index < attempts; index += 1) {
      await refresh();
      if (index < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  const applyOptimisticWingsTier = (nextTier: number, shardCost = 0): void => {
    useUserStore.setState((state) => {
      if (!state.user) {
        return state;
      }

      return {
        ...state,
        user: {
          ...state.user,
          wingsTier: Math.max(state.user.wingsTier, nextTier),
          shards: Math.max(0, state.user.shards - shardCost),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const handleCompleteQuest = async (questId: number): Promise<void> => {
    const quest = quests.find((q) => q.id === questId);
    const result = await completeQuest(questId);
    if (result) {
      markQuestCompleted(questId);
      if (quest) {
        setPendingReward({
          questTitle: quest.title,
          xp: quest.xpReward,
          shards: quest.shardsReward,
          tickets: quest.lootTicketReward,
        });
      }
      await refreshAfterTransaction();
    }
  };

  const handleOpenLootbox = async (): Promise<void> => {
    const result = await openLootbox();
    if (result) {
      await refreshAfterTransaction();
    }
  };

  const handleMintWings = async (): Promise<void> => {
    const result = await mintWings();
    if (result) {
      applyOptimisticWingsTier(1);
      await refreshAfterTransaction();
      return;
    }

    const latestTxError = useTxStore.getState().errorMessage ?? "";
    if (latestTxError.toLowerCase().includes("already minted")) {
      applyOptimisticWingsTier(1);
      await refreshAfterTransaction();
    }
  };

  const handleEvolveWings = async (): Promise<void> => {
    const currentTier = user?.wingsTier ?? 0;
    const result = await evolveWings();
    if (result) {
      if (currentTier === 1) {
        applyOptimisticWingsTier(2, 200);
      } else if (currentTier === 2) {
        applyOptimisticWingsTier(3, 500);
      }
      await refreshAfterTransaction();
      return;
    }

    const latestTxError = useTxStore.getState().errorMessage ?? "";
    const lowerError = latestTxError.toLowerCase();
    if (lowerError.includes("maximum tier")) {
      applyOptimisticWingsTier(3);
      await refreshAfterTransaction();
    }
  };

  return (
    <main className={styles.dashboard}>
      <TxToastHandler />
      <RewardPopup reward={pendingReward} onClose={() => setPendingReward(null)} />

      <div className={styles.celestialBackdrop} aria-hidden>
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={420}
          className={`${styles.backdropWing} ${styles.backdropWingLeft}`}
        />
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={420}
          className={`${styles.backdropWing} ${styles.backdropWingRight}`}
        />
        <AssetIcon src={iconSlots.halo} alt="" size={220} className={styles.backdropHalo} />
        <span className={styles.backdropCore} />
      </div>

      <header className={styles.header}>
        <div className={styles.navShell}>
          <div className={styles.navBrand}>
            <AssetIcon
              src={iconSlots.halo}
              alt="Zeraphim Crest"
              size={28}
              className={styles.navBrandIcon}
            />
            <div className={styles.brandText}>
              <h1 className={styles.dashboardTitle}>Zeraphim Dashboard</h1>
              <p className={styles.dashboardSubtitle}>{ui.status}</p>
            </div>
          </div>

          <nav className={styles.navLinks}>
            <Link
              href="/"
              className={styles.navItem}
              onClick={() => {
                playUiClickTone();
              }}
            >
              <House size={14} />
              <span>{ui.home}</span>
            </Link>

            <div className={styles.playMenu} ref={playMenuRef}>
              <button
                type="button"
                className={`${styles.navItem} ${styles.playTrigger} ${
                  isPlayMenuOpen ? styles.playActive : ""
                }`}
                onClick={() => {
                  playUiClickTone();
                  setPlayMenuOpen((previous) => !previous);
                }}
              >
                <Gamepad2 size={14} />
                <span>{ui.play}</span>
                <ChevronDown size={14} className={isPlayMenuOpen ? styles.chevronOpen : ""} />
              </button>

              {isPlayMenuOpen && (
                <div className={styles.playDropdown}>
                  <Link
                    href="/dashboard"
                    onClick={() => {
                      setPlayMenuOpen(false);
                    }}
                  >
                    {ui.dashboard}
                  </Link>
                  <Link
                    href="/leaderboard"
                    onClick={() => {
                      setPlayMenuOpen(false);
                    }}
                  >
                    {ui.leaderboard}
                  </Link>
                  <Link
                    href="/activity"
                    onClick={() => {
                      setPlayMenuOpen(false);
                    }}
                  >
                    {ui.activity}
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/docs"
              className={styles.navItem}
              onClick={() => {
                playUiClickTone();
              }}
            >
              <BookOpen size={14} />
              <span>{ui.docs}</span>
            </Link>
          </nav>

          <div className={styles.navControls}>
            <button
              type="button"
              className={styles.controlButton}
              onClick={() => {
                setSoundOn((previous) => !previous);
              }}
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{soundOn ? ui.soundOn : ui.soundOff}</span>
            </button>

            <button
              type="button"
              className={styles.controlButton}
              onClick={() => {
                playUiClickTone();
                setLocale(locale === "en" ? "zh" : "en");
              }}
            >
              <Globe2 size={14} />
              <span>{locale === "en" ? "EN" : "中文"}</span>
            </button>

            {!isConnected ? (
              <button
                className={styles.connectButton}
                type="button"
                onClick={() => {
                  playUiClickTone();
                  setConnectModalOpen(true);
                }}
              >
                {ui.connectWallet}
              </button>
            ) : (
              <div className={styles.accountMenu} ref={accountMenuRef}>
                <button
                  type="button"
                  className={styles.accountTrigger}
                  onClick={() => {
                    playUiClickTone();
                    setAccountMenuOpen((previous) => !previous);
                  }}
                >
                  <span>{shortAddress}</span>
                  <ChevronDown size={14} className={isAccountMenuOpen ? styles.chevronOpen : ""} />
                </button>

                {isAccountMenuOpen && (
                  <div className={styles.accountDropdown}>
                    <div className={styles.accountMeta}>
                      <span className={styles.walletTypeTag}>
                        {walletType === "onewallet" ? "OneWallet" : "Slush"}
                      </span>
                      <p className={styles.accountAddress}>{address ?? ui.noAddress}</p>
                    </div>
                    <button
                      className={styles.disconnectButton}
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        disconnectWallet();
                      }}
                    >
                      {ui.disconnectWallet}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {walletType === "onewallet" && isConnected && (
          <p className={hasNetworkMismatch ? styles.networkWarning : styles.networkHint}>
            {ui.networkLabel}: {walletNetwork ?? ui.unknownNetwork} | {ui.expectedLabel}: {expectedNetworkLabel}
          </p>
        )}

        <div className={styles.headerGlow} />
      </header>

      <div className={styles.dashboardGrid}>
        <div className={styles.profileSection}>
          <ProfilePanel user={user} locale={locale} />
        </div>

        <div className={styles.questSection}>
          <QuestBoard
            quests={quests}
            locale={locale}
            isPending={isPending}
            onComplete={handleCompleteQuest}
          />
        </div>

        <aside className={styles.sideRail}>
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <h2 className={styles.sidePanelTitle}>{ui.modulesTitle}</h2>
              <div className={styles.sidePanelLinks}>
                <Link href="/activity" className={styles.sidePanelLink}>
                  {ui.quickActivity}
                </Link>
                <Link href="/leaderboard" className={styles.sidePanelLink}>
                  {ui.quickLeaderboard}
                </Link>
              </div>
            </div>

            <div className={styles.sideTabRow}>
              <button
                type="button"
                className={`${styles.sideTab} ${activeSideTab === "wings" ? styles.sideTabActive : ""}`}
                onClick={() => setActiveSideTab("wings")}
              >
                {ui.wingsTab}
              </button>
              <button
                type="button"
                className={`${styles.sideTab} ${activeSideTab === "loot" ? styles.sideTabActive : ""}`}
                onClick={() => setActiveSideTab("loot")}
              >
                {ui.lootTab}
              </button>
              <button
                type="button"
                className={`${styles.sideTab} ${activeSideTab === "sanctum" ? styles.sideTabActive : ""}`}
                onClick={() => setActiveSideTab("sanctum")}
              >
                {ui.sanctumTab}
              </button>
            </div>

            <div className={styles.sideTabContent}>
              {activeSideTab === "wings" && (
                <WingsCard
                  user={user}
                  locale={locale}
                  isPending={isPending}
                  onMint={handleMintWings}
                  onEvolve={handleEvolveWings}
                />
              )}

              {activeSideTab === "loot" && (
                <LootBoxPanel
                  lootTickets={user?.lootTickets ?? 0}
                  locale={locale}
                  isPending={isPending}
                  onOpen={handleOpenLootbox}
                />
              )}

              {activeSideTab === "sanctum" && (
                <SanctumPanel user={user} locale={locale} activities={activityItems} />
              )}
            </div>
          </div>
        </aside>
      </div>

      <ConnectWalletModal
        open={isConnectModalOpen}
        isConnecting={authStatus === "loading"}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnectWallet}
      />
    </main>
  );
};
