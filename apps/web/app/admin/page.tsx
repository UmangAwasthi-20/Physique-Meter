import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Download, Upload } from "lucide-react";

async function loginAdmin(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("physique_admin", "1", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: 60 * 60 * 8
    });
    redirect("/admin");
  }
  redirect("/admin?error=1");
}

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("physique_admin")?.value === "1";
  const params = searchParams ? await searchParams : {};

  if (!isAdmin) {
    return (
      <main className="main">
        <p className="eyebrow">// Protected Admin</p>
        <h1>Admin Login</h1>
        <section className="card" style={{ maxWidth: 460 }}>
          <form className="form" action={loginAdmin}>
            <label className="field">Admin Password<input name="password" type="password" required /></label>
            <button className="button" type="submit">Login</button>
          </form>
          {params.error && <p style={{ color: "#ff6b6b" }}>Incorrect admin password.</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <p className="eyebrow">// Admin Panel</p>
      <h1>Products, Orders, Leads</h1>
      <section className="grid">
        <article className="card span-4">
          <h2>Upload PDF</h2>
          <form className="form">
            <label className="field">Product Name<input placeholder="Gym Transformation Guide" /></label>
            <label className="field">Price INR<input type="number" placeholder="99" /></label>
            <label className="field">PDF File<input type="file" accept="application/pdf" /></label>
            <button className="button"><Upload size={18} /> Upload</button>
          </form>
        </article>
        <article className="card span-8">
          <h2>Recent Orders</h2>
          <table className="table">
            <thead><tr><th>Date</th><th>Name</th><th>WhatsApp</th><th>Email</th><th>Product</th><th>Amount</th><th>UTR ID</th><th>Payment Screenshot</th><th>Status</th><th>PDF Sent</th></tr></thead>
            <tbody>
              <tr><td>Jun 11, 2026</td><td>Umang</td><td>+91...</td><td>umang@example.com</td><td>Weight Gain Shake PDF</td><td>₹49</td><td>1234567890</td><td>screenshot.jpg</td><td><span className="badge">Verified</span></td><td>No</td></tr>
              <tr><td>Jun 11, 2026</td><td>Lead User</td><td>+91...</td><td>lead@example.com</td><td>Vegetarian Muscle Gain Guide</td><td>₹99</td><td>Pending</td><td>Not uploaded</td><td><span className="badge">Pending</span></td><td>No</td></tr>
            </tbody>
          </table>
          <button className="button" style={{ marginTop: 16 }}><Download size={18} /> Download Customer Data</button>
        </article>
      </section>
    </main>
  );
}
