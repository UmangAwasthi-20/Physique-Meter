import Link from "next/link";

export default function ProgressPage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Physique<br /><span>Meter AI</span></div>
        <nav className="nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link className="active" href="/progress">Progress</Link>
          <Link href="/report">AI Report</Link>
        </nav>
      </aside>
      <main className="main">
        <p className="eyebrow">// Transformation Comparison</p>
        <h1>Progress History</h1>
        <section className="compare">
          <article className="photo-tile"><strong>Before</strong><span className="muted">May 02 - 84.4 kg</span></article>
          <article className="photo-tile"><strong>After</strong><span className="muted">Today - 82.0 kg</span></article>
        </section>
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Weekly Progress Summary</h2>
          <p className="muted">Weight is trending down while estimated lean mass is stable. Shoulder-to-waist ratio is improving gradually.</p>
        </section>
      </main>
    </div>
  );
}
