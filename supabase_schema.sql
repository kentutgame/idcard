-- ============================================================
-- SQL Schema untuk ID Card Panitia 17-an (IPPCW REBORN)
-- Jalankan query ini di menu SQL Editor di Supabase Dashboard Anda
-- ============================================================

-- 1. Buat Tabel panitia_cards
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

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.panitia_cards ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Izinkan siapa saja membaca data kartu panitia (Public Read)
CREATE POLICY "Allow public read panitia_cards" 
ON public.panitia_cards 
FOR SELECT 
USING (true);

-- 4. Policy: Izinkan siapa saja membuat kartu panitia baru (Public Insert)
CREATE POLICY "Allow public insert panitia_cards" 
ON public.panitia_cards 
FOR INSERT 
WITH CHECK (true);

-- 5. Policy: Izinkan update/delete jika diperlukan
CREATE POLICY "Allow public update panitia_cards" 
ON public.panitia_cards 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete panitia_cards" 
ON public.panitia_cards 
FOR DELETE 
USING (true);
