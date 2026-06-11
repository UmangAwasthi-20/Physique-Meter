CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS athlete_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  height_cm NUMERIC(6,2) NOT NULL,
  current_weight_kg NUMERIC(6,2) NOT NULL,
  target_weight_kg NUMERIC(6,2),
  fitness_goal TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(6,2) NOT NULL,
  body_fat_percent NUMERIC(5,2),
  shoulder_waist_ratio NUMERIC(5,3),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress_entry_id UUID REFERENCES progress_entries(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  weekly_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_inr INTEGER NOT NULL,
  pdf_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT,
  amount_inr INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'phonepe_qr',
  utr_id TEXT,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected', 'PDF Sent')),
  download_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  pdf_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  pdf_sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  purchase TEXT NOT NULL,
  amount_inr INTEGER NOT NULL,
  utr_id TEXT,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected', 'PDF Sent')),
  pdf_sent BOOLEAN NOT NULL DEFAULT FALSE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  google_sheet_synced BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO products (slug, name, description, price_inr, pdf_url)
VALUES
  ('weight-gain-shake-pdf', 'Weight Gain Shake PDF', 'High-calorie shake recipes for clean weight gain.', 49, 'https://drive.google.com/example-weight-gain-shake.pdf'),
  ('vegetarian-muscle-gain-guide', 'Vegetarian Muscle Gain Guide', 'Indian vegetarian muscle-gain nutrition guide.', 99, 'https://drive.google.com/example-vegetarian-guide.pdf')
ON CONFLICT (slug) DO NOTHING;
