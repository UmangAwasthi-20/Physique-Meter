import Link from "next/link";
import { Download } from "lucide-react";

export default function CustomerDashboardPage() {
  const orders = [
    { id: "ORD-1001", product: "Weight Gain Shake PDF", date: "Jun 11, 2026", status: "Paid" },
    { id: "ORD-1002", product: "Vegetarian Muscle Gain Guide", date: "Jun 11, 2026", status: "Pending" }
  ];

  return (
    <main className="main">
      <p className="eyebrow">// Customer Dashboard</p>
      <h1>Purchased PDFs</h1>
      <section className="card">
        <table className="table">
          <thead><tr><th>Order</th><th>Product</th><th>Date</th><th>Status</th><th>Access</th></tr></thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.product}</td>
                <td>{order.date}</td>
                <td><span className="badge">{order.status}</span></td>
                <td>{order.status === "Paid" ? <button className="button"><Download size={16} /> Download</button> : "Locked"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p><Link href="/products">Buy another guide</Link></p>
    </main>
  );
}
