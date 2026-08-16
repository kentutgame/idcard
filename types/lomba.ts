export type KategoriLomba = 'anak-anak' | 'remaja' | 'ibu-ibu' | 'umum';
export type TipePeserta = 'kelompok' | 'individu';
export type FormatTanding = 'bracket' | 'multi_match' | 'sekaligus';
export type StatusLomba = 'draft' | 'berlangsung' | 'selesai';
export type StatusMatch = 'pending' | 'ongoing' | 'completed';

export interface PesertaIndividu {
  id: string;
  nama: string;
  nomorPeserta?: string;
  catatan?: string;
  skor?: number;
  poin?: number;
  ranking?: number;
}

export interface TimPeserta {
  id: string;
  namaTim: string;
  anggota: string[]; // nama-nama anggota tim
  kapten?: string;
  catatan?: string;
  skor?: number;
  poin?: number;
  ranking?: number;
}

export interface PesertaRef {
  id: string;
  nama: string; // nama tim atau nama peserta individu
  detailAnggota?: string[]; // jika tim, daftar nama anggotanya
  tipe: TipePeserta;
}

export interface Match {
  id: string;
  roundIndex: number; // 0 = Babak 1/Penyisihan, 1 = Perempat/Semifinal, dst.
  matchIndex: number; // index di round tersebut
  namaBabak: string; // misal "Penyisihan 1", "Semifinal 1", "Final", "Perebutan Juara 3"
  pesertaA: PesertaRef | null;
  pesertaB: PesertaRef | null;
  skorA: number;
  skorB: number;
  pemenangId: string | null;
  status: StatusMatch;
  catatan?: string;
  nextMatchId?: string; // ID match babak selanjutnya yang dituju pemenang
  nextMatchSlot?: 'A' | 'B'; // slot tujuan di match selanjutnya
}

export interface BracketRound {
  nama: string; // "Babak 1", "Perempat Final", "Semifinal", "Final", "Perebutan Juara 3"
  roundIndex: number;
  matches: Match[];
}

export interface MultiMatchParticipant {
  peserta: PesertaRef;
  skor: number; // skor pertandingan (misal waktu atau perolehan)
  poin: number; // poin yang ditentukan panitia (misal Juara 1 = 100 poin, Juara 2 = 75 poin, dll)
  ranking?: number; // 1, 2, 3, 4...
  catatan?: string;
}

export interface MultiMatch {
  id: string;
  namaMatch: string; // Contoh: "Pertandingan 1 / Heat A", "Pertandingan 2 / Heat B", "Babak Final"
  pesertaList: MultiMatchParticipant[];
  status: StatusMatch;
  catatan?: string;
  pemenangId?: string | null;
}

export interface HasilJuara {
  juara1: PesertaRef | null;
  juara2: PesertaRef | null;
  juara3: PesertaRef | null;
  juaraHarapan?: PesertaRef | null;
  catatanJuara?: string;
}

export interface Lomba {
  id: string;
  judul: string;
  kategori: KategoriLomba;
  tipePeserta: TipePeserta;
  formatTanding: FormatTanding;
  status: StatusLomba;
  createdAt: string;
  updatedAt: string;
  
  // Data Peserta
  pesertaIndividu: PesertaIndividu[];
  daftarTim: TimPeserta[];
  
  // Data Pertandingan Bracket (1 vs 1)
  rounds: BracketRound[];
  
  // Data Pertandingan Multi-Peserta (>2 per match dengan poin)
  multiMatches?: MultiMatch[];
  
  // Hasil Akhir
  hasilJuara: HasilJuara;
}

export interface UserAuth {
  username: string;
  namaLengkap: string;
  role: 'admin' | 'panitia';
  isLoggedIn: boolean;
}
