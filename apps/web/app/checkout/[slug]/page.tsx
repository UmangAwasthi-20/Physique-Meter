"use client";

import Link from "next/link";
import { CheckCircle, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const products: Record<string, { name: string; price: number; downloadUrl: string }> = {
  "weight-gain-shake-pdf": {
    name: "Weight Gain Shake PDF",
    price: 49,
    downloadUrl: "/sample-weight-gain-shake.pdf"
  },
  "vegetarian-muscle-gain-guide": {
    name: "Vegetarian Muscle Gain Guide",
    price: 99,
    downloadUrl: "/sample-vegetarian-muscle-guide.pdf"
  }
};

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const product = products[params.slug] || products["weight-gain-shake-pdf"];
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const upiLink = useMemo(() => `upi://pay?pa=your-upi-id@ybl&pn=Physique%20Meter%20AI&am=${product.price}&cu=INR`, [product.price]);

  return (
    <main className="main">
      <p className="eyebrow">// Secure Checkout</p>
      <h1 className="hero-title">{product.name}</h1>
      <section className="grid">
        <article className="card span-6">
          <h2>Customer Details</h2>
          <form className="form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
            <label className="field">Name<input required placeholder="Your name" /></label>
            <label className="field">WhatsApp optional<input type="tel" placeholder="+91..." /></label>
            <label className="field">Email<input required type="email" placeholder="you@example.com" /></label>
            <label className="field">Product<input readOnly value={product.name} /></label>
            <label className="field">Amount<input readOnly value={`₹${product.price}`} /></label>
            <label className="field">UTR ID<input placeholder="UPI transaction / UTR ID" /></label>
            <label className="field">Payment Screenshot<input type="file" accept="image/*" /></label>
            <button className="button" type="submit">Save Details</button>
          </form>
          {submitted && <p className="muted"><CheckCircle size={16} /> Details saved. Complete payment and submit UTR/screenshot for admin verification.</p>}
        </article>

        <article className="card span-6">
          <h2>Pay ₹{product.price} with PhonePe</h2>
          <div className="qr-box">
            <div>
              <QrCode size={88} color="#1184ff" />
              <p>Scan admin PhonePe QR or open UPI payment link.</p>
              <a className="button secondary" href={upiLink}>Open UPI App</a>
            </div>
          </div>
          <p className="muted">In production, the admin confirms payment from the admin panel or via PhonePe gateway callback.</p>
          <button className="button" onClick={() => { setPaymentSubmitted(true); router.push("/thank-you"); }} disabled={!submitted}>Submit Payment Details</button>
        </article>

        <article className="card span-12">
          <h2>Download Access</h2>
          {paymentSubmitted ? (
            <p className="muted">Payment details submitted. Admin will verify UTR/screenshot before the PDF is sent.</p>
          ) : (
            <p className="muted">Download unlocks after customer details and successful payment confirmation.</p>
          )}
          <p><Link href="/customer">View customer dashboard</Link></p>
        </article>
      </section>
    </main>
  );
}
