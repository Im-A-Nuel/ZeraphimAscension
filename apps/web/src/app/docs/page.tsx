import Link from "next/link";
import { BookOpen, FileText, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";

const docs = [
  {
    title: "On-Chain Proof",
    description: "Transaction proofs and explorer links from Zeraphim testnet runs.",
    href: "/docs/proof.md",
    cta: "Open proof.md",
  },
  {
    title: "Architecture",
    description: "System design overview: web app, API indexer, and Move smart contracts.",
    href: "/docs/architecture.md",
    cta: "Open architecture.md",
  },
  {
    title: "Pitch & Demo",
    description: "Problem statement, gameplay loop, and demo narrative for hackathon judging.",
    href: "/docs/pitch.md",
    cta: "Open pitch.md",
  },
];

export default function DocsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <BookOpen size={20} />
          <span>Zeraphim Docs</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/dashboard">Play</Link>
          <Link href="/docs" className={styles.active}>
            Docs
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <h1>Documentation Hub</h1>
        <p>Core references for OneChain MVP validation, architecture, and demo flow.</p>
      </section>

      <section className={styles.grid}>
        {docs.map((item, index) => (
          <article key={item.title} className={styles.card}>
            <div className={styles.cardIcon}>
              {index === 0 ? <ShieldCheck size={18} /> : <FileText size={18} />}
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link href={item.href} className={styles.link}>
              {item.cta}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
