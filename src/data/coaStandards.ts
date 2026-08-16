import { Account, AccountingStandard, AccountCategory, NormalBalance } from '../types/accounting';

export interface StandardMeta {
  standard: AccountingStandard;
  name: string;
  shortName: string;
  tagline: string;
  targetAudience: string;
  legalBasis: string;
  measurementBasis: string;
  requiredReports: string[];
  optionalReports: string[];
  keyFeatures: string[];
  badges: string[];
}

export const STANDARDS_INFO: Record<AccountingStandard, StandardMeta> = {
  [AccountingStandard.PSAK]: {
    standard: AccountingStandard.PSAK,
    name: 'SAK Umum / PSAK (Adopsi Penuh IFRS)',
    shortName: 'SAK Umum',
    tagline: 'Standar Akuntansi Keuangan Berbasis IFRS untuk Entitas Publik & Korporasi Besar',
    targetAudience: 'Emiten, Perusahaan Terbuka (Tbk), BUMN, Perbankan, dan Entitas Berakuntabilitas Publik',
    legalBasis: 'Dewan Standar Akuntansi Keuangan (DSAK IAI)',
    measurementBasis: 'Biaya Historis + Nilai Wajar (Fair Value), Model Revaluasi, Impairment (ECL)',
    requiredReports: [
      'Laporan Posisi Keuangan (Neraca)',
      'Laporan Laba Rugi & Penghasilan Komprehensif Lain (OCI)',
      'Laporan Perubahan Ekuitas',
      'Laporan Arus Kas (Metode Langsung / Tidak Langsung)',
      'Catatan Atas Laporan Keuangan (CALK)',
    ],
    optionalReports: [],
    keyFeatures: [
      'Model Nilai Wajar (Fair Value) & Revaluasi Aset (PSAK 16)',
      'Cadangan Kerugian Penurunan Nilai ECL (PSAK 71)',
      'Pengakuan Pendapatan 5 Langkah (PSAK 72)',
      'Aset Hak-Guna & Liabilitas Sewa (PSAK 73)',
      'Pajak Penghasilan Tangguhan (PSAK 46)',
    ],
    badges: ['IFRS Based', 'Fair Value', '5 Laporan Wajib', 'Kompleks'],
  },
  [AccountingStandard.SAK_EMKM]: {
    standard: AccountingStandard.SAK_EMKM,
    name: 'SAK EMKM (Entitas Mikro, Kecil, dan Menengah)',
    shortName: 'SAK EMKM',
    tagline: 'Standar Akuntansi Paling Sederhana Khusus UMKM Tanpa Akuntabilitas Publik Signifikan',
    targetAudience: 'Usaha Mikro, Usaha Kecil, Usaha Menengah (UMKM), Toko, Warung, Jasa Skala Kecil',
    legalBasis: 'DSAK IAI (Berlaku Efektif 1 Januari 2018)',
    measurementBasis: 'Biaya Historis Murni (Historical Cost Only) — Tidak Ada Nilai Wajar / Revaluasi',
    requiredReports: [
      'Laporan Posisi Keuangan',
      'Laporan Laba Rugi',
      'Catatan Atas Laporan Keuangan (CALK)',
    ],
    optionalReports: [
      'Laporan Perubahan Ekuitas (Opsional)',
      'Laporan Arus Kas (Opsional)',
    ],
    keyFeatures: [
      'Struktur paling sederhana dan mudah dipahami',
      'Hanya 3 Laporan Keuangan Wajib',
      'Penyusutan Aset Garis Lurus Sederhana',
      'Bebas dari Pajak Tangguhan, Impairment ECL, dan Revaluasi',
    ],
    badges: ['Paling Sederhana', 'Historical Cost', '3 Laporan Wajib', 'Khusus UMKM'],
  },
  [AccountingStandard.SAK_SYARIAH]: {
    standard: AccountingStandard.SAK_SYARIAH,
    name: 'SAK Syariah (Kerangka & Akad PSAK Syariah Seri 100)',
    shortName: 'SAK Syariah',
    tagline: 'Akuntansi Berbasis Syariah Islam: Tanpa Riba/Bunga, Didukung Akad Jual-Beli, Bagi Hasil & Zakat',
    targetAudience: 'Bank Syariah, BMT, Koperasi Syariah, Lembaga ZISWAF, dan Bisnis Halal',
    legalBasis: 'Dewan Standar Akuntansi Syariah (DSAS IAI) & Fatwa DSN-MUI',
    measurementBasis: 'Biaya Historis & Nilai Realisasi Bersih Berdasarkan Akad Syariah Terkait',
    requiredReports: [
      'Laporan Posisi Keuangan (Neraca)',
      'Laporan Laba Rugi',
      'Laporan Perubahan Ekuitas',
      'Laporan Arus Kas',
      'Laporan Sumber & Penyaluran Dana Zakat (Khusus Syariah)',
      'Laporan Sumber & Penggunaan Dana Kebajikan / Qardhul Hasan (Khusus Syariah)',
      'Catatan Atas Laporan Keuangan (CALK)',
    ],
    optionalReports: [],
    keyFeatures: [
      'Bebas Riba: Istilah "Bunga" diganti Bagi Hasil, Margin, atau Ujrah',
      'Dukungan Akad: Murabahah, Mudharabah, Musyarakah, Ijarah, Salam, Istishna, Wadiah, Qardh',
      'Pemisahan Rekening Dana Zakat & Dana Kebajikan dari Kas Operasional',
      'Dana Syirkah Temporer sebagai unsur laporan posisi keuangan tersendiri',
    ],
    badges: ['Bebas Riba', 'Akad Murabahah & Mudharabah', 'Laporan Dana Zakat', 'Laporan Qardhul Hasan'],
  },
  [AccountingStandard.SAK_EP]: {
    standard: AccountingStandard.SAK_EP,
    name: 'SAK EP (Standar Akuntansi Keuangan Entitas Privat)',
    shortName: 'SAK EP',
    tagline: 'Pengganti SAK ETAP Berbasis IFRS for SMEs — Berlaku Efektif 1 Januari 2025',
    targetAudience: 'Perusahaan Swasta/Privat Non-Tbk, PT Tertutup, Menengah ke Atas tanpa Akuntabilitas Publik',
    legalBasis: 'DSAK IAI (Disahkan 30 Juni 2021, Efektif 1 Januari 2025 menggantikan SAK ETAP)',
    measurementBasis: 'Biaya Historis (Model Biaya sebagai dasar utama, simplifikasi dari PSAK)',
    requiredReports: [
      'Laporan Posisi Keuangan',
      'Laporan Laba Rugi dan Penghasilan Komprehensif Lain',
      'Laporan Perubahan Ekuitas',
      'Laporan Arus Kas',
      'Catatan Atas Laporan Keuangan (CALK)',
    ],
    optionalReports: [],
    keyFeatures: [
      'Disusun dalam 35 Bab Komprehensif namun Lebih Ringkas dari SAK Umum',
      'Goodwill diamortisasi selama estimasi umur manfaat (bukan hanya impairment tahunan)',
      'Investasi entitas asosiasi dapat menggunakan metode biaya atau ekuitas sederhana',
      'Pengukuran instrumen keuangan disederhanakan tanpa model 3-stage ECL kompleks',
    ],
    badges: ['Efektif 2025', 'IFRS for SMEs', 'Amortisasi Goodwill', '5 Laporan'],
  },
  [AccountingStandard.SAP]: {
    standard: AccountingStandard.SAP,
    name: 'SAP (Standar Akuntansi Pemerintahan - PP No. 71/2010)',
    shortName: 'SAP Pemerintah',
    tagline: 'Pencatatan Ganda (Dual-Track): Basis Akrual (LO/Neraca) + Basis Kas (LRA Anggaran)',
    targetAudience: 'Kementerian, Lembaga Pemerintah Pusat, Pemerintah Daerah (Provinsi/Kab/Kota), SKPD/Satker',
    legalBasis: 'Komite Standar Akuntansi Pemerintahan (KSAP) — PP No. 71 Tahun 2010 Berbasis Akrual',
    measurementBasis: 'Dual Track: Basis Akrual Penuh (LO & Neraca) + Basis Kas (LRA Realisasi Anggaran)',
    requiredReports: [
      'Laporan Realisasi Anggaran (LRA)',
      'Laporan Perubahan Saldo Anggaran Lebih (LP-SAL)',
      'Neraca Pemerintah',
      'Laporan Operasional (LO)',
      'Laporan Arus Kas (LAK)',
      'Laporan Perubahan Ekuitas (LPE)',
      'Catatan Atas Laporan Keuangan (CaLK)',
    ],
    optionalReports: [],
    keyFeatures: [
      'Dual-Track Journaling: Jurnal Finansial (Akrual) & Jurnal Anggaran (Kas)',
      'Laporan Realisasi Anggaran (LRA) dengan perbandingan Anggaran vs Realisasi & Selisih',
      'Pendapatan-LO vs Pendapatan-LRA; Beban vs Belanja',
      'Struktur Akun Klasifikasi Ekonomi Sektor Publik Resmi (PP 71/2010)',
    ],
    badges: ['Dual-Track', 'PP 71/2010', '7 Laporan Wajib', 'Sektor Publik'],
  },
};

