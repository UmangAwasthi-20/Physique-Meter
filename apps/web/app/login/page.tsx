import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="main">
      <p className="eyebrow">// Welcome Back</p>
      <h1 className="hero-title">Login</h1>
      <section className="card" style={{ maxWidth: 480 }}>
        <form className="form">
          <label className="field">Email<input type="email" placeholder="you@example.com" /></label>
          <label className="field">Password<input type="password" placeholder="••••••••" /></label>
          <Link className="button" href="/dashboard">Login</Link>
        </form>
        <p className="muted">New here? <Link href="/signup">Create an account</Link>.</p>
      </section>
    </main>
  );
}
