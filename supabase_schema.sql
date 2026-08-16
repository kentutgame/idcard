-- ============================================================
-- SQL Schema untuk ID Card Panitia & Sistem Lomba 17-an (IPPCW REBORN)
-- Jalankan query ini di menu SQL Editor di Supabase Dashboard Anda
-- (Aman dijalankan berkali-kali / idempotent)
-- ============================================================

-- 1. Buat Tabel panitia_cards (Untuk ID Card)
CREATE TABLE IF NOT EXISTS public.panitia_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'PANITIA',
    division VARCHAR(100) DEFAULT 'Umum',
    card_number VARCHAR(50),
    photo_url TEXT,
    photo_scale NUMERIC DEFAULT 1,
    photo_position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
    theme_variant VARCHAR(50) DEFAULT 'gold_modern',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.panitia_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read panitia_cards" ON public.panitia_cards;
DROP POLICY IF EXISTS "Allow public insert panitia_cards" ON public.panitia_cards;
DROP POLICY IF EXISTS "Allow public update panitia_cards" ON public.panitia_cards;
DROP POLICY IF EXISTS "Allow public delete panitia_cards" ON public.panitia_cards;

CREATE POLICY "Allow public read panitia_cards" ON public.panitia_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert panitia_cards" ON public.panitia_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update panitia_cards" ON public.panitia_cards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete panitia_cards" ON public.panitia_cards FOR DELETE USING (true);


-- 2. Buat Tabel lomba_competitions (Untuk Sistem Manajemen Lomba, Bracket, & Multi-Match)
CREATE TABLE IF NOT EXISTS public.lomba_competitions (
    id TEXT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    tipe_peserta VARCHAR(50) NOT NULL,
    format_tanding VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    peserta_individu JSONB DEFAULT '[]'::jsonb,
    daftar_tim JSONB DEFAULT '[]'::jsonb,
    rounds JSONB DEFAULT '[]'::jsonb,
    multi_matches JSONB DEFAULT '[]'::jsonb,
    heat_rounds JSONB DEFAULT '[]'::jsonb,
    hasil_juara JSONB DEFAULT '{"juara1": null, "juara2": null, "juara3": null}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom multi_matches & heat_rounds ada jika tabel sebelumnya sudah dibuat
ALTER TABLE public.lomba_competitions ADD COLUMN IF NOT EXISTS multi_matches JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.lomba_competitions ADD COLUMN IF NOT EXISTS heat_rounds JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.lomba_competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read lomba_competitions" ON public.lomba_competitions;
DROP POLICY IF EXISTS "Allow public insert lomba_competitions" ON public.lomba_competitions;
DROP POLICY IF EXISTS "Allow public update lomba_competitions" ON public.lomba_competitions;
DROP POLICY IF EXISTS "Allow public delete lomba_competitions" ON public.lomba_competitions;
DROP POLICY IF EXISTS "Allow public all on lomba_competitions" ON public.lomba_competitions;

CREATE POLICY "Allow public read lomba_competitions" ON public.lomba_competitions FOR SELECT USING (true);
CREATE POLICY "Allow public insert lomba_competitions" ON public.lomba_competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update lomba_competitions" ON public.lomba_competitions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete lomba_competitions" ON public.lomba_competitions FOR DELETE USING (true);
