import { supabase, isSupabaseConfigured } from './supabase';
import { Lomba, HeatRound, MultiMatch } from '@/types/lomba';

const STORAGE_KEY_LOMBA = 'loba_competition_data';

// Helper mapping format Database Supabase ke Type Lomba
function mapDbToLomba(row: Record<string, unknown>): Lomba {
  let heatRounds: HeatRound[] = [];

  if (Array.isArray(row.heat_rounds) && row.heat_rounds.length > 0) {
    heatRounds = row.heat_rounds as HeatRound[];
  } else if (Array.isArray(row.multi_matches) && row.multi_matches.length > 0) {
    heatRounds = [
      {
        id: 'round_1_restored',
        nomorBabak: 1,
        namaBabak: 'Babak 1 (Penyisihan)',
        matches: row.multi_matches as MultiMatch[]
      }
    ];
  } else if (row.format_tanding === 'multi_match' && Array.isArray(row.rounds) && row.rounds.length > 0) {
    // Cek jika tersimpan di kolom rounds sebagai fallback
    heatRounds = row.rounds as unknown as HeatRound[];
  }

  return {
    id: String(row.id || ''),
    judul: String(row.judul || ''),
    kategori: (row.kategori as Lomba['kategori']) || 'anak-anak',
    tipePeserta: (row.tipe_peserta as Lomba['tipePeserta']) || 'kelompok',
    formatTanding: (row.format_tanding as Lomba['formatTanding']) || 'bracket',
    status: (row.status as Lomba['status']) || 'draft',
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    pesertaIndividu: Array.isArray(row.peserta_individu) ? (row.peserta_individu as Lomba['pesertaIndividu']) : [],
    daftarTim: Array.isArray(row.daftar_tim) ? (row.daftar_tim as Lomba['daftarTim']) : [],
    rounds: Array.isArray(row.rounds) && row.format_tanding === 'bracket' ? (row.rounds as Lomba['rounds']) : [],
    multiMatches: Array.isArray(row.multi_matches) ? (row.multi_matches as Lomba['multiMatches']) : [],
    heatRounds,
    hasilJuara: (row.hasil_juara as Lomba['hasilJuara']) || { juara1: null, juara2: null, juara3: null }
  };
}

// Helper mapping Type Lomba ke format Database Supabase
function mapLombaToDb(lomba: Lomba) {
  // Jika formatnya multi_match dan rounds kosong, simpan juga heatRounds ke dalam rounds sebagai backup kompatibilitas
  const backupRounds = lomba.formatTanding === 'multi_match' && lomba.heatRounds && lomba.heatRounds.length > 0
    ? lomba.heatRounds
    : lomba.rounds;

  return {
    id: lomba.id,
    judul: lomba.judul,
    kategori: lomba.kategori,
    tipe_peserta: lomba.tipePeserta,
    format_tanding: lomba.formatTanding,
    status: lomba.status,
    peserta_individu: lomba.pesertaIndividu,
    daftar_tim: lomba.daftarTim,
    rounds: backupRounds,
    multi_matches: lomba.multiMatches || [],
    heat_rounds: lomba.heatRounds || [],
    hasil_juara: lomba.hasilJuara,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mengambil semua data lomba dari Supabase (dengan fallback ke localStorage jika offline)
 */
export async function fetchLombaList(): Promise<{ data: Lomba[]; isCloud: boolean; errorMsg?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lomba_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(mapDbToLomba);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_LOMBA, JSON.stringify(mapped));
        }
        return { data: mapped, isCloud: true };
      } else if (error) {
        console.warn('Supabase fetch error:', error.message);
        return { data: getLocalLombaList(), isCloud: false, errorMsg: error.message };
      }
    } catch (err: unknown) {
      console.warn('Supabase fetch error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      return { data: getLocalLombaList(), isCloud: false, errorMsg: msg };
    }
  }

  return { data: getLocalLombaList(), isCloud: false };
}

function getLocalLombaList(): Lomba[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_LOMBA);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return [];
}

/**
 * Menyimpan / memperbarui lomba ke Supabase dan localStorage (Auto-fallback robust)
 */
export async function saveLombaToDb(lomba: Lomba): Promise<{ success: boolean; isCloud: boolean; errorMsg?: string }> {
  let isCloudSuccess = false;
  let errorMsg: string | undefined;

  // 1. Simpan ke Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = mapLombaToDb(lomba);

      // Percobaan 1: Simpan dengan semua kolom (termasuk heat_rounds & multi_matches)
      const res1 = await supabase
        .from('lomba_competitions')
        .upsert(dbPayload, { onConflict: 'id' });

      if (!res1.error) {
        isCloudSuccess = true;
      } else {
        console.warn('Supabase upsert percobaan 1 gagal:', res1.error.message);

        // Percobaan 2: Fallback jika kolom heat_rounds / multi_matches belum dibuat di tabel SQL
        // Data heatRounds tetap tersimpan aman di kolom 'rounds' (JSONB)
        const { heat_rounds, multi_matches, ...fallbackPayload } = dbPayload;
        void heat_rounds;
        void multi_matches;

        const res2 = await supabase
          .from('lomba_competitions')
          .upsert(fallbackPayload, { onConflict: 'id' });

        if (!res2.error) {
          isCloudSuccess = true;
          errorMsg = undefined;
        } else {
          errorMsg = res2.error.message;
          console.warn('Supabase upsert fallback gagal:', res2.error.message);
        }
      }
    } catch (err: unknown) {
      console.warn('Supabase upsert exception:', err);
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  // 2. Simpan selalu salinan ke localStorage sebagai backup
  if (typeof window !== 'undefined') {
    const localList = getLocalLombaList();
    const existingIdx = localList.findIndex(item => item.id === lomba.id);
    if (existingIdx >= 0) {
      localList[existingIdx] = lomba;
    } else {
      localList.unshift(lomba);
    }
    localStorage.setItem(STORAGE_KEY_LOMBA, JSON.stringify(localList));
  }

  return { success: true, isCloud: isCloudSuccess, errorMsg };
}

/**
 * Menghapus data lomba dari Supabase dan localStorage
 */
export async function deleteLombaFromDb(id: string): Promise<boolean> {
  let deletedFromCloud = false;

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('lomba_competitions')
        .delete()
        .eq('id', id);

      if (!error) deletedFromCloud = true;
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const localList = getLocalLombaList();
    const filtered = localList.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_LOMBA, JSON.stringify(filtered));
  }

  return deletedFromCloud;
}
