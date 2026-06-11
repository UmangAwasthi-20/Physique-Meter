import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

const products = [
  {
    slug: "weight-gain-shake-pdf",
    name: "Weight Gain Shake PDF",
    price: 49,
    description: "High-calorie shake recipes for clean weight gain and daily consistency."
  },
  {
    slug: "vegetarian-muscle-gain-guide",
    name: "Vegetarian Muscle Gain Guide",
    price: 99,
    description: "Indian vegetarian muscle-gain meal plan, protein options, and weekly structure."
  }
];

export default function ProductsPage() {
  return (
    <main className="main">
      <p className="eyebrow">// Digital Products</p>
      <h1 className="hero-title">Gym Transformation Guides</h1>
      <p className="muted" style={{ maxWidth: 680 }}>
        Buy PDF guides using PhonePe QR payment. After payment confirmation, download access unlocks and the lead is stored in PostgreSQL and Google Sheets.
      </p>

      <section className="product-grid" style={{ marginTop: 28 }}>
        {products.map(product => (
          <article className="card" key={product.slug}>
            <FileText color="#1184ff" />
            <h2>{product.name}</h2>
            <p className="muted">{product.description}</p>
            <div className="price">₹{product.price}</div>
            <Link className="button" href={`/checkout/${product.slug}`}>
              Buy Now <ArrowRight size={18} />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
