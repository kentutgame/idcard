import { supabase, isSupabaseConfigured } from './supabase';
import { Lomba } from '@/types/lomba';

const STORAGE_KEY_LOMBA = 'loba_competition_data';

// Helper mapping format Database Supabase ke Type Lomba
function mapDbToLomba(row: any): Lomba {
  return {
    id: row.id,
    judul: row.judul,
    kategori: row.kategori,
    tipePeserta: row.tipe_peserta,
    formatTanding: row.format_tanding,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pesertaIndividu: row.peserta_individu || [],
    daftarTim: row.daftar_tim || [],
    rounds: row.rounds || [],
    hasilJuara: row.hasil_juara || { juara1: null, juara2: null, juara3: null }
  };
}

// Helper mapping Type Lomba ke format Database Supabase
function mapLombaToDb(lomba: Lomba) {
  return {
    id: lomba.id,
    judul: lomba.judul,
    kategori: lomba.kategori,
    tipe_peserta: lomba.tipePeserta,
    format_tanding: lomba.formatTanding,
    status: lomba.status,
    peserta_individu: lomba.pesertaIndividu,
    daftar_tim: lomba.daftarTim,
    rounds: lomba.rounds,
    hasil_juara: lomba.hasilJuara,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mengambil semua data lomba dari Supabase (dengan fallback ke localStorage jika tabel belum dibuat/offline)
 */
export async function fetchLombaList(): Promise<{ data: Lomba[]; isCloud: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lomba_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(mapDbToLomba);
        // Simpan juga salinan ke localStorage sebagai backup offline
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_LOMBA, JSON.stringify(mapped));
        }
        return { data: mapped, isCloud: true };
      } else if (error) {
        console.warn('Gagal memuat dari Supabase (mungkin tabel lomba_competitions belum dibuat di SQL editor), fallback ke local:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback ke local storage:', err);
    }
  }

  // Fallback Local Storage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_LOMBA);
    if (saved) {
      try {
        return { data: JSON.parse(saved), isCloud: false };
      } catch (e) {
        console.error(e);
      }
    }
  }

  return { data: [], isCloud: false };
}

/**
 * Menyimpan / memperbarui lomba ke Supabase dan localStorage
 */
export async function saveLombaToDb(lomba: Lomba): Promise<{ success: boolean; isCloud: boolean }> {
  let isCloudSuccess = false;

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = mapLombaToDb(lomba);
      const { error } = await supabase
        .from('lomba_competitions')
        .upsert(dbPayload, { onConflict: 'id' });

      if (!error) {
        isCloudSuccess = true;
      } else {
        console.warn('Upsert ke Supabase gagal:', error.message);
      }
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }
  }

  return { success: true, isCloud: isCloudSuccess };
}

/**
 * Menghapus data lomba dari Supabase dan localStorage
 */
export async function deleteLombaFromDb(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('lomba_competitions')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }
  return false;
}
