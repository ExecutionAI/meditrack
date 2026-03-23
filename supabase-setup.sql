-- ═══════════════════════════════════════════════════════════════════
-- MediTrack — Supabase Setup (public schema, no schema routing needed)
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- If you already ran the previous version, migrate the tables first:
-- ALTER TABLE meditrack.meal_logs SET SCHEMA public;
-- ALTER TABLE meditrack.weight_logs SET SCHEMA public;
-- DROP SCHEMA meditrack;

-- ── Fresh setup ────────────────────────────────────────────────────

-- 1. Meal logs (core table)
CREATE TABLE IF NOT EXISTS meal_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_type    text NOT NULL CHECK (meal_type IN ('desayuno', 'comida', 'cena', 'colacion')),
  date         date NOT NULL DEFAULT CURRENT_DATE,
  logged_at    timestamptz NOT NULL DEFAULT now(),
  portions     jsonb NOT NULL DEFAULT '{}',
  input_type   text CHECK (input_type IN ('foto_menu', 'foto_comida', 'voz', 'manual')),
  description  text,
  gpt_analysis jsonb,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_logs_date_idx      ON meal_logs (date DESC);
CREATE INDEX IF NOT EXISTS meal_logs_meal_type_idx ON meal_logs (meal_type);

-- 2. Weight log
CREATE TABLE IF NOT EXISTS weight_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weight_kg  numeric(5,2) NOT NULL,
  date       date NOT NULL DEFAULT CURRENT_DATE,
  notes      text,
  created_at timestamptz DEFAULT now()
);

-- Insert initial weight from doctor's record (skip if already exists)
INSERT INTO weight_logs (weight_kg, date, notes)
VALUES (179.3, '2023-12-07', 'Peso inicial — Doctor Marco Polo Rodríguez Torres (IMSS)')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- No schema exposure needed — tables live in public schema.
-- ═══════════════════════════════════════════════════════════════════
