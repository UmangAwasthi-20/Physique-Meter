import Link from "next/link";
import { FileDown } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Physique<br /><span>Meter AI</span></div>
        <nav className="nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/progress">Progress</Link>
          <Link className="active" href="/report">AI Report</Link>
        </nav>
      </aside>
      <main className="main">
        <p className="eyebrow">// Gemini Analysis</p>
        <h1>AI Physique Report</h1>
        <section className="grid">
          <article className="card span-12">
            <h2>Summary</h2>
            <p className="muted">
              Your shoulder-to-waist ratio appears improved compared to the previous upload.
              Upper chest development is lagging behind shoulder development, so prioritize incline pressing and controlled volume.
            </p>
          </article>
          <article className="card span-4"><h2>Strengths</h2><p className="muted">Shoulder width, consistent weight trend, improved waist control.</p></article>
          <article className="card span-4"><h2>Weaknesses</h2><p className="muted">Upper chest fullness and posterior chain visibility need more focus.</p></article>
          <article className="card span-4"><h2>Suggested Focus</h2><p className="muted">Incline press, lateral raises, protein consistency, weekly photos.</p></article>
        </section>
        <button className="button" style={{ marginTop: 16 }}><FileDown size={18} /> Export PDF Report</button>
      </main>
    </div>
  );
}
