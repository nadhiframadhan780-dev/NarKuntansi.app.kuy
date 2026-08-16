import { AccountingStandard, Transaction } from '../types/accounting';

export const SAMPLE_TRANSACTIONS_PSAK: Transaction[] = [
  {
    id: 'tx-psak-01',
    date: '2026-08-01',
    refNumber: 'JU-001',
    description: 'Setoran modal awal pemilik berupa kas dan peralatan',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 150000000, credit: 0 },
      { accountCode: '124', accountName: 'Peralatan dan Mesin', debit: 50000000, credit: 0 },
      { accountCode: '301', accountName: 'Modal Saham', debit: 0, credit: 200000000 },
    ],
    notes: 'Penyetoran modal saham pendirian perseroan',
  },
  {
    id: 'tx-psak-02',
    date: '2026-08-02',
    refNumber: 'JU-002',
    description: 'Pembayaran sewa gedung kantor untuk 1 tahun ke depan',
    category: 'umum',
    entries: [
      { accountCode: '107', accountName: 'Sewa Dibayar Dimuka', debit: 36000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 0, credit: 36000000 },
    ],
    notes: 'Sewa kantor Rp 3.000.000 / bulan',
  },
  {
    id: 'tx-psak-03',
    date: '2026-08-04',
    refNumber: 'JU-003',
    description: 'Pembelian persediaan barang dagang secara kredit dari pemasok',
    category: 'umum',
    entries: [
      { accountCode: '105', accountName: 'Persediaan Barang Dagang', debit: 45000000, credit: 0 },
      { accountCode: '201', accountName: 'Utang Usaha', debit: 0, credit: 45000000 },
    ],
    notes: 'Faktur pembelian barang dagang No. PB-881',
  },
  {
    id: 'tx-psak-04',
    date: '2026-08-08',
    refNumber: 'JU-004',
    description: 'Penjualan barang dagang secara tunai dan kredit',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 35000000, credit: 0 },
      { accountCode: '103', accountName: 'Piutang Usaha', debit: 40000000, credit: 0 },
      { accountCode: '401', accountName: 'Pendapatan Penjualan / Jasa', debit: 0, credit: 75000000 },
    ],
    notes: 'Penjualan tunai Rp 35jt + kredit Rp 40jt',
  },
  {
    id: 'tx-psak-05',
    date: '2026-08-08',
    refNumber: 'JU-005',
    description: 'Pencatatan beban pokok penjualan atas transaksi penjualan',
    category: 'umum',
    entries: [
      { accountCode: '501', accountName: 'Beban Pokok Penjualan (HPP)', debit: 38000000, credit: 0 },
      { accountCode: '105', accountName: 'Persediaan Barang Dagang', debit: 0, credit: 38000000 },
    ],
    notes: 'Pengakuan HPP sistem perpetual',
  },
  {
    id: 'tx-psak-06',
    date: '2026-08-15',
    refNumber: 'JU-006',
    description: 'Pembayaran sebagian utang usaha kepada pemasok',
    category: 'umum',
    entries: [
      { accountCode: '201', accountName: 'Utang Usaha', debit: 25000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 0, credit: 25000000 },
    ],
    notes: 'Pelunasan faktur PB-881 sebagian',
  },
  {
    id: 'tx-psak-07',
    date: '2026-08-20',
    refNumber: 'JU-007',
    description: 'Penerimaan pelunasan piutang usaha dari pelanggan',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 25000000, credit: 0 },
      { accountCode: '103', accountName: 'Piutang Usaha', debit: 0, credit: 25000000 },
    ],
    notes: 'Pelunasan piutang konsumen',
  },
  {
    id: 'tx-psak-08',
    date: '2026-08-25',
    refNumber: 'JU-008',
    description: 'Pembayaran gaji karyawan bulan berjalan',
    category: 'umum',
    entries: [
      { accountCode: '502', accountName: 'Beban Gaji dan Tunjangan', debit: 12000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 0, credit: 12000000 },
    ],
    notes: 'Gaji 4 staf operasional',
  },
  {
    id: 'tx-psak-09',
    date: '2026-08-28',
    refNumber: 'JU-009',
    description: 'Pembayaran beban listrik, air, dan internet',
    category: 'umum',
    entries: [
      { accountCode: '509', accountName: 'Beban Listrik, Air dan Internet', debit: 3500000, credit: 0 },
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 0, credit: 3500000 },
    ],
    notes: 'Tagihan utilitas bulan Agustus',
  },
  // PENYESUAIAN
  {
    id: 'adj-psak-01',
    date: '2026-08-31',
    refNumber: 'AJP-001',
    description: 'Penyesuaian sewa gedung kantor yang terpakai selama bulan Agustus (1/12)',
    category: 'penyesuaian',
    entries: [
      { accountCode: '503', accountName: 'Beban Sewa', debit: 3000000, credit: 0 },
      { accountCode: '107', accountName: 'Sewa Dibayar Dimuka', debit: 0, credit: 3000000 },
    ],
    notes: 'Sewa terpakai 1 bulan dari total 12 bulan (Rp 36jt / 12 = Rp 3jt)',
  },
  {
    id: 'adj-psak-02',
    date: '2026-08-31',
    refNumber: 'AJP-002',
    description: 'Penyusutan peralatan kantor untuk bulan Agustus',
    category: 'penyesuaian',
    entries: [
      { accountCode: '505', accountName: 'Beban Penyusutan Aset Tetap', debit: 800000, credit: 0 },
      { accountCode: '125', accountName: 'Akumulasi Penyusutan Peralatan', debit: 0, credit: 800000 },
    ],
    notes: 'Penyusutan garis lurus peralatan per bulan',
  },
  {
    id: 'adj-psak-03',
    date: '2026-08-31',
    refNumber: 'AJP-003',
    description: 'Pembentukan Cadangan Penurunan Nilai Piutang (CKPN PSAK 71)',
    category: 'penyesuaian',
    entries: [
      { accountCode: '506', accountName: 'Beban Kerugian Penurunan Nilai (ECL PSAK 71)', debit: 500000, credit: 0 },
      { accountCode: '104', accountName: 'Cadangan Kerugian Penurunan Nilai Piutang (CKPN)', debit: 0, credit: 500000 },
    ],
    notes: 'Cadangan expected credit loss atas saldo piutang',
  },
];

