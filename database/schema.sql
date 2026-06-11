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
