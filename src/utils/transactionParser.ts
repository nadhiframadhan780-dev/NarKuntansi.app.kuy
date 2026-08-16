import { Account, AccountingStandard, AccountCategory, JournalEntryItem } from '../types/accounting';

export interface ParsedTransactionDraft {
  date: string;
  refNumber: string;
  description: string;
  category: 'umum' | 'penyesuaian';
  entries: JournalEntryItem[];
  notes?: string;
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  needsReview?: boolean;
}

/**
 * Extracts all Rupiah amounts from text in order of appearance
 */
export function extractAllAmounts(text: string): number[] {
  const amounts: number[] = [];

  // Match pattern: Rp 150.000.000 or Rp150.000.000 or Rp. 150.000.000
  const regex = /(?:rp\.?|idr)\s*([\d.,]+)|\b(\d+(?:[.,]\d+)?)\s*(juta|jt|miliar|milyar|ribu|rb)\b/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      const raw = match[1].replace(/\./g, '').replace(/,/g, '.');
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val > 0) amounts.push(val);
    } else if (match[2] && match[3]) {
      const num = parseFloat(match[2].replace(',', '.'));
      const unit = match[3].toLowerCase();
      if (unit.startsWith('j')) amounts.push(Math.round(num * 1_000_000));
      else if (unit.startsWith('m')) amounts.push(Math.round(num * 1_000_000_000));
      else if (unit.startsWith('r')) amounts.push(Math.round(num * 1_000));
    }
  }

  // If regex matched nothing, check for plain 5+ digit numbers
  if (amounts.length === 0) {
    const plainMatches = text.match(/\b\d{4,}\b/g);
    if (plainMatches) {
      plainMatches.forEach((p) => {
        const val = parseInt(p, 10);
        if (!isNaN(val) && val > 0) amounts.push(val);
      });
    }
  }

  return amounts;
}

/**
 * Extracts single primary amount
 */
export function extractAmount(text: string): number {
  const all = extractAllAmounts(text);
  return all.length > 0 ? all[0] : 0;
}

/**
 * Extracts transaction date from text or returns fallback
 */
export function extractDate(text: string, defaultDate: string, autoDayIdx?: number): string {
  // Format YYYY-MM-DD
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Indonesian month names
  const monthMap: Record<string, string> = {
    januari: '01', feb: '02', februari: '02', mar: '03', maret: '03',
    apr: '04', april: '04', mei: '05', jun: '06', juni: '06',
    jul: '07', juli: '07', agustus: '08', agu: '08', ags: '08',
    sep: '09', september: '09', okt: '10', oktober: '10',
    nov: '11', november: '11', des: '12', desember: '12',
  };

  // Match "tanggal 1 Agustus 2026" or "1 Agustus 2026" or "1 Agustus"
  const textDateMatch = text.match(/(?:tanggal|tgl)?\s*(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?/i);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const mName = textDateMatch[2].toLowerCase();
    const year = textDateMatch[3] || defaultDate.slice(0, 4);
    if (monthMap[mName]) {
      return `${year}-${monthMap[mName]}-${day}`;
    }
  }

  // Match "tanggal 1" or "tgl 15"
  const dayOnlyMatch = text.match(/(?:tanggal|tgl)\s+(\d{1,2})/i);
  if (dayOnlyMatch) {
    const day = dayOnlyMatch[1].padStart(2, '0');
    const parts = defaultDate.split('-');
    const year = parts[0] || '2026';
    const month = parts[1] || '08';
    return `${year}-${month}-${day}`;
  }

  if (autoDayIdx !== undefined && autoDayIdx > 0) {
    const day = String(Math.min(autoDayIdx, 28)).padStart(2, '0');
    const parts = defaultDate.split('-');
    const year = parts[0] || '2026';
    const month = parts[1] || '08';
    return `${year}-${month}-${day}`;
  }

  return defaultDate;
}

/**
 * Finds the closest matching account in the active COA
 */
