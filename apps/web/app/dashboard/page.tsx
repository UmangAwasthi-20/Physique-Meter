import Link from "next/link";
import { Download, Moon, Upload } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Physique<br /><span>Meter AI</span></div>
        <nav className="nav">
          <Link className="active" href="/dashboard">Dashboard</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/report">AI Report</Link>
          <Link href="/">Logout</Link>
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <p className="eyebrow">// User Dashboard</p>
            <h1 style={{ margin: 0 }}>Welcome, Umang</h1>
          </div>
          <button className="button secondary"><Moon size={18} /> Dark Mode</button>
        </div>

        <section className="grid">
          <article className="card metric span-3"><span className="muted">Body Fat</span><strong>17.6%</strong></article>
          <article className="card metric span-3"><span className="muted">Weight</span><strong>82 kg</strong></article>
          <article className="card metric span-3"><span className="muted">Goal</span><strong>Fat Loss</strong></article>
          <article className="card metric span-3"><span className="muted">Score</span><strong>84</strong></article>

          <article className="card span-7">
            <h2>Weight Graph</h2>
            <div className="graph">
              {[72, 78, 68, 62, 58, 51, 46, 43].map((height, index) => (
                <div className="bar" style={{ height: `${height}%` }} key={index} />
              ))}
            </div>
          </article>

          <article className="card span-5">
            <h2>Goal Tracker</h2>
            <p className="muted">Target weight: 76 kg</p>
            <p className="muted">Estimated time remaining: 10 weeks</p>
            <p className="muted">Suggested weekly change: -0.6 kg</p>
            <Link className="button" href="/report"><Download size={18} /> View AI report</Link>
          </article>

          <article className="card span-12">
            <h2>Progress Photo Timeline</h2>
            <div className="timeline">
              {["Week 1", "Week 4", "Week 8", "Today"].map(label => (
                <div className="photo-tile" key={label}><strong>{label}</strong><span className="muted">Front / side / back</span></div>
              ))}
            </div>
            <button className="button" style={{ marginTop: 14 }}><Upload size={18} /> Upload progress photo</button>
          </article>
        </section>
      </main>
    </div>
  );
}