export const SAMPLE_TRANSACTIONS_EMKM: Transaction[] = [
  {
    id: 'tx-emkm-01',
    date: '2026-08-01',
    refNumber: 'JU-001',
    description: 'Setoran modal awal pemilik usaha toko kue',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas', debit: 50000000, credit: 0 },
      { accountCode: '121', accountName: 'Aset Tetap', debit: 20000000, credit: 0 },
      { accountCode: '301', accountName: 'Modal Pemilik', debit: 0, credit: 70000000 },
    ],
    notes: 'Kas Rp 50jt + Oven & mixer Rp 20jt',
  },
  {
    id: 'tx-emkm-02',
    date: '2026-08-03',
    refNumber: 'JU-002',
    description: 'Pembelian perlengkapan kemasan dan bahan',
    category: 'umum',
    entries: [
      { accountCode: '105', accountName: 'Perlengkapan', debit: 5000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas', debit: 0, credit: 5000000 },
    ],
  },
  {
    id: 'tx-emkm-03',
    date: '2026-08-10',
    refNumber: 'JU-003',
    description: 'Penjualan kue dan roti secara tunai',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas', debit: 28000000, credit: 0 },
      { accountCode: '401', accountName: 'Pendapatan Usaha', debit: 0, credit: 28000000 },
    ],
  },
  {
    id: 'tx-emkm-04',
    date: '2026-08-12',
    refNumber: 'JU-004',
    description: 'Pembayaran beban pokok penjualan (bahan baku kue)',
    category: 'umum',
    entries: [
      { accountCode: '501', accountName: 'Beban Pokok Penjualan', debit: 11000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas', debit: 0, credit: 11000000 },
    ],
  },
  {
    id: 'tx-emkm-05',
    date: '2026-08-25',
    refNumber: 'JU-005',
    description: 'Pembayaran gaji karyawan toko',
    category: 'umum',
    entries: [
      { accountCode: '502', accountName: 'Beban Gaji Karyawan', debit: 4500000, credit: 0 },
      { accountCode: '101', accountName: 'Kas', debit: 0, credit: 4500000 },
    ],
  },
  {
    id: 'tx-emkm-06',
    date: '2026-08-28',
    refNumber: 'JU-006',
    description: 'Pengambilan uang untuk keperluan pribadi pemilik (Prive)',
    category: 'umum',
    entries: [
      { accountCode: '303', accountName: 'Prive Pemilik', debit: 2000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas', debit: 0, credit: 2000000 },
    ],
  },
  {
    id: 'adj-emkm-01',
    date: '2026-08-31',
    refNumber: 'AJP-001',
    description: 'Penyesuaian perlengkapan yang terpakai selama bulan berjalan',
    category: 'penyesuaian',
    entries: [
      { accountCode: '504', accountName: 'Beban Perlengkapan', debit: 3200000, credit: 0 },
      { accountCode: '105', accountName: 'Perlengkapan', debit: 0, credit: 3200000 },
    ],
  },
  {
    id: 'adj-emkm-02',
    date: '2026-08-31',
    refNumber: 'AJP-002',
    description: 'Penyusutan aset tetap peralatan bulan Agustus',
    category: 'penyesuaian',
    entries: [
      { accountCode: '505', accountName: 'Beban Penyusutan Aset Tetap', debit: 500000, credit: 0 },
      { accountCode: '122', accountName: 'Akumulasi Penyusutan Aset Tetap', debit: 0, credit: 500000 },
    ],
  },
];

export const SAMPLE_TRANSACTIONS_SYARIAH: Transaction[] = [
  {
    id: 'tx-sya-01',
    date: '2026-08-01',
    refNumber: 'JU-001',
    description: 'Penyetoran modal disetor awal entitas bisnis syariah',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas Operasional', debit: 200000000, credit: 0 },
      { accountCode: '301', accountName: 'Modal Disetor', debit: 0, credit: 200000000 },
    ],
  },
  {
    id: 'tx-sya-02',
    date: '2026-08-03',
    refNumber: 'JU-002',
    description: 'Pembelian barang pesanan untuk persediaan akad Murabahah',
    category: 'umum',
    entries: [
      { accountCode: '109', accountName: 'Aset Murabahah (Persediaan Barang)', debit: 60000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas Operasional', debit: 0, credit: 60000000 },
    ],
    notes: 'Pembelian harga pokok barang Rp 60.000.000',
  },
  {
    id: 'tx-sya-03',
    date: '2026-08-05',
    refNumber: 'JU-003',
    description: 'Penyerahan barang kepada nasabah dengan akad Murabahah (Margin 15jt, Tempo)',
    category: 'umum',
    entries: [
      { accountCode: '105', accountName: 'Piutang Murabahah', debit: 75000000, credit: 0 },
      { accountCode: '109', accountName: 'Aset Murabahah (Persediaan Barang)', debit: 0, credit: 60000000 },
      { accountCode: '106', accountName: 'Margin Murabahah Ditangguhkan', debit: 0, credit: 15000000 },
    ],
    notes: 'Harga Jual Rp 75jt = Harga Pokok Rp 60jt + Margin Ditangguhkan Rp 15jt',
  },
  {
    id: 'tx-sya-04',
    date: '2026-08-10',
    refNumber: 'JU-004',
    description: 'Penyaluran pembiayaan kemitraan bagi hasil Mudharabah kepada pengusaha mikro',
    category: 'umum',
    entries: [
      { accountCode: '110', accountName: 'Pembiayaan Mudharabah', debit: 40000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas Operasional', debit: 0, credit: 40000000 },
    ],
  },
  {
    id: 'tx-sya-05',
    date: '2026-08-15',
    refNumber: 'JU-005',
    description: 'Penerimaan dana zakat dari para muzakki ke rekening dana zakat',
    category: 'umum',
    entries: [
      { accountCode: '102', accountName: 'Kas Rekening Dana Zakat', debit: 12000000, credit: 0 },
      { accountCode: '210', accountName: 'Dana Zakat (Kewajiban Penyaluran)', debit: 0, credit: 12000000 },
    ],
    notes: 'Penerimaan dana zakat amanah',
  },
  {
    id: 'tx-sya-06',
    date: '2026-08-18',
    refNumber: 'JU-006',
    description: 'Penyaluran dana zakat kepada 8 asnaf / mustahik yang berhak',
    category: 'umum',
    entries: [
      { accountCode: '210', accountName: 'Dana Zakat (Kewajiban Penyaluran)', debit: 8000000, credit: 0 },
      { accountCode: '102', accountName: 'Kas Rekening Dana Zakat', debit: 0, credit: 8000000 },
    ],
    notes: 'Penyaluran zakat fakir & miskin',
  },
  {
    id: 'tx-sya-07',
    date: '2026-08-20',
    refNumber: 'JU-007',
    description: 'Penerimaan bagi hasil dari mitra pengelola pembiayaan Mudharabah',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas Operasional', debit: 3500000, credit: 0 },
      { accountCode: '402', accountName: 'Pendapatan Bagi Hasil Mudharabah', debit: 0, credit: 3500000 },
    ],
  },
  {
    id: 'tx-sya-08',
    date: '2026-08-25',
    refNumber: 'JU-008',
    description: 'Penerimaan angsuran pertama piutang Murabahah dari nasabah',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas Operasional', debit: 15000000, credit: 0 },
      { accountCode: '105', accountName: 'Piutang Murabahah', debit: 0, credit: 15000000 },
    ],
  },
  // PENYESUAIAN
  {
    id: 'adj-sya-01',
    date: '2026-08-31',
    refNumber: 'AJP-001',
    description: 'Pengakuan proporsional margin Murabahah yang telah terealisasi',
    category: 'penyesuaian',
    entries: [
      { accountCode: '106', accountName: 'Margin Murabahah Ditangguhkan', debit: 3000000, credit: 0 },
      { accountCode: '401', accountName: 'Pendapatan Margin Murabahah', debit: 0, credit: 3000000 },
    ],
    notes: 'Realisasi margin keuntungan murabahah periode berjalan',
  },
];

