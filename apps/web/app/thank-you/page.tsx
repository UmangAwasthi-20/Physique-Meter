import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  return (
    <main className="main">
      <p className="eyebrow">// Order Submitted</p>
      <h1 className="hero-title">Thank You</h1>
      <section className="card" style={{ maxWidth: 680 }}>
        <CheckCircle color="#63d68f" size={42} />
        <h2>Payment details received</h2>
        <p className="muted">
          Your order is pending manual UPI verification. The admin will verify your UTR ID and payment screenshot,
          then send the PDF or unlock access.
        </p>
        <Link className="button" href="/products">Back to products</Link>
      </section>
    </main>
  );
}
