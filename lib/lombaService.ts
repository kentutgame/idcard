import { supabase, isSupabaseConfigured } from './supabase';
import { Lomba } from '@/types/lomba';

const STORAGE_KEY_LOMBA = 'loba_competition_data';

// Helper mapping format Database Supabase ke Type Lomba
function mapDbToLomba(row: Record<string, unknown>): Lomba {
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
    rounds: Array.isArray(row.rounds) ? (row.rounds as Lomba['rounds']) : [],
    multiMatches: Array.isArray(row.multi_matches) ? (row.multi_matches as Lomba['multiMatches']) : [],
    hasilJuara: (row.hasil_juara as Lomba['hasilJuara']) || { juara1: null, juara2: null, juara3: null }
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
    multi_matches: lomba.multiMatches || [],
    hasil_juara: lomba.hasilJuara,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mengambil semua data lomba dari Supabase (dengan fallback ke localStorage jika tabel belum dibuat/offline)
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
        // Simpan juga salinan ke localStorage sebagai backup offline
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_LOMBA, JSON.stringify(mapped));
        }
        return { data: mapped, isCloud: true };
      } else if (error) {
        console.warn('Supabase query error:', error.message);
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
 * Menyimpan / memperbarui lomba ke Supabase dan localStorage
 */
export async function saveLombaToDb(lomba: Lomba): Promise<{ success: boolean; isCloud: boolean; errorMsg?: string }> {
  let isCloudSuccess = false;
  let errorMsg: string | undefined;

  // 1. Simpan ke Supabase Cloud
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = mapLombaToDb(lomba);
      const { error } = await supabase
        .from('lomba_competitions')
        .upsert(dbPayload, { onConflict: 'id' });

      if (!error) {
        isCloudSuccess = true;
      } else {
        errorMsg = error.message;
        console.warn('Upsert ke Supabase gagal:', error.message);

        // Fallback retry jika kolom multi_matches belum ada di tabel Supabase
        if (error.message.includes('multi_matches')) {
          const { multi_matches, ...payloadWithoutMulti } = dbPayload;
          void multi_matches;
          const retryRes = await supabase
            .from('lomba_competitions')
            .upsert(payloadWithoutMulti, { onConflict: 'id' });

          if (!retryRes.error) {
            isCloudSuccess = true;
            errorMsg = undefined;
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Supabase upsert exception:', err);
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  // 2. Simpan juga selalu ke localStorage sebagai backup offline
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
