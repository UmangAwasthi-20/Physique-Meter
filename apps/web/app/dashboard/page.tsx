"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Flame, Moon, Sparkles, Trophy, Upload } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trend = [
  { week: "W1", score: 68, weight: 84.4 },
  { week: "W2", score: 70, weight: 83.9 },
  { week: "W3", score: 72, weight: 83.2 },
  { week: "W4", score: 76, weight: 82.8 },
  { week: "W5", score: 79, weight: 82.4 },
  { week: "W6", score: 82, weight: 82.0 },
  { week: "Now", score: 84, weight: 81.7 }
];

const metrics = [
  { label: "Body Fat", value: "14.8%", helper: "Down 1.2%", Icon: Sparkles },
  { label: "Streak", value: "18 days", helper: "Personal best", Icon: Flame },
  { label: "Level", value: "7", helper: "760 XP to Level 8", Icon: Trophy },
  { label: "Goal ETA", value: "Aug 18", helper: "10 weeks remaining", Icon: Download }
];

export default function DashboardPage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Physique<br /><span>Meter AI</span></div>
        <nav className="nav">
          <Link className="active" href="/dashboard">Dashboard</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/report">AI Report</Link>
          <Link href="/products">PDF Store</Link>
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <p className="eyebrow">// Premium Fitness OS</p>
            <h1 className="hero-title">Physique Score 84</h1>
          </div>
          <button className="button secondary"><Moon size={18} /> Dark Mode</button>
        </div>

        <section className="grid">
          {metrics.map(({ label, value, helper, Icon }, index) => (
            <motion.article
              className="card metric span-3"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              key={label}
            >
              <Icon size={22} color="#1184ff" />
              <span className="muted">{label}</span>
              <strong>{value}</strong>
              <span className="muted">{helper}</span>
            </motion.article>
          ))}

          <motion.article className="card span-7" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>Score Momentum</h2>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="score" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#1184ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1184ff" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="week" stroke="#9ea7b7" />
                  <YAxis stroke="#9ea7b7" />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#1184ff" fill="url(#score)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.article>

          <motion.article className="card span-5" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="eyebrow">// AI Coach</p>
            <h2>Insight Of The Week</h2>
            <p className="muted">
              Your shoulder-to-waist ratio appears improved compared to the previous upload.
              Upper chest development is lagging behind shoulder development, so bias incline pressing.
            </p>
            <Link className="button" href="/report"><Sparkles size={18} /> Generate report</Link>
          </motion.article>

          <article className="card span-12">
            <h2>Transformation Timeline</h2>
            <div className="timeline">
              {["Week 1", "Week 4", "Week 8", "Today"].map(label => (
                <motion.div className="photo-tile" whileHover={{ y: -6 }} key={label}>
                  <strong>{label}</strong><span className="muted">Front / side / back</span>
                </motion.div>
              ))}
            </div>
            <button className="button" style={{ marginTop: 14 }}><Upload size={18} /> Upload progress photo</button>
          </article>
        </section>
      </main>
    </div>
  );
}