export const SAMPLE_TRANSACTIONS_EP: Transaction[] = [
  {
    id: 'tx-ep-01',
    date: '2026-08-01',
    refNumber: 'JU-001',
    description: 'Penyetoran modal saham pendirian entitas privat',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 120000000, credit: 0 },
      { accountCode: '121', accountName: 'Tanah dan Bangunan', debit: 150000000, credit: 0 },
      { accountCode: '301', accountName: 'Modal Saham / Modal Pemilik', debit: 0, credit: 270000000 },
    ],
  },
  {
    id: 'tx-ep-02',
    date: '2026-08-04',
    refNumber: 'JU-002',
    description: 'Akuisisi unit usaha dengan pengakuan Goodwill (SAK EP Bab 19)',
    category: 'umum',
    entries: [
      { accountCode: '123', accountName: 'Mesin dan Peralatan', debit: 40000000, credit: 0 },
      { accountCode: '130', accountName: 'Goodwill (SAK EP Bab 19)', debit: 20000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 0, credit: 60000000 },
    ],
  },
  {
    id: 'tx-ep-03',
    date: '2026-08-10',
    refNumber: 'JU-003',
    description: 'Investasi pada entitas asosiasi (SAK EP Bab 14)',
    category: 'umum',
    entries: [
      { accountCode: '110', accountName: 'Investasi pada Entitas Asosiasi (Metode Biaya/Ekuitas)', debit: 30000000, credit: 0 },
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 0, credit: 30000000 },
    ],
  },
  {
    id: 'tx-ep-04',
    date: '2026-08-15',
    refNumber: 'JU-004',
    description: 'Penjualan produk secara tunai dan kredit',
    category: 'umum',
    entries: [
      { accountCode: '101', accountName: 'Kas dan Setara Kas', debit: 40000000, credit: 0 },
      { accountCode: '103', accountName: 'Piutang Usaha', debit: 25000000, credit: 0 },
      { accountCode: '401', accountName: 'Pendapatan Penjualan', debit: 0, credit: 65000000 },
    ],
  },
  {
    id: 'tx-ep-05',
    date: '2026-08-15',
    refNumber: 'JU-005',
    description: 'Pencatatan Beban Pokok Penjualan',
    category: 'umum',
    entries: [
      { accountCode: '501', accountName: 'Beban Pokok Penjualan', debit: 32000000, credit: 0 },
      { accountCode: '105', accountName: 'Persediaan Barang Dagang', debit: 0, credit: 32000000 },
    ],
  },
  {
    id: 'adj-ep-01',
    date: '2026-08-31',
    refNumber: 'AJP-001',
    description: 'Amortisasi Goodwill bulan Agustus berdasarkan estimasi umur 10 tahun (SAK EP Bab 19)',
    category: 'penyesuaian',
    entries: [
      { accountCode: '505', accountName: 'Beban Amortisasi Goodwill (SAK EP Bab 19)', debit: 166667, credit: 0 },
      { accountCode: '131', accountName: 'Akumulasi Amortisasi Goodwill', debit: 0, credit: 166667 },
    ],
    notes: 'Goodwill diamortisasi 120 bulan (Rp 20.000.000 / 120)',
  },
  {
    id: 'adj-ep-02',
    date: '2026-08-31',
    refNumber: 'AJP-002',
    description: 'Penyusutan bangunan dan mesin untuk bulan berjalan',
    category: 'penyesuaian',
    entries: [
      { accountCode: '504', accountName: 'Beban Penyusutan Aset Tetap', debit: 1200000, credit: 0 },
      { accountCode: '124', accountName: 'Akumulasi Penyusutan Mesin & Peralatan', debit: 0, credit: 1200000 },
    ],
  },
];