function findAccount(accounts: Account[], keywords: string[], defaultCode?: string): Account | undefined {
  for (const kw of keywords) {
    const acc = accounts.find(
      (a) =>
        a.name.toLowerCase().includes(kw.toLowerCase()) ||
        a.code === kw
    );
    if (acc) return acc;
  }
  if (defaultCode) {
    return accounts.find((a) => a.code === defaultCode);
  }
  return undefined;
}

/**
 * Rule-based Transaction Parser for Indonesian Accounting Word Problems
 */
export function parseStoryProblemRuleBased(
  rawText: string,
  accounts: Account[],
  standard: AccountingStandard,
  defaultDate = new Date().toISOString().slice(0, 10)
): ParsedTransactionDraft[] {
  // Extract month / year from header text if present (e.g. "Agustus 2026")
  let contextDate = defaultDate;
  const headerDateMatch = rawText.match(/(?:bulan|periode|selama)?\s*([a-zA-Z]+)\s+(\d{4})/i);
  const monthMap: Record<string, string> = {
    januari: '01', feb: '02', februari: '02', mar: '03', maret: '03',
    apr: '04', april: '04', mei: '05', jun: '06', juni: '06',
    jul: '07', juli: '07', agustus: '08', agu: '08', ags: '08',
    sep: '09', september: '09', okt: '10', oktober: '10',
    nov: '11', november: '11', des: '12', desember: '12',
  };
  if (headerDateMatch && monthMap[headerDateMatch[1].toLowerCase()]) {
    const m = monthMap[headerDateMatch[1].toLowerCase()];
    const y = headerDateMatch[2];
    contextDate = `${y}-${m}-01`;
  }

  // Split into candidate transaction lines
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  // Group lines or filter only lines that contain financial keywords/amounts
  const lines: string[] = [];
  rawLines.forEach((line) => {
    // Skip general instruction headers
    if (
      (line.toLowerCase().startsWith('buatlah') || line.toLowerCase().startsWith('soal') || line.toLowerCase().startsWith('berikut')) &&
      !line.toLowerCase().includes('rp') &&
      !line.toLowerCase().includes('sebesar')
    ) {
      return;
    }
    // Handle bullet points / numbered items
    const cleaned = line.replace(/^[-*•\d+.]+\s*/, '').trim();
    if (cleaned.length > 5) {
      lines.push(cleaned);
    }
  });

  const results: ParsedTransactionDraft[] = [];

  // Lookup common accounts in active standard
  const kasAcc = findAccount(accounts, ['kas dan setara kas', 'kas operasional', 'kas']) || accounts[0];
  const bankAcc = findAccount(accounts, ['bank']) || kasAcc;
  const piutangAcc = findAccount(accounts, ['piutang usaha', 'piutang murabahah', 'piutang']) || kasAcc;
  const utangAcc = findAccount(accounts, ['utang usaha', 'utang', 'kewajiban']) || accounts.find((a) => a.code.startsWith('2')) || kasAcc;
  const modalAcc = findAccount(accounts, ['modal pemilik', 'modal saham', 'modal disetor', 'modal', 'ekuitas dana']) || accounts.find((a) => a.code.startsWith('3')) || kasAcc;
  const priveAcc = findAccount(accounts, ['prive', 'dividen']) || modalAcc;
  const perlengkapanAcc = findAccount(accounts, ['perlengkapan', 'alat tulis']) || kasAcc;
  const peralatanAcc = findAccount(accounts, ['peralatan', 'mesin', 'aset tetap']) || kasAcc;
  const pendapatanAcc = findAccount(accounts, ['pendapatan jasa', 'pendapatan penjualan', 'pendapatan usaha', 'pendapatan margin', 'pendapatan']) || accounts.find((a) => a.code.startsWith('4')) || kasAcc;
  const sewaAcc = findAccount(accounts, ['beban sewa', 'sewa dibayar dimuka']) || kasAcc;
  const sewaPrepaidAcc = findAccount(accounts, ['sewa dibayar dimuka', 'sewa dibayar di muka']) || sewaAcc;
  const gajiAcc = findAccount(accounts, ['beban gaji', 'gaji dan upah', 'gaji']) || kasAcc;
  const utilitasAcc = findAccount(accounts, ['beban utilitas', 'beban listrik, air & telepon', 'beban listrik', 'beban operasional']) || gajiAcc;

  let currentTransDate = contextDate;

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    const amounts = extractAllAmounts(line);
    const primaryAmount = amounts[0] || 0;
    
    // Extract date or advance
    const detectedDate = extractDate(line, currentTransDate, idx + 1);
    if (detectedDate !== defaultDate) {
      currentTransDate = detectedDate;
    }
    const date = currentTransDate;
    const refNumber = `JU-${String(idx + 1).padStart(3, '0')}`;

    if (primaryAmount <= 0) return;

    let entries: JournalEntryItem[] = [];
    let desc = line.slice(0, 80);
    let note = '';

    // 1. Setoran Modal Awal (Modal Tunai)
    if (lower.includes('modal') && (lower.includes('setor') || lower.includes('investasi') || lower.includes('memulai'))) {
      entries = [
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: modalAcc.code, accountName: modalAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = 'Penyetoran modal usaha awal oleh pemilik';
      note = 'Kas bertambah (Debit) dan Modal Pemilik bertambah (Kredit)';
    }

    // 2. Transaksi Jasa Majemuk (Sebagian Tunai, Sisa Kredit / Piutang)
    // Contoh: "Menyelesaikan jasa konsultasi senilai Rp25.000.000, baru menerima tunai Rp15.000.000 dan sisanya dibayar kemudian"
    else if (
      (lower.includes('jasa') || lower.includes('pendapatan') || lower.includes('konsultasi') || lower.includes('servis')) &&
      (lower.includes('sisa') || lower.includes('kemudian') || lower.includes('sebagian') || (amounts.length >= 2 && lower.includes('tunai')))
    ) {
      let totalRevenue = Math.max(...amounts);
      let cashReceived = Math.min(...amounts);
      
      // If there are exactly two amounts and first is total
      if (amounts.length >= 2) {
        if (amounts[0] > amounts[1]) {
          totalRevenue = amounts[0];
          cashReceived = amounts[1];
        } else {
          totalRevenue = amounts[1];
          cashReceived = amounts[0];
        }
      }
      
      const receivableAmount = totalRevenue - cashReceived;

      entries = [
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: cashReceived, credit: 0 },
        { accountCode: piutangAcc.code, accountName: piutangAcc.name, debit: receivableAmount, credit: 0 },
        { accountCode: pendapatanAcc.code, accountName: pendapatanAcc.name, debit: 0, credit: totalRevenue },
      ];
      desc = 'Penyelesaian jasa konsultasi (sebagian tunai, sisanya piutang)';
      note = `Kas bertambah Rp${cashReceived.toLocaleString('id-ID')} (D), Piutang bertambah Rp${receivableAmount.toLocaleString('id-ID')} (D), Pendapatan Jasa Rp${totalRevenue.toLocaleString('id-ID')} (K)`;
    }

    // 3. Pembayaran Sewa (Beban Sewa / Sewa Dibayar Dimuka untuk 1 tahun)
    else if (lower.includes('sewa') && (lower.includes('bayar') || lower.includes('membayar'))) {
      const isPrepaid = lower.includes('1 tahun') || lower.includes('setahun') || lower.includes('di muka') || lower.includes('dimuka');
      const targetAcc = isPrepaid && sewaPrepaidAcc ? sewaPrepaidAcc : sewaAcc;
      
      entries = [
        { accountCode: targetAcc.code, accountName: targetAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = isPrepaid ? 'Pembayaran sewa tempat untuk 1 tahun' : 'Pembayaran beban sewa kantor';
      note = `${targetAcc.name} bertambah (Debit) dan Kas berkurang (Kredit)`;
    }

    // 4. Pembelian Perlengkapan (Kredit / Tunai)
    else if (lower.includes('perlengkapan') && (lower.includes('beli') || lower.includes('membeli'))) {
      const isKredit = lower.includes('kredit') || lower.includes('tempo') || lower.includes('belum bayar') || lower.includes('dari toko') || lower.includes('faktur');
      entries = [
        { accountCode: perlengkapanAcc.code, accountName: perlengkapanAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: isKredit ? utangAcc.code : kasAcc.code, accountName: isKredit ? utangAcc.name : kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = `Pembelian perlengkapan kantor ${isKredit ? 'secara kredit' : 'secara tunai'}`;
      note = `Perlengkapan bertambah (Debit), ${isKredit ? 'Utang Usaha bertambah (Kredit)' : 'Kas berkurang (Kredit)'}`;
    }

    // 5. Pembelian Peralatan / Aset Tetap (Kredit / Tunai)
    else if ((lower.includes('peralatan') || lower.includes('mesin') || lower.includes('kendaraan') || lower.includes('aset tetap') || lower.includes('komputer')) && (lower.includes('beli') || lower.includes('membeli'))) {
      const isKredit = lower.includes('kredit') || lower.includes('tempo') || lower.includes('angsur');
      entries = [
        { accountCode: peralatanAcc.code, accountName: peralatanAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: isKredit ? utangAcc.code : kasAcc.code, accountName: isKredit ? utangAcc.name : kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = `Pembelian peralatan ${isKredit ? 'secara kredit' : 'secara tunai'}`;
      note = `Peralatan bertambah (Debit), ${isKredit ? 'Utang Usaha bertambah (Kredit)' : 'Kas berkurang (Kredit)'}`;
    }

    // 6. Pembayaran Gaji Karyawan
    else if (lower.includes('gaji') || lower.includes('upah')) {
      entries = [
        { accountCode: gajiAcc.code, accountName: gajiAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = 'Pembayaran gaji karyawan';
      note = 'Beban Gaji bertambah (Debit) dan Kas berkurang (Kredit)';
    }

    // 7. Pelunasan Piutang dari Pelanggan / Klien (Menerima Pelunasan Piutang)
    else if (
      (lower.includes('piutang') && (lower.includes('terima') || lower.includes('menerima') || lower.includes('pelunasan') || lower.includes('klien') || lower.includes('pelanggan'))) ||
      (lower.includes('terima') && lower.includes('pelunasan') && lower.includes('klien'))
    ) {
      entries = [
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: piutangAcc.code, accountName: piutangAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = 'Penerimaan pelunasan piutang dari klien';
      note = 'Kas bertambah (Debit) dan Piutang Usaha berkurang (Kredit)';
    }

    // 8. Pembayaran / Pelunasan Utang kepada Pemasok / Toko
    else if (
      (lower.includes('utang') && (lower.includes('bayar') || lower.includes('membayar') || lower.includes('lunasi') || lower.includes('toko') || lower.includes('supplier'))) ||
      (lower.includes('bayar') && lower.includes('utang'))
    ) {
      entries = [
        { accountCode: utangAcc.code, accountName: utangAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = 'Pembayaran utang usaha kepada pemasok';
      note = 'Utang Usaha berkurang (Debit) dan Kas berkurang (Kredit)';
    }

    // 9. Pembayaran Beban Listrik, Internet, Air, Telepon (Beban Utilitas)
    else if (lower.includes('listrik') || lower.includes('internet') || lower.includes('telepon') || lower.includes('wifi') || lower.includes('air') || lower.includes('utilitas')) {
      entries = [
        { accountCode: utilitasAcc.code, accountName: utilitasAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = 'Pembayaran biaya listrik dan internet';
      note = 'Beban Listrik/Internet bertambah (Debit) dan Kas berkurang (Kredit)';
    }

    // 10. Penerimaan Pendapatan Jasa / Penjualan Biasa (Murni Tunai atau Murni Kredit)
    else if (lower.includes('pendapatan') || lower.includes('jasa') || lower.includes('penjualan') || lower.includes('menjual')) {
      const isKredit = lower.includes('kredit') || lower.includes('faktur') || lower.includes('belum bayar') || lower.includes('tagihan');
      entries = [
        { accountCode: isKredit ? piutangAcc.code : kasAcc.code, accountName: isKredit ? piutangAcc.name : kasAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: pendapatanAcc.code, accountName: pendapatanAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = `Penerimaan pendapatan jasa ${isKredit ? 'secara kredit (piutang)' : 'secara tunai'}`;
      note = `${isKredit ? 'Piutang Usaha bertambah (Debit)' : 'Kas bertambah (Debit)'} dan Pendapatan bertambah (Kredit)`;
    }

    // 11. Pengambilan Pribadi (Prive / Dividen)
    else if (lower.includes('prive') || lower.includes('dividen') || lower.includes('pribadi') || lower.includes('keperluan sendiri')) {
      entries = [
        { accountCode: priveAcc.code, accountName: priveAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = 'Pengambilan dana pribadi pemilik (Prive)';
      note = 'Prive Pemilik bertambah (Debit) dan Kas berkurang (Kredit)';
    }

    // 12. Generic Expense fallback
    else if (lower.includes('bayar') || lower.includes('membayar') || lower.includes('beban') || lower.includes('biaya')) {
      const expAcc = accounts.find((a) => a.category === AccountCategory.BEBAN) || utilitasAcc;
      entries = [
        { accountCode: expAcc.code, accountName: expAcc.name, debit: primaryAmount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: primaryAmount },
      ];
      desc = `Pembayaran biaya operasional`;
      note = 'Beban bertambah (Debit) dan Kas berkurang (Kredit)';
    }

    if (entries.length >= 2) {
      const totD = entries.reduce((s, e) => s + (e.debit || 0), 0);
      const totK = entries.reduce((s, e) => s + (e.credit || 0), 0);
      const diff = Math.abs(totD - totK);

      results.push({
        date,
        refNumber,
        description: desc,
        category: 'umum',
        entries,
        notes: note,
        isBalanced: diff === 0,
        totalDebit: totD,
        totalCredit: totK,
        difference: diff,
        needsReview: diff !== 0,
      });
    }
  });

  return results;
}

/**
 * AI Powered Transaction Parser: Calls server API /api/parse-transaction with automatic rule-based fallback
 */
export async function parseTransactionsWithAI(
  rawText: string,
  accounts: Account[],
  standard: AccountingStandard
): Promise<{ drafts: ParsedTransactionDraft[]; usedAI: boolean; message?: string }> {
  try {
    const response = await fetch('/api/parse-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: rawText,
        standard,
        coaList: accounts.map((a) => ({ code: a.code, name: a.name, category: a.category })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
        const drafts: ParsedTransactionDraft[] = data.transactions.map((tx: any, i: number) => {
          const entries: JournalEntryItem[] = (tx.entries || []).map((e: any) => ({
            accountCode: e.accountCode || '101',
            accountName: e.accountName || 'Kas',
            debit: Math.round(Number(e.debit) || 0),
            credit: Math.round(Number(e.credit) || 0),
          }));

          const totD = entries.reduce((s, e) => s + (e.debit || 0), 0);
          const totK = entries.reduce((s, e) => s + (e.credit || 0), 0);
          const diff = Math.abs(totD - totK);

          return {
            date: tx.date || new Date().toISOString().slice(0, 10),
            refNumber: tx.refNumber || `JU-${String(i + 1).padStart(3, '0')}`,
            description: tx.description || 'Transaksi otomatis',
            category: tx.category || 'umum',
            entries,
            notes: tx.notes || 'Dianalisis oleh AI Akuntan',
            isBalanced: diff === 0,
            totalDebit: totD,
            totalCredit: totK,
            difference: diff,
            needsReview: diff !== 0,
          };
        });

        return { drafts, usedAI: true, message: 'Berhasil dianalisis dengan Gemini AI' };
      }
    }
  } catch (err) {
    console.warn('AI Parser endpoint error, falling back to rule-based engine:', err);
  }

  // Fallback to Rule-based parser
  const drafts = parseStoryProblemRuleBased(rawText, accounts, standard);
  return {
    drafts,
    usedAI: false,
    message: 'Dianalisis dengan Parser Otomatis NarKuntansi (Rule-Based)',
  };
}
