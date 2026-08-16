export type KategoriLomba = 'anak-anak' | 'remaja' | 'ibu-ibu' | 'umum';
export type TipePeserta = 'kelompok' | 'individu';
export type FormatTanding = 'bracket' | 'sekaligus';
export type StatusLomba = 'draft' | 'berlangsung' | 'selesai';
export type StatusMatch = 'pending' | 'ongoing' | 'completed';

export interface PesertaIndividu {
  id: string;
  nama: string;
  nomorPeserta?: string;
  catatan?: string;
  skor?: number;
  ranking?: number;
}

export interface TimPeserta {
  id: string;
  namaTim: string;
  anggota: string[]; // nama-nama anggota tim
  kapten?: string;
  catatan?: string;
  skor?: number;
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
  
  // Data Pertandingan Bracket
  rounds: BracketRound[];
  
  // Hasil Akhir
  hasilJuara: HasilJuara;
}

export interface UserAuth {
  username: string;
  namaLengkap: string;
  role: 'admin' | 'panitia';
  isLoggedIn: boolean;
}