export const SAMPLE_TRANSACTIONS_SAP: Transaction[] = [
  {
    id: 'tx-sap-01',
    date: '2026-08-01',
    refNumber: 'JU-001',
    description: 'Penerimaan Pendapatan Pajak Daerah secara tunai (Dual Track Akrual & LRA)',
    category: 'umum',
    entries: [
      { accountCode: '1.1.1.01', accountName: 'Kas di Kas Daerah / BUD', debit: 50000000, credit: 0 },
      { accountCode: '8.1.1.01', accountName: 'Pendapatan Pajak Daerah - LO', debit: 0, credit: 50000000 },
      { accountCode: '3.1.2.02', accountName: 'Perubahan SAL', debit: 50000000, credit: 0 },
      { accountCode: '4.1.1.01', accountName: 'Pendapatan Pajak Daerah - LRA', debit: 0, credit: 50000000 },
    ],
    notes: 'Dual entry: Jurnal Finansial (Kas vs LO) + Jurnal Anggaran (Perubahan SAL vs LRA)',
  },
  {
    id: 'tx-sap-02',
    date: '2026-08-05',
    refNumber: 'JU-002',
    description: 'Belanja Pegawai (Gaji ASN) dibayarkan langsung dari Kas Daerah',
    category: 'umum',
    entries: [
      { accountCode: '9.1.1.01', accountName: 'Beban Pegawai - LO', debit: 25000000, credit: 0 },
      { accountCode: '1.1.1.01', accountName: 'Kas di Kas Daerah / BUD', debit: 0, credit: 25000000 },
      { accountCode: '5.1.1.01', accountName: 'Belanja Pegawai - LRA', debit: 25000000, credit: 0 },
      { accountCode: '3.1.2.02', accountName: 'Perubahan SAL', debit: 0, credit: 25000000 },
    ],
  },
  {
    id: 'tx-sap-03',
    date: '2026-08-10',
    refNumber: 'JU-003',
    description: 'Belanja Modal Peralatan dan Mesin (Pengadaan Komputer Kantor)',
    category: 'umum',
    entries: [
      { accountCode: '1.3.2.01', accountName: 'Peralatan dan Mesin', debit: 18000000, credit: 0 },
      { accountCode: '1.1.1.01', accountName: 'Kas di Kas Daerah / BUD', debit: 0, credit: 18000000 },
      { accountCode: '5.2.2.01', accountName: 'Belanja Modal Peralatan dan Mesin - LRA', debit: 18000000, credit: 0 },
      { accountCode: '3.1.2.02', accountName: 'Perubahan SAL', debit: 0, credit: 18000000 },
    ],
    notes: 'Belanja modal menambah Aset Tetap di Neraca dan diakui Belanja Modal di LRA',
  },
  {
    id: 'adj-sap-01',
    date: '2026-08-31',
    refNumber: 'AJP-001',
    description: 'Penyusutan Peralatan dan Mesin akhir periode (Hanya Jurnal Finansial LO, tanpa Kas)',
    category: 'penyesuaian',
    entries: [
      { accountCode: '9.1.7.01', accountName: 'Beban Penyusutan Aset Tetap - LO', debit: 750000, credit: 0 },
      { accountCode: '1.3.2.02', accountName: 'Akumulasi Penyusutan Peralatan dan Mesin', debit: 0, credit: 750000 },
    ],
    notes: 'Transaksi non-kas hanya dicatat di buku akrual LO & Neraca (tanpa LRA)',
  },
];

export function getSampleTransactions(standard: AccountingStandard): Transaction[] {
  switch (standard) {
    case AccountingStandard.SAK_EMKM:
      return JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS_EMKM));
    case AccountingStandard.SAK_SYARIAH:
      return JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS_SYARIAH));
    case AccountingStandard.SAK_EP:
      return JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS_EP));
    case AccountingStandard.SAP:
      return JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS_SAP));
    case AccountingStandard.PSAK:
    default:
      return JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS_PSAK));
  }
}
