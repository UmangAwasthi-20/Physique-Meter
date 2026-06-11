import { Download, Upload } from "lucide-react";

export default function AdminPage() {
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
            <thead><tr><th>Name</th><th>Email</th><th>Purchase</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Umang</td><td>umang@example.com</td><td>Weight Gain Shake PDF</td><td>Jun 11, 2026</td><td><span className="badge">Paid</span></td></tr>
              <tr><td>Lead User</td><td>lead@example.com</td><td>Vegetarian Muscle Gain Guide</td><td>Jun 11, 2026</td><td><span className="badge">Pending</span></td></tr>
            </tbody>
          </table>
          <button className="button" style={{ marginTop: 16 }}><Download size={18} /> Download Customer Data</button>
        </article>
      </section>
    </main>
  );
}
