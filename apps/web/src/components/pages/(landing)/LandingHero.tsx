"use client";

import Image from "next/image";
import Link from "next/link";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConnectWalletModal, DataGrid, ParticleNetwork, type WalletProvider } from "@/components/ui";
import { appConfig } from "@/lib/config";
import { useAuthStore } from "@/stores";
import styles from "./LandingHero.module.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
});

const copy = {
  connectWallet: "Connect Wallet",
  disconnectWallet: "Disconnect",
  subtitle: "Complete on-chain quests, earn rewards, and evolve your Wings on OneChain.",
  startJourney: "Start Your Journey",
  viewLeaderboard: "View Leaderboard",
  scroll: "Scroll",
  readyToAscend: "Ready to Ascend?",
  ctaSubtitle: "Connect your wallet and begin your on-chain journey.",
};

export const LandingHero = () => {
  const isConnected = useAuthStore((state) => state.isConnected);
  const address = useAuthStore((state) => state.address);
  const status = useAuthStore((state) => state.status);
  const switchWalletType = useAuthStore((state) => state.switchWalletType);
  const connectWallet = useAuthStore((state) => state.connectWallet);
  const disconnectWallet = useAuthStore((state) => state.disconnectWallet);

  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const gameplayRef = useRef<HTMLElement>(null);
  const onechainRef = useRef<HTMLElement>(null);
  const proofRef = useRef<HTMLElement>(null);

  const connectSelectedWallet = async (provider: WalletProvider): Promise<void> => {
    const selectedProvider =
      provider === "slush" && !appConfig.enableMockWallet ? "onewallet" : provider;

    try {
      switchWalletType(selectedProvider === "onewallet" ? "onewallet" : "mock");
      await connectWallet();
      setConnectModalOpen(false);
      if (selectedProvider === "onewallet") {
        toast.success("OneWallet connected successfully!");
      } else {
        toast.success("Slush wallet connected.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect";
      toast.error(message);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.15 }
    );

    const refs = [howItWorksRef, gameplayRef, onechainRef, proofRef];
    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const parallaxSpeed = {
    slow: scrollY * 0.15,
    medium: scrollY * 0.3,
    fast: scrollY * 0.5,
  };

  return (
    <main className={styles.page}>
      <ParticleNetwork />
      <section id="home" className={styles.hero} ref={heroRef}>
        <div
          className={styles.dotField}
          style={{ transform: `translate3d(0, ${parallaxSpeed.slow}px, 0)` }}
          aria-hidden
        />
        <div className={styles.scanLines} aria-hidden />
        <div
          className={`${styles.glow} ${styles.glowOne}`}
          style={{ transform: `translate3d(0, ${parallaxSpeed.medium}px, 0)` }}
          aria-hidden
        />
        <div
          className={`${styles.glow} ${styles.glowTwo}`}
          style={{ transform: `translate3d(0, ${-parallaxSpeed.medium}px, 0)` }}
          aria-hidden
        />
        <div
          className={`${styles.glow} ${styles.glowThree}`}
          style={{ transform: `translate3d(0, ${parallaxSpeed.fast}px, 0)` }}
          aria-hidden
        />
        <div
          className={styles.frameOuter}
          style={{ transform: `translate(-50%, ${parallaxSpeed.slow}px)` }}
          aria-hidden
        />
        <div
          className={styles.frameInner}
          style={{ transform: `translate(-50%, ${parallaxSpeed.medium}px)` }}
          aria-hidden
        />
        <div
          className={styles.circuit}
          style={{ transform: `translate(-50%, calc(-42% + ${parallaxSpeed.fast}px))` }}
          aria-hidden
        />

        <div className={styles.heroScreen}>
        <div className={styles.topBar}>
          <button
            className={`${shareTechMono.className} ${styles.connectButton}`}
            type="button"
            onClick={
              isConnected
                ? disconnectWallet
                : () => { setConnectModalOpen(true); }
            }
          >
            {isConnected && address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : copy.connectWallet}
          </button>
        </div>

        <div className={styles.centerStage}>
          <h1 className={`${orbitron.className} ${styles.title}`}>ZERAPHIM: ASCENSION</h1>
          <p className={`${shareTechMono.className} ${styles.subtitle}`}>{copy.subtitle}</p>

          <div className={styles.actions}>
            <Link className={`${shareTechMono.className} ${styles.actionPrimary}`} href="/dashboard">
              {copy.startJourney}
            </Link>
            <Link className={`${shareTechMono.className} ${styles.actionSecondary}`} href="/leaderboard">
              {copy.viewLeaderboard}
            </Link>
          </div>
        </div>

        <div className={`${shareTechMono.className} ${styles.scrollHint}`}>
          <span className={styles.scrollChevron} />
          <span>{copy.scroll}</span>
        </div>
        </div>{/* end heroScreen */}

        <section id="how-it-works" className={styles.howItWorks} ref={howItWorksRef}>
          <DataGrid />
          <h2 className={`${orbitron.className} ${styles.sectionTitle}`}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <article className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <h3 className={`${orbitron.className} ${styles.stepTitle}`}>Choose a Path</h3>
              <p className={styles.stepDesc}>
                Select Valor, Wisdom, or Grace. Each path offers unique quests with different
                rewards and progression rates.
              </p>
            </article>
            <article className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <h3 className={`${orbitron.className} ${styles.stepTitle}`}>Complete Quests On-Chain</h3>
              <p className={styles.stepDesc}>
                Execute real transactions on OneChain. Every action is verifiable, auditable, and
                permanently recorded.
              </p>
            </article>
            <article className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <h3 className={`${orbitron.className} ${styles.stepTitle}`}>Open Loot and Evolve Wings</h3>
              <p className={styles.stepDesc}>
                Unlock lootboxes for shards and XP. Evolve your Wings from Tier 1 to Tier 3 as you
                progress through the ascension.
              </p>
            </article>
          </div>
        </section>

        <section id="gameplay" className={styles.contentSection} ref={gameplayRef}>
          <h2 className={`${orbitron.className} ${styles.sectionTitle}`}>Gameplay Preview</h2>
          <div className={styles.previewGrid}>
            <div className={styles.previewCard}>
              <div className={`${shareTechMono.className} ${styles.previewLabel}`}>Quest System</div>
              <p className={styles.previewText}>
                6 unique on-chain quests across 3 divine paths: Valor, Wisdom, and Grace
              </p>
            </div>
            <div className={styles.previewCard}>
              <div className={`${shareTechMono.className} ${styles.previewLabel}`}>Wings Evolution</div>
              <p className={styles.previewText}>
                Tier 0 -&gt; 1 -&gt; 2 -&gt; 3 progression with 200+ shards and quest requirements
              </p>
            </div>
            <div className={styles.previewCard}>
              <div className={`${shareTechMono.className} ${styles.previewLabel}`}>Loot System</div>
              <p className={styles.previewText}>
                Pseudo-random lootboxes: 50/100/200 shards + XP boosts
              </p>
            </div>
            <div className={styles.previewCard}>
              <div className={`${shareTechMono.className} ${styles.previewLabel}`}>Daily Streak</div>
              <p className={styles.previewText}>
                Maintain consecutive quest completions for Tier 3 wings unlock
              </p>
            </div>
            <div className={styles.previewCard}>
              <div className={`${shareTechMono.className} ${styles.previewLabel}`}>Leaderboard</div>
              <p className={styles.previewText}>
                Real-time ranking: XP + (shards x 0.2) + (wingsTier x 200)
              </p>
            </div>
            <div className={styles.previewCard}>
              <div className={`${shareTechMono.className} ${styles.previewLabel}`}>Activity Feed</div>
              <p className={styles.previewText}>
                Live on-chain events tracked via OneChain Move event indexer
              </p>
            </div>
          </div>
        </section>

        <section id="onechain" className={styles.contentSection} ref={onechainRef}>
          <h2 className={`${orbitron.className} ${styles.sectionTitle}`}>Built on OneChain</h2>
          <p className={styles.onechainDesc}>
            Zeraphim: Ascension leverages OneChain Move-based infrastructure for secure, fast, and
            cost-effective on-chain gaming. All quests, rewards, and progression are verifiable through
            event-based architecture and live leaderboard indexing.
          </p>
          <div className={styles.techStack}>
            <span className={styles.techBadge}>Move Smart Contracts</span>
            <span className={styles.techBadge}>Event-Based Indexer</span>
            <span className={styles.techBadge}>On-Chain Verification</span>
          </div>
        </section>

        <section id="proof" className={styles.contentSection} ref={proofRef}>
          <h2 className={`${orbitron.className} ${styles.sectionTitle}`}>Working MVP</h2>
          <div className={styles.proofGrid}>
            <div className={styles.proofItem}>
              <div className={styles.proofLabel}>Status</div>
              <div className={styles.proofValue}>Live on OneChain Testnet</div>
            </div>
            <div className={styles.proofItem}>
              <div className={styles.proofLabel}>Smart Contracts</div>
              <div className={styles.proofValue}>Deployed and Verified</div>
            </div>
            <div className={styles.proofItem}>
              <div className={styles.proofLabel}>Transactions</div>
              <Link href="/docs/proof.md" className={styles.proofLink}>
                View Proof
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2 className={`${orbitron.className} ${styles.ctaTitle}`}>{copy.readyToAscend}</h2>
          <p className={`${shareTechMono.className} ${styles.ctaSubtitle}`}>{copy.ctaSubtitle}</p>
          <div className={styles.ctaActions}>
            <button
              className={`${shareTechMono.className} ${styles.actionPrimary}`}
              type="button"
              onClick={
                isConnected
                  ? disconnectWallet
                  : () => {
                      setConnectModalOpen(true);
                    }
              }
            >
              {isConnected ? copy.disconnectWallet : copy.connectWallet}
            </button>
            <Link className={`${shareTechMono.className} ${styles.actionSecondary}`} href="/leaderboard">
              {copy.viewLeaderboard}
            </Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Image src="/icons/icon.svg" alt="Zeraphim mark" width={26} height={26} />
              <span className={`${orbitron.className} ${styles.footerBrandName}`}>
                Zeraphim: Ascension
              </span>
            </div>

            <nav className={`${shareTechMono.className} ${styles.footerLinks}`}>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/activity">Activity</Link>
              <Link href="/docs">Docs</Link>
            </nav>

            <div className={styles.footerDivider} aria-hidden />

            <div className={styles.footerBadges}>
              <span className={styles.footerBadge}>Move Smart Contracts</span>
              <span className={styles.footerBadge}>Event-Based Indexer</span>
              <span className={styles.footerBadge}>OneChain Testnet</span>
              <span className={styles.footerBadge}>On-Chain Verification</span>
            </div>

            <p className={`${shareTechMono.className} ${styles.footerMeta}`}>
              Complete on-chain quests · Earn rewards · Evolve your Wings
            </p>

            <p className={`${shareTechMono.className} ${styles.footerCopy}`}>
              © 2025 Zeraphim: Ascension · Built for OneChain Hackathon
            </p>
          </div>
        </footer>

        <div className={styles.cornerOne} aria-hidden />
        <div className={styles.cornerTwo} aria-hidden />
        <div className={styles.cornerThree} aria-hidden />
        <div className={styles.cornerFour} aria-hidden />
      </section>

      <ConnectWalletModal
        open={isConnectModalOpen}
        isConnecting={status === "loading"}
        onClose={() => setConnectModalOpen(false)}
        onConnect={connectSelectedWallet}
      />
    </main>
  );
};
