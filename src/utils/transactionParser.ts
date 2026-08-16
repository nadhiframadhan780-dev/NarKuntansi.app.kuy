import { Account, AccountingStandard, AccountCategory, JournalEntryItem, Transaction } from '../types/accounting';

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
 * Extracts Rupiah amounts from Indonesian text
 * Handles formats like:
 * - "Rp 15.000.000"
 * - "Rp15.000.000,00"
 * - "15 juta" / "15.5 juta"
 * - "15000000"
 */
export function extractAmount(text: string): number {
  // Check for "juta" or "miliar"
  const jutaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/i);
  if (jutaMatch) {
    const num = parseFloat(jutaMatch[1].replace(',', '.'));
    return Math.round(num * 1_000_000);
  }

  const miliarMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:miliar|milyar|m)/i);
  if (miliarMatch) {
    const num = parseFloat(miliarMatch[1].replace(',', '.'));
    return Math.round(num * 1_000_000_000);
  }

  const ribuMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb)/i);
  if (ribuMatch) {
    const num = parseFloat(ribuMatch[1].replace(',', '.'));
    return Math.round(num * 1_000);
  }

  // Check standard numeric currency with Rp
  const rpMatch = text.match(/(?:rp\.?|idr)\s*([\d.,]+)/i);
  if (rpMatch) {
    const raw = rpMatch[1].replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Plain number string >= 4 digits
  const plainMatch = text.match(/\b\d{4,}\b/);
  if (plainMatch) {
    const parsed = parseInt(plainMatch[0], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return 0;
}

/**
 * Extracts transaction date from text or returns default fallback
 */
export function extractDate(text: string, defaultDate: string): string {
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

  // Format Indonesian text like "15 Agustus 2026" or "1 Agustus"
  const monthMap: Record<string, string> = {
    januari: '01', feb: '02', februari: '02', mar: '03', maret: '03',
    apr: '04', april: '04', mei: '05', jun: '06', juni: '06',
    jul: '07', juli: '07', agustus: '08', agu: '08', ags: '08',
    sep: '09', september: '09', okt: '10', oktober: '10',
    nov: '11', november: '11', des: '12', desember: '12',
  };

  const textDateMatch = text.match(/(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?/i);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const mName = textDateMatch[2].toLowerCase();
    const year = textDateMatch[3] || defaultDate.slice(0, 4);
    if (monthMap[mName]) {
      return `${year}-${monthMap[mName]}-${day}`;
    }
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
  const lines = rawText
    .split(/\n|;|\d+\.\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

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
  const pendapatanAcc = findAccount(accounts, ['pendapatan penjualan', 'pendapatan usaha', 'pendapatan jasa', 'pendapatan margin', 'pendapatan']) || accounts.find((a) => a.code.startsWith('4')) || kasAcc;
  const sewaAcc = findAccount(accounts, ['beban sewa', 'sewa dibayar dimuka']) || kasAcc;
  const gajiAcc = findAccount(accounts, ['beban gaji', 'gaji']) || kasAcc;
  const listrikAcc = findAccount(accounts, ['beban listrik', 'listrik', 'beban operasional']) || gajiAcc;

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    const amount = extractAmount(line);
    const date = extractDate(line, defaultDate);
    const refNumber = `JU-${String(idx + 1).padStart(3, '0')}`;

    if (amount <= 0) return;

    let entries: JournalEntryItem[] = [];
    let desc = line.slice(0, 80);
    let note = '';

    // 1. Setoran Modal Awal
    if (lower.includes('modal') && (lower.includes('setor') || lower.includes('investasi') || lower.includes('memulai'))) {
      entries = [
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: amount, credit: 0 },
        { accountCode: modalAcc.code, accountName: modalAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Penyetoran modal usaha';
      note = 'Kas bertambah (Debit) dan Modal bertambah (Kredit)';
    }
    // 2. Pembelian Perlengkapan
    else if (lower.includes('perlengkapan') && (lower.includes('beli') || lower.includes('membeli'))) {
      const isKredit = lower.includes('kredit') || lower.includes('tempo') || lower.includes('belum bayar');
      entries = [
        { accountCode: perlengkapanAcc.code, accountName: perlengkapanAcc.name, debit: amount, credit: 0 },
        { accountCode: isKredit ? utangAcc.code : kasAcc.code, accountName: isKredit ? utangAcc.name : kasAcc.name, debit: 0, credit: amount },
      ];
      desc = `Pembelian perlengkapan ${isKredit ? 'secara kredit' : 'secara tunai'}`;
      note = `Perlengkapan bertambah (Debit), ${isKredit ? 'Utang Usaha bertambah (Kredit)' : 'Kas berkurang (Kredit)'}`;
    }
    // 3. Pembelian Peralatan / Mesin / Aset Tetap
    else if ((lower.includes('peralatan') || lower.includes('mesin') || lower.includes('kendaraan') || lower.includes('aset tetap')) && (lower.includes('beli') || lower.includes('membeli'))) {
      const isKredit = lower.includes('kredit') || lower.includes('tempo') || lower.includes('angsur');
      entries = [
        { accountCode: peralatanAcc.code, accountName: peralatanAcc.name, debit: amount, credit: 0 },
        { accountCode: isKredit ? utangAcc.code : kasAcc.code, accountName: isKredit ? utangAcc.name : kasAcc.name, debit: 0, credit: amount },
      ];
      desc = `Pembelian peralatan ${isKredit ? 'secara kredit' : 'secara tunai'}`;
      note = `Peralatan bertambah (Debit), ${isKredit ? 'Utang Usaha bertambah (Kredit)' : 'Kas berkurang (Kredit)'}`;
    }
    // 4. Pembayaran Beban Gaji
    else if (lower.includes('gaji') || lower.includes('upah')) {
      entries = [
        { accountCode: gajiAcc.code, accountName: gajiAcc.name, debit: amount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Pembayaran gaji karyawan';
      note = 'Beban Gaji bertambah (Debit) dan Kas berkurang (Kredit)';
    }
    // 5. Pembayaran Sewa
    else if (lower.includes('sewa') && (lower.includes('bayar') || lower.includes('membayar'))) {
      entries = [
        { accountCode: sewaAcc.code, accountName: sewaAcc.name, debit: amount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Pembayaran sewa tempat';
      note = 'Beban Sewa / Sewa Dibayar Dimuka (Debit) dan Kas berkurang (Kredit)';
    }
    // 6. Beban Listrik, Air, Telepon
    else if (lower.includes('listrik') || lower.includes('air') || lower.includes('telepon') || lower.includes('internet') || lower.includes('wifi')) {
      entries = [
        { accountCode: listrikAcc.code, accountName: listrikAcc.name, debit: amount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Pembayaran tagihan listrik/air/internet';
      note = 'Beban Utilitas bertambah (Debit) dan Kas berkurang (Kredit)';
    }
    // 7. Penerimaan Pendapatan Jasa / Penjualan
    else if (lower.includes('pendapatan') || lower.includes('jasa') || lower.includes('penjualan') || lower.includes('menjual') || lower.includes('menerima')) {
      const isKredit = lower.includes('kredit') || lower.includes('faktur') || lower.includes('belum bayar') || lower.includes('tagihan');
      entries = [
        { accountCode: isKredit ? piutangAcc.code : kasAcc.code, accountName: isKredit ? piutangAcc.name : kasAcc.name, debit: amount, credit: 0 },
        { accountCode: pendapatanAcc.code, accountName: pendapatanAcc.name, debit: 0, credit: amount },
      ];
      desc = `Penerimaan pendapatan ${isKredit ? 'secara kredit (piutang)' : 'secara tunai'}`;
      note = `${isKredit ? 'Piutang Usaha bertambah (Debit)' : 'Kas bertambah (Debit)'} dan Pendapatan bertambah (Kredit)`;
    }
    // 8. Pelunasan Utang
    else if (lower.includes('utang') && (lower.includes('lunasi') || lower.includes('bayar') || lower.includes('membayar'))) {
      entries = [
        { accountCode: utangAcc.code, accountName: utangAcc.name, debit: amount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Pembayaran pelunasan utang usaha';
      note = 'Utang Usaha berkurang (Debit) dan Kas berkurang (Kredit)';
    }
    // 9. Pelunasan Piutang dari Pelanggan
    else if (lower.includes('piutang') && (lower.includes('terima') || lower.includes('lunasi') || lower.includes('pelanggan'))) {
      entries = [
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: amount, credit: 0 },
        { accountCode: piutangAcc.code, accountName: piutangAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Penerimaan pelunasan piutang pelanggan';
      note = 'Kas bertambah (Debit) dan Piutang Usaha berkurang (Kredit)';
    }
    // 10. Pengambilan Pribadi (Prive / Dividen)
    else if (lower.includes('prive') || lower.includes('dividen') || lower.includes('pribadi') || lower.includes('keperluan sendiri')) {
      entries = [
        { accountCode: priveAcc.code, accountName: priveAcc.name, debit: amount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: amount },
      ];
      desc = 'Pengambilan dana pribadi pemilik (Prive)';
      note = 'Prive Pemilik bertambah (Debit) dan Kas berkurang (Kredit)';
    }
    // 11. Khusus Syariah: Akad Murabahah, Zakat, Mudharabah
    else if (standard === AccountingStandard.SAK_SYARIAH && (lower.includes('murabahah') || lower.includes('zakat') || lower.includes('mudharabah') || lower.includes('musyarakah'))) {
      if (lower.includes('zakat') && (lower.includes('terima') || lower.includes('himpun'))) {
        const zakatKas = findAccount(accounts, ['kas rekening dana zakat']) || kasAcc;
        const zakatKewajiban = findAccount(accounts, ['dana zakat (kewajiban']) || accounts.find((a) => a.code === '210') || kasAcc;
        entries = [
          { accountCode: zakatKas.code, accountName: zakatKas.name, debit: amount, credit: 0 },
          { accountCode: zakatKewajiban.code, accountName: zakatKewajiban.name, debit: 0, credit: amount },
        ];
        desc = 'Penerimaan dana zakat dari muzakki';
        note = 'Kas Dana Zakat bertambah (Debit) dan Kewajiban Dana Zakat bertambah (Kredit)';
      } else if (lower.includes('zakat') && (lower.includes('salur') || lower.includes('mustahik'))) {
        const zakatKas = findAccount(accounts, ['kas rekening dana zakat']) || kasAcc;
        const zakatKewajiban = findAccount(accounts, ['dana zakat (kewajiban']) || accounts.find((a) => a.code === '210') || kasAcc;
        entries = [
          { accountCode: zakatKewajiban.code, accountName: zakatKewajiban.name, debit: amount, credit: 0 },
          { accountCode: zakatKas.code, accountName: zakatKas.name, debit: 0, credit: amount },
        ];
        desc = 'Penyaluran dana zakat kepada mustahik';
        note = 'Kewajiban Dana Zakat berkurang (Debit) dan Kas Dana Zakat berkurang (Kredit)';
      }
    }
    // Generic fallback for expenses
    else if (lower.includes('bayar') || lower.includes('membayar') || lower.includes('beban')) {
      const expAcc = accounts.find((a) => a.category === AccountCategory.BEBAN) || gajiAcc;
      entries = [
        { accountCode: expAcc.code, accountName: expAcc.name, debit: amount, credit: 0 },
        { accountCode: kasAcc.code, accountName: kasAcc.name, debit: 0, credit: amount },
      ];
      desc = `Pembayaran beban operasional (${line.slice(0, 40)})`;
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
