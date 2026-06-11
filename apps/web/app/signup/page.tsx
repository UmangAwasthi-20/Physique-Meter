import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="main">
      <p className="eyebrow">// Step 01 - Athlete Profile</p>
      <h1 className="hero-title">Set Your Baseline</h1>
      <section className="card" style={{ maxWidth: 760 }}>
        <form className="form">
          <div className="grid">
            <label className="field span-6">Name<input defaultValue="Umang Awasthi" /></label>
            <label className="field span-6">Email<input type="email" placeholder="you@example.com" /></label>
            <label className="field span-6">Password<input type="password" /></label>
            <label className="field span-6">Gender<select defaultValue="male"><option value="male">Male</option><option value="female">Female</option></select></label>
            <label className="field span-4">Age<input type="number" placeholder="29" /></label>
            <label className="field span-4">Height (cm)<input type="number" placeholder="178" /></label>
            <label className="field span-4">Weight (kg)<input type="number" placeholder="82" /></label>
          </div>
          <Link className="button" href="/dashboard">Create account</Link>
        </form>
      </section>
    </main>
  );
}