export const STANDARD_DESCRIPTIONS = STANDARDS_INFO;

// =========================================================================
// 1. CHART OF ACCOUNTS: SAK UMUM / PSAK
// =========================================================================
export const COA_PSAK: Account[] = [
  // ASET LANCAR
  { id: 'psak-101', code: '101', name: 'Kas dan Setara Kas', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-102', code: '102', name: 'Bank - Rekening Operasional', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-103', code: '103', name: 'Piutang Usaha', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-104', code: '104', name: 'Cadangan Kerugian Penurunan Nilai Piutang (CKPN)', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.KREDIT, isContra: true, description: 'Kontra Piutang (PSAK 71 ECL)' },
  { id: 'psak-105', code: '105', name: 'Persediaan Barang Dagang', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-106', code: '106', name: 'Perlengkapan Kantor', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-107', code: '107', name: 'Sewa Dibayar Dimuka', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-108', code: '108', name: 'Asuransi Dibayar Dimuka', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-109', code: '109', name: 'Aset Kontrak (PSAK 72)', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  
  // ASET TIDAK LANCAR
  { id: 'psak-121', code: '121', name: 'Tanah', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-122', code: '122', name: 'Bangunan dan Gedung', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-123', code: '123', name: 'Akumulasi Penyusutan Bangunan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'psak-124', code: '124', name: 'Peralatan dan Mesin', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-125', code: '125', name: 'Akumulasi Penyusutan Peralatan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'psak-126', code: '126', name: 'Kendaraan Operasional', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-127', code: '127', name: 'Akumulasi Penyusutan Kendaraan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'psak-128', code: '128', name: 'Aset Hak-Guna (PSAK 73 Sewa)', category: AccountCategory.ASET, subCategory: 'Aset Tidak Lancar Lainnya', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-129', code: '129', name: 'Akumulasi Amortisasi Aset Hak-Guna', category: AccountCategory.ASET, subCategory: 'Aset Tidak Lancar Lainnya', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'psak-130', code: '130', name: 'Aset Pajak Tangguhan (PSAK 46)', category: AccountCategory.ASET, subCategory: 'Aset Tidak Lancar Lainnya', normalBalance: NormalBalance.DEBIT },
  
  // LIABILITAS JANGKA PENDEK
  { id: 'psak-201', code: '201', name: 'Utang Usaha', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-202', code: '202', name: 'Beban Akrual yang Masih Harus Dibayar', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-203', code: '203', name: 'Utang Gaji Karyawan', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-204', code: '204', name: 'Pendapatan Diterima Dimuka (Liabilitas Kontrak)', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-205', code: '205', name: 'Utang Pajak Penghasilan', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-206', code: '206', name: 'Liabilitas Sewa Jangka Pendek (PSAK 73)', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  
  // LIABILITAS JANGKA PANJANG
  { id: 'psak-221', code: '221', name: 'Utang Bank Jangka Panjang', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Panjang', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-222', code: '222', name: 'Liabilitas Sewa Jangka Panjang (PSAK 73)', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Panjang', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-223', code: '223', name: 'Liabilitas Pajak Tangguhan (PSAK 46)', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Panjang', normalBalance: NormalBalance.KREDIT },
  
  // EKUITAS
  { id: 'psak-301', code: '301', name: 'Modal Saham', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-302', code: '302', name: 'Tambahan Modal Disetor (Agio Saham)', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-303', code: '303', name: 'Saldo Laba (Retained Earnings)', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-304', code: '304', name: 'Surplus Revaluasi Aset Tetap (OCI)', category: AccountCategory.EKUITAS, subCategory: 'Penghasilan Komprehensif Lain', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-305', code: '305', name: 'Dividen', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.DEBIT, isContra: true },
  { id: 'psak-399', code: '399', name: 'Ikhtisar Laba Rugi', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT, description: 'Akun Perantara Penutupan' },

  // PENDAPATAN
  { id: 'psak-401', code: '401', name: 'Pendapatan Penjualan / Jasa', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Operasional', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-402', code: '402', name: 'Retur dan Potongan Penjualan', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Operasional', normalBalance: NormalBalance.DEBIT, isContra: true },
  { id: 'psak-403', code: '403', name: 'Pendapatan Bunga dan Investasi', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Non-Operasional', normalBalance: NormalBalance.KREDIT },
  { id: 'psak-404', code: '404', name: 'Keuntungan Selisih Kurs', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Non-Operasional', normalBalance: NormalBalance.KREDIT },

  // BEBAN
  { id: 'psak-501', code: '501', name: 'Beban Pokok Penjualan (HPP)', category: AccountCategory.BEBAN, subCategory: 'Beban Pokok', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-502', code: '502', name: 'Beban Gaji dan Tunjangan', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-503', code: '503', name: 'Beban Sewa', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-504', code: '504', name: 'Beban Perlengkapan', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-505', code: '505', name: 'Beban Penyusutan Aset Tetap', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-506', code: '506', name: 'Beban Kerugian Penurunan Nilai (ECL PSAK 71)', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-507', code: '507', name: 'Beban Bunga dan Keuangan', category: AccountCategory.BEBAN, subCategory: 'Beban Non-Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-508', code: '508', name: 'Beban Pajak Penghasilan (Kini & Tangguhan)', category: AccountCategory.BEBAN, subCategory: 'Beban Pajak', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-509', code: '509', name: 'Beban Listrik, Air dan Internet', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-510', code: '510', name: 'Beban Pemasaran dan Iklan', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'psak-511', code: '511', name: 'Beban Lain-lain', category: AccountCategory.BEBAN, subCategory: 'Beban Non-Operasional', normalBalance: NormalBalance.DEBIT },
];

// =========================================================================
// 2. CHART OF ACCOUNTS: SAK EMKM
// =========================================================================
export const COA_SAK_EMKM: Account[] = [
  // ASET
  { id: 'emkm-101', code: '101', name: 'Kas', category: AccountCategory.ASET, subCategory: 'Aset', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-102', code: '102', name: 'Bank', category: AccountCategory.ASET, subCategory: 'Aset', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-103', code: '103', name: 'Piutang Usaha', category: AccountCategory.ASET, subCategory: 'Aset', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-104', code: '104', name: 'Persediaan Barang', category: AccountCategory.ASET, subCategory: 'Aset', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-105', code: '105', name: 'Perlengkapan', category: AccountCategory.ASET, subCategory: 'Aset', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-106', code: '106', name: 'Beban Dibayar Dimuka', category: AccountCategory.ASET, subCategory: 'Aset', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-121', code: '121', name: 'Aset Tetap', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-122', code: '122', name: 'Akumulasi Penyusutan Aset Tetap', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },

  // LIABILITAS
  { id: 'emkm-201', code: '201', name: 'Utang Usaha', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas', normalBalance: NormalBalance.KREDIT },
  { id: 'emkm-202', code: '202', name: 'Utang Bank / Lembaga Keuangan', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas', normalBalance: NormalBalance.KREDIT },
  { id: 'emkm-203', code: '203', name: 'Utang Lainnya', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas', normalBalance: NormalBalance.KREDIT },

  // EKUITAS
  { id: 'emkm-301', code: '301', name: 'Modal Pemilik', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'emkm-302', code: '302', name: 'Saldo Laba', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'emkm-303', code: '303', name: 'Prive Pemilik', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.DEBIT, isContra: true },
  { id: 'emkm-399', code: '399', name: 'Ikhtisar Laba Rugi', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },

  // PENDAPATAN
  { id: 'emkm-401', code: '401', name: 'Pendapatan Usaha', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan', normalBalance: NormalBalance.KREDIT },
  { id: 'emkm-402', code: '402', name: 'Pendapatan Lain-lain', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan', normalBalance: NormalBalance.KREDIT },

  // BEBAN
  { id: 'emkm-501', code: '501', name: 'Beban Pokok Penjualan', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-502', code: '502', name: 'Beban Gaji Karyawan', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-503', code: '503', name: 'Beban Sewa Tempat Usaha', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-504', code: '504', name: 'Beban Perlengkapan', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-505', code: '505', name: 'Beban Penyusutan Aset Tetap', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-506', code: '506', name: 'Beban Listrik, Air & Telepon', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
  { id: 'emkm-507', code: '507', name: 'Beban Lain-lain', category: AccountCategory.BEBAN, subCategory: 'Beban', normalBalance: NormalBalance.DEBIT },
];

// =========================================================================
// 3. CHART OF ACCOUNTS: SAK SYARIAH
// =========================================================================
export const COA_SAK_SYARIAH: Account[] = [
  // ASET
  { id: 'sya-101', code: '101', name: 'Kas Operasional', category: AccountCategory.ASET, subCategory: 'Kas dan Setara Kas', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-102', code: '102', name: 'Kas Rekening Dana Zakat', category: AccountCategory.DANA_SYARIAH, subCategory: 'Kas Dana ZISWAF (Amanah)', normalBalance: NormalBalance.DEBIT, description: 'Rekening khusus dana zakat terpisah' },
  { id: 'sya-103', code: '103', name: 'Kas Rekening Dana Kebajikan (Qardh)', category: AccountCategory.DANA_SYARIAH, subCategory: 'Kas Dana Kebajikan (Amanah)', normalBalance: NormalBalance.DEBIT, description: 'Rekening khusus dana qardhul hasan' },
  { id: 'sya-104', code: '104', name: 'Giro pada Bank Syariah', category: AccountCategory.ASET, subCategory: 'Kas dan Setara Kas', normalBalance: NormalBalance.DEBIT },
  
  // PIUTANG AKAD SYARIAH
  { id: 'sya-105', code: '105', name: 'Piutang Murabahah', category: AccountCategory.ASET, subCategory: 'Piutang Akad Syariah', normalBalance: NormalBalance.DEBIT, description: 'Sebesar total harga jual ke nasabah' },
  { id: 'sya-106', code: '106', name: 'Margin Murabahah Ditangguhkan', category: AccountCategory.ASET, subCategory: 'Piutang Akad Syariah', normalBalance: NormalBalance.KREDIT, isContra: true, description: 'Kontra Piutang Murabahah' },
  { id: 'sya-107', code: '107', name: 'Piutang Salam', category: AccountCategory.ASET, subCategory: 'Piutang Akad Syariah', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-108', code: '108', name: 'Piutang Istishna', category: AccountCategory.ASET, subCategory: 'Piutang Akad Syariah', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-109', code: '109', name: 'Aset Murabahah (Persediaan Barang)', category: AccountCategory.ASET, subCategory: 'Persediaan Akad Syariah', normalBalance: NormalBalance.DEBIT },
  
  // PEMBIAYAAN BAGI HASIL & SEWA IJARAH
  { id: 'sya-110', code: '110', name: 'Pembiayaan Mudharabah', category: AccountCategory.ASET, subCategory: 'Pembiayaan Bagi Hasil', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-111', code: '111', name: 'Pembiayaan Musyarakah', category: AccountCategory.ASET, subCategory: 'Pembiayaan Bagi Hasil', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-112', code: '112', name: 'Aset Ijarah (Sewa)', category: AccountCategory.ASET, subCategory: 'Aset Sewa Ijarah', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-113', code: '113', name: 'Akumulasi Penyusutan Aset Ijarah', category: AccountCategory.ASET, subCategory: 'Aset Sewa Ijarah', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'sya-114', code: '114', name: 'Piutang Qardh (Pinjaman Kebajikan)', category: AccountCategory.DANA_SYARIAH, subCategory: 'Piutang Dana Kebajikan', normalBalance: NormalBalance.DEBIT },
  
  // ASET TETAP
  { id: 'sya-121', code: '121', name: 'Aset Tetap Perusahaan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-122', code: '122', name: 'Akumulasi Penyusutan Aset Tetap', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },

  // LIABILITAS
  { id: 'sya-201', code: '201', name: 'Titipan Wadiah', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Wadiah', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-202', code: '202', name: 'Utang Usaha Syariah', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Lancar', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-203', code: '203', name: 'Beban yang Masih Harus Dibayar', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Lancar', normalBalance: NormalBalance.KREDIT },
  
  // DANA SYIRKAH TEMPORER
  { id: 'sya-204', code: '204', name: 'Dana Syirkah Temporer Mudharabah', category: AccountCategory.LIABILITAS, subCategory: 'Dana Syirkah Temporer', normalBalance: NormalBalance.KREDIT, description: 'Investasi tidak terikat bagi hasil' },
  { id: 'sya-205', code: '205', name: 'Dana Syirkah Temporer Musyarakah', category: AccountCategory.LIABILITAS, subCategory: 'Dana Syirkah Temporer', normalBalance: NormalBalance.KREDIT },

  // KEWAJIBAN DANA ZISWAF & DANA KEBAJIKAN
  { id: 'sya-210', code: '210', name: 'Dana Zakat (Kewajiban Penyaluran)', category: AccountCategory.DANA_SYARIAH, subCategory: 'Kewajiban Amanah Zakat', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-211', code: '211', name: 'Dana Kebajikan / Qardhul Hasan', category: AccountCategory.DANA_SYARIAH, subCategory: 'Kewajiban Dana Kebajikan', normalBalance: NormalBalance.KREDIT },

  // EKUITAS
  { id: 'sya-301', code: '301', name: 'Modal Disetor', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-302', code: '302', name: 'Saldo Laba', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-303', code: '303', name: 'Dana Cadangan', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-399', code: '399', name: 'Ikhtisar Laba Rugi', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },

  // PENDAPATAN AKAD SYARIAH
  { id: 'sya-401', code: '401', name: 'Pendapatan Margin Murabahah', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Penjualan & Margin', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-402', code: '402', name: 'Pendapatan Bagi Hasil Mudharabah', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Bagi Hasil', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-403', code: '403', name: 'Pendapatan Bagi Hasil Musyarakah', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Bagi Hasil', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-404', code: '404', name: 'Pendapatan Sewa Ijarah (Ujrah)', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Sewa Ijarah', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-405', code: '405', name: 'Pendapatan Operasional Lainnya', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Operasional', normalBalance: NormalBalance.KREDIT },
  
  // PENERIMAAN DANA SOSIAL
  { id: 'sya-410', code: '410', name: 'Penerimaan Dana Zakat dari Nasabah / Muzakki', category: AccountCategory.DANA_SYARIAH, subCategory: 'Penerimaan Zakat', normalBalance: NormalBalance.KREDIT },
  { id: 'sya-411', code: '411', name: 'Penerimaan Dana Infaq dan Sedekah', category: AccountCategory.DANA_SYARIAH, subCategory: 'Penerimaan Kebajikan', normalBalance: NormalBalance.KREDIT },

  // BEBAN
  { id: 'sya-501', code: '501', name: 'Bagi Hasil untuk Pemilik Dana Syirkah Temporer', category: AccountCategory.BEBAN, subCategory: 'Beban Bagi Hasil', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-502', code: '502', name: 'Beban Gaji dan Honor Pengelola', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-503', code: '503', name: 'Beban Penyusutan Aset Ijarah', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional Ijarah', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-504', code: '504', name: 'Beban Penyusutan Aset Tetap', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-505', code: '505', name: 'Beban Operasional dan Administrasi Lainnya', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  
  // PENYALURAN DANA SOSIAL
  { id: 'sya-510', code: '510', name: 'Penyaluran Dana Zakat kepada Mustahik', category: AccountCategory.DANA_SYARIAH, subCategory: 'Penyaluran Zakat', normalBalance: NormalBalance.DEBIT },
  { id: 'sya-511', code: '511', name: 'Penyaluran Dana Kebajikan / Qardh', category: AccountCategory.DANA_SYARIAH, subCategory: 'Penyaluran Kebajikan', normalBalance: NormalBalance.DEBIT },
];

// =========================================================================
// 4. CHART OF ACCOUNTS: SAK EP (ENTITAS PRIVAT 2025)
// =========================================================================
export const COA_SAK_EP: Account[] = [
  // ASET LANCAR
  { id: 'ep-101', code: '101', name: 'Kas dan Setara Kas', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-102', code: '102', name: 'Bank Rekening Giro/Tabungan', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-103', code: '103', name: 'Piutang Usaha', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-104', code: '104', name: 'Penyisihan Piutang Tak Tertagih', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'ep-105', code: '105', name: 'Persediaan Barang Dagang', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-106', code: '106', name: 'Perlengkapan Usaha', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-107', code: '107', name: 'Beban Dibayar Dimuka', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  
  // ASET TIDAK LANCAR
  { id: 'ep-110', code: '110', name: 'Investasi pada Entitas Asosiasi (Metode Biaya/Ekuitas)', category: AccountCategory.ASET, subCategory: 'Investasi Jangka Panjang', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-121', code: '121', name: 'Tanah dan Bangunan', category: AccountCategory.ASET, subCategory: 'Aset Tetap (Model Biaya)', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-122', code: '122', name: 'Akumulasi Penyusutan Bangunan', category: AccountCategory.ASET, subCategory: 'Aset Tetap (Model Biaya)', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'ep-123', code: '123', name: 'Mesin dan Peralatan', category: AccountCategory.ASET, subCategory: 'Aset Tetap (Model Biaya)', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-124', code: '124', name: 'Akumulasi Penyusutan Mesin & Peralatan', category: AccountCategory.ASET, subCategory: 'Aset Tetap (Model Biaya)', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'ep-130', code: '130', name: 'Goodwill (SAK EP Bab 19)', category: AccountCategory.ASET, subCategory: 'Aset Takberwujud', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-131', code: '131', name: 'Akumulasi Amortisasi Goodwill', category: AccountCategory.ASET, subCategory: 'Aset Takberwujud', normalBalance: NormalBalance.KREDIT, isContra: true, description: 'Diamortisasi estimasi masa manfaat (SAK EP)' },

  // LIABILITAS
  { id: 'ep-201', code: '201', name: 'Utang Usaha', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-202', code: '202', name: 'Beban Akrual', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-203', code: '203', name: 'Utang Bank Jangka Pendek', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-221', code: '221', name: 'Utang Bank Jangka Panjang', category: AccountCategory.LIABILITAS, subCategory: 'Liabilitas Jangka Panjang', normalBalance: NormalBalance.KREDIT },

  // EKUITAS
  { id: 'ep-301', code: '301', name: 'Modal Saham / Modal Pemilik', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-302', code: '302', name: 'Saldo Laba', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-303', code: '303', name: 'Dividen / Prive', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.DEBIT, isContra: true },
  { id: 'ep-399', code: '399', name: 'Ikhtisar Laba Rugi', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },

  // PENDAPATAN
  { id: 'ep-401', code: '401', name: 'Pendapatan Penjualan', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-402', code: '402', name: 'Bagian Laba Entitas Asosiasi', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Investasi', normalBalance: NormalBalance.KREDIT },
  { id: 'ep-403', code: '403', name: 'Pendapatan Lain-lain', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Lain', normalBalance: NormalBalance.KREDIT },

  // BEBAN
  { id: 'ep-501', code: '501', name: 'Beban Pokok Penjualan', category: AccountCategory.BEBAN, subCategory: 'Beban Pokok', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-502', code: '502', name: 'Beban Gaji dan Kesejahteraan Karyawan', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-503', code: '503', name: 'Beban Sewa & Pemeliharaan', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-504', code: '504', name: 'Beban Penyusutan Aset Tetap', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-505', code: '505', name: 'Beban Amortisasi Goodwill (SAK EP Bab 19)', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-506', code: '506', name: 'Beban Bunga dan Keuangan', category: AccountCategory.BEBAN, subCategory: 'Beban Keuangan', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-507', code: '507', name: 'Beban Pajak Penghasilan', category: AccountCategory.BEBAN, subCategory: 'Beban Pajak', normalBalance: NormalBalance.DEBIT },
  { id: 'ep-508', code: '508', name: 'Beban Umum & Operasional Lainnya', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
];

// =========================================================================
// 5. CHART OF ACCOUNTS: SAP (STANDAR AKUNTANSI PEMERINTAHAN - PP 71/2010)
// =========================================================================
export const COA_SAP: Account[] = [
  // 1. ASET (NERACA)
  { id: 'sap-11101', code: '1.1.1.01', name: 'Kas di Kas Daerah / BUD', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-11102', code: '1.1.1.02', name: 'Kas di Bendahara Penerimaan', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-11103', code: '1.1.1.03', name: 'Kas di Bendahara Pengeluaran', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-11301', code: '1.1.3.01', name: 'Piutang Pajak Daerah', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-11302', code: '1.1.3.02', name: 'Piutang Retribusi Daerah', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-11701', code: '1.1.7.01', name: 'Persediaan Alat Tulis Kantor & Bahan', category: AccountCategory.ASET, subCategory: 'Aset Lancar', normalBalance: NormalBalance.DEBIT },
  
  // ASET TETAP PEMERINTAH (NERACA)
  { id: 'sap-13101', code: '1.3.1.01', name: 'Tanah', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-13201', code: '1.3.2.01', name: 'Peralatan dan Mesin', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-13202', code: '1.3.2.02', name: 'Akumulasi Penyusutan Peralatan dan Mesin', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'sap-13301', code: '1.3.3.01', name: 'Gedung dan Bangunan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-13302', code: '1.3.3.02', name: 'Akumulasi Penyusutan Gedung dan Bangunan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'sap-13401', code: '1.3.4.01', name: 'Jalan, Irigasi dan Jaringan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-13402', code: '1.3.4.02', name: 'Akumulasi Penyusutan Jalan, Irigasi dan Jaringan', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.KREDIT, isContra: true },
  { id: 'sap-13601', code: '1.3.6.01', name: 'Konstruksi Dalam Pengerjaan (KDP)', category: AccountCategory.ASET, subCategory: 'Aset Tetap', normalBalance: NormalBalance.DEBIT },

  // 2. KEWAJIBAN (NERACA)
  { id: 'sap-21101', code: '2.1.1.01', name: 'Utang Perhitungan Fihak Ketiga (PFK)', category: AccountCategory.LIABILITAS, subCategory: 'Kewajiban Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-21501', code: '2.1.5.01', name: 'Pendapatan Diterima Dimuka', category: AccountCategory.LIABILITAS, subCategory: 'Kewajiban Jangka Pendek', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-22101', code: '2.2.1.01', name: 'Utang Pinjaman Jangka Panjang', category: AccountCategory.LIABILITAS, subCategory: 'Kewajiban Jangka Panjang', normalBalance: NormalBalance.KREDIT },

  // 3. EKUITAS & SALDO ANGGARAN LEBIH (NERACA & LRA)
  { id: 'sap-31101', code: '3.1.1.01', name: 'Ekuitas Dana Pemerintah', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-31201', code: '3.1.2.01', name: 'Estimasi Perubahan SAL', category: AccountCategory.EKUITAS, subCategory: 'Akun Anggaran', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-31202', code: '3.1.2.02', name: 'Perubahan SAL', category: AccountCategory.EKUITAS, subCategory: 'Akun Anggaran', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-39901', code: '3.9.9.01', name: 'Surplus / Defisit - LO Ditutup ke Ekuitas', category: AccountCategory.EKUITAS, subCategory: 'Ekuitas', normalBalance: NormalBalance.KREDIT },

  // 4. PENDAPATAN - LRA (BASIS KAS UNTUK LRA)
  { id: 'sap-41101', code: '4.1.1.01', name: 'Pendapatan Pajak Daerah - LRA', category: AccountCategory.PENDAPATAN_LRA, subCategory: 'Pendapatan Asli Daerah (PAD)', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-41201', code: '4.1.2.01', name: 'Pendapatan Retribusi Daerah - LRA', category: AccountCategory.PENDAPATAN_LRA, subCategory: 'Pendapatan Asli Daerah (PAD)', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-42101', code: '4.2.1.01', name: 'Pendapatan Transfer / Dana Alokasi Umum (DAU) - LRA', category: AccountCategory.PENDAPATAN_LRA, subCategory: 'Pendapatan Transfer', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-43101', code: '4.3.1.01', name: 'Lain-lain Pendapatan Daerah yang Sah - LRA', category: AccountCategory.PENDAPATAN_LRA, subCategory: 'Lain-lain Pendapatan', normalBalance: NormalBalance.KREDIT },

  // 5. BELANJA - LRA (BASIS KAS UNTUK LRA)
  { id: 'sap-51101', code: '5.1.1.01', name: 'Belanja Pegawai - LRA', category: AccountCategory.BELANJA_LRA, subCategory: 'Belanja Operasi', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-51201', code: '5.1.2.01', name: 'Belanja Barang dan Jasa - LRA', category: AccountCategory.BELANJA_LRA, subCategory: 'Belanja Operasi', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-51301', code: '5.1.3.01', name: 'Belanja Bunga & Subsidi - LRA', category: AccountCategory.BELANJA_LRA, subCategory: 'Belanja Operasi', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-52101', code: '5.2.1.01', name: 'Belanja Modal Tanah - LRA', category: AccountCategory.BELANJA_LRA, subCategory: 'Belanja Modal', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-52201', code: '5.2.2.01', name: 'Belanja Modal Peralatan dan Mesin - LRA', category: AccountCategory.BELANJA_LRA, subCategory: 'Belanja Modal', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-52301', code: '5.2.3.01', name: 'Belanja Modal Gedung dan Bangunan - LRA', category: AccountCategory.BELANJA_LRA, subCategory: 'Belanja Modal', normalBalance: NormalBalance.DEBIT },

  // 8. PENDAPATAN - LO (BASIS AKRUAL UNTUK LAPORAN OPERASIONAL)
  { id: 'sap-81101', code: '8.1.1.01', name: 'Pendapatan Pajak Daerah - LO', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Operasional', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-81201', code: '8.1.2.01', name: 'Pendapatan Retribusi Daerah - LO', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Operasional', normalBalance: NormalBalance.KREDIT },
  { id: 'sap-82101', code: '8.2.1.01', name: 'Pendapatan Transfer (DAU/DAK) - LO', category: AccountCategory.PENDAPATAN, subCategory: 'Pendapatan Transfer', normalBalance: NormalBalance.KREDIT },

  // 9. BEBAN - LO (BASIS AKRUAL UNTUK LAPORAN OPERASIONAL)
  { id: 'sap-91101', code: '9.1.1.01', name: 'Beban Pegawai - LO', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-91201', code: '9.1.2.01', name: 'Beban Barang dan Jasa - LO', category: AccountCategory.BEBAN, subCategory: 'Beban Operasional', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-91701', code: '9.1.7.01', name: 'Beban Penyusutan Aset Tetap - LO', category: AccountCategory.BEBAN, subCategory: 'Beban Penyusutan & Amortisasi', normalBalance: NormalBalance.DEBIT },
  { id: 'sap-91801', code: '9.1.8.01', name: 'Beban Penyisihan Piutang - LO', category: AccountCategory.BEBAN, subCategory: 'Beban Penyisihan', normalBalance: NormalBalance.DEBIT },
];

export function getCoaByStandard(standard: AccountingStandard): Account[] {
  switch (standard) {
    case AccountingStandard.SAK_EMKM:
      return JSON.parse(JSON.stringify(COA_SAK_EMKM));
    case AccountingStandard.SAK_SYARIAH:
      return JSON.parse(JSON.stringify(COA_SAK_SYARIAH));
    case AccountingStandard.SAK_EP:
      return JSON.parse(JSON.stringify(COA_SAK_EP));
    case AccountingStandard.SAP:
      return JSON.parse(JSON.stringify(COA_SAP));
    case AccountingStandard.PSAK:
    default:
      return JSON.parse(JSON.stringify(COA_PSAK));
  }
}
