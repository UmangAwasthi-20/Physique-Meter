import Link from "next/link";
import { ArrowRight, Camera, LineChart, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="main">
      <p className="eyebrow">// Physique Meter AI</p>
      <h1 className="hero-title">AI-powered physique analysis and progress tracking platform.</h1>
      <p className="muted" style={{ maxWidth: 720, fontSize: 18, lineHeight: 1.7 }}>
        Upload progress photos, track body metrics, generate AI physique reports, compare transformations,
        and export recruiter-ready PDF summaries.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
        <Link className="button" href="/signup">Create account <ArrowRight size={18} /></Link>
        <Link className="button secondary" href="/login">Login</Link>
        <Link className="button secondary" href="/products">View PDF Products</Link>
      </div>

      <section className="grid" style={{ marginTop: 34 }}>
        <article className="card span-4">
          <Sparkles color="#1184ff" />
          <h2>AI Physique Report</h2>
          <p className="muted">Strengths, weaknesses, suggested focus areas, and weekly summaries.</p>
        </article>
        <article className="card span-4">
          <Camera color="#1184ff" />
          <h2>Photo Timeline</h2>
          <p className="muted">Track uploads and compare front, side, and back progress over time.</p>
        </article>
        <article className="card span-4">
          <LineChart color="#1184ff" />
          <h2>Goal Tracker</h2>
          <p className="muted">Weight graphs, body-fat trends, and target-based recommendations.</p>
        </article>
      </section>
    </main>
  );
}
