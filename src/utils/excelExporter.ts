import * as XLSX from 'xlsx';
import {
  Account,
  AccountingStandard,
  AccountCategory,
  EntitySettings,
  NormalBalance,
  Transaction,
} from '../types/accounting';
import {
  calculateLedgers,
  calculateTrialBalance,
  calculateWorksheet,
  generateClosingEntries,
} from './accountingEngine';
import { sanitizeSheetName } from './formatters';

interface ExportOptions {
  settings: EntitySettings;
  standard: AccountingStandard;
  accounts: Account[];
  transactions: Transaction[];
}

/**
 * Creates header rows for financial reports with entity name, title, and period
 */
function createReportHeader(entityName: string, reportTitle: string, periodText: string, standardName: string) {
  return [
    [entityName.toUpperCase()],
    [reportTitle.toUpperCase()],
    [`Standar: ${standardName}`],
    [`Periode: ${periodText}`],
    [], // Blank row before table
  ];
}

/**
 * Computes auto column widths for a worksheet based on cell content lengths
 */
function autoFitColumns(data: (string | number | null | undefined)[][]): XLSX.ColInfo[] {
  const colWidths: number[] = [];

  data.forEach((row) => {
    row.forEach((val, colIdx) => {
      let len = 10;
      if (val !== null && val !== undefined) {
        if (typeof val === 'number') {
          len = Math.max(12, val.toLocaleString('id-ID').length + 2);
        } else {
          len = String(val).length + 2;
        }
      }
      colWidths[colIdx] = Math.min(60, Math.max(colWidths[colIdx] || 10, len));
    });
  });

  return colWidths.map((w) => ({ wch: w }));
}

/**
 * 1. Sheet Jurnal Umum
 */
export function buildGeneralJournalSheet(transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'JURNAL UMUM', `${settings.periodStart} s/d ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  rows.push(['Tanggal', 'No. Ref', 'Keterangan Akun & Transaksi', 'Ref Akun', 'Debit (Rp)', 'Kredit (Rp)']);

  let totalDebit = 0;
  let totalCredit = 0;

  const sortedTx = [...transactions]
    .filter((t) => t.category === 'umum')
    .sort((a, b) => a.date.localeCompare(b.date));

  sortedTx.forEach((tx) => {
    tx.entries.forEach((entry, entryIdx) => {
      const isFirst = entryIdx === 0;
      const isCredit = entry.credit > 0 && entry.debit === 0;
      const indent = isCredit ? '    ' : '';

      const debitVal = entry.debit > 0 ? entry.debit : 0;
      const creditVal = entry.credit > 0 ? entry.credit : 0;

      totalDebit += debitVal;
      totalCredit += creditVal;

      rows.push([
        isFirst ? tx.date : '',
        isFirst ? tx.refNumber : '',
        indent + entry.accountName,
        entry.accountCode,
        debitVal,
        creditVal,
      ]);
    });

    if (tx.notes || tx.description) {
      rows.push(['', '', `  (${tx.description || tx.notes})`, '', 0, 0]);
    }
  });

  rows.push([]);
  rows.push(['TOTAL', '', '', '', totalDebit, totalCredit]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 2. Sheet Buku Besar
 */
export function buildLedgerSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'BUKU BESAR (GENERAL LEDGER)', `${settings.periodStart} s/d ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  const ledgers = calculateLedgers(accounts, transactions, ['umum', 'penyesuaian']);

  accounts.forEach((acc) => {
    const l = ledgers.get(acc.code);
    if (!l || (l.entries.length === 0 && l.endingBalance === 0)) return;

    rows.push([]);
    rows.push([`AKUN: ${acc.code} - ${acc.name.toUpperCase()}`, '', '', `Saldo Normal: ${acc.normalBalance}`, '', '']);
    rows.push(['Tanggal', 'No. Ref', 'Keterangan', 'Debit (Rp)', 'Kredit (Rp)', 'Saldo Berjalan (Rp)']);

    let running = 0;
    const isNormalDebit = acc.normalBalance === NormalBalance.DEBIT;

    l.entries.forEach((e) => {
      if (isNormalDebit) {
        running += e.debit - e.credit;
      } else {
        running += e.credit - e.debit;
      }

      rows.push([e.date, e.refNumber, e.description, e.debit, e.credit, running]);
    });

    rows.push([
      'TOTAL MUTASI & SALDO AKHIR',
      '',
      '',
      l.totalDebit,
      l.totalCredit,
      l.endingBalance,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 3. Sheet Neraca Saldo
 */
export function buildTrialBalanceSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'NERACA SALDO (TRIAL BALANCE)', `${settings.periodStart} s/d ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  const tb = calculateTrialBalance(accounts, transactions, ['umum', 'penyesuaian']);

  rows.push(['Kode Akun', 'Nama Akun', 'Kategori', 'Debit (Rp)', 'Kredit (Rp)']);

  tb.items.forEach((item) => {
    rows.push([
      item.account.code,
      item.account.name,
      item.account.category,
      item.debit,
      item.credit,
    ]);
  });

  rows.push([]);
  rows.push(['TOTAL', '', '', tb.totalDebit, tb.totalCredit]);
  rows.push(['STATUS', '', '', tb.isBalanced ? 'SEIMBANG (BALANCED)' : `TIDAK SEIMBANG (SELISIH ${tb.difference})`, '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 4. Sheet Kertas Kerja (10 Kolom)
 */
export function buildWorksheetSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'KERTAS KERJA (NERACA LAJUR 10 KOLOM)', `${settings.periodStart} s/d ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  const wsRes = calculateWorksheet(accounts, transactions);

  rows.push([
    'Kode',
    'Nama Akun',
    'Neraca Saldo - Debit',
    'Neraca Saldo - Kredit',
    'Penyesuaian - Debit',
    'Penyesuaian - Kredit',
    'NS Disesuaikan - Debit',
    'NS Disesuaikan - Kredit',
    'Laba Rugi - Debit',
    'Laba Rugi - Kredit',
    'Neraca - Debit',
    'Neraca - Kredit',
  ]);

  wsRes.rows.forEach((r) => {
    rows.push([
      r.account.code,
      r.account.name,
      r.trialBalance.debit,
      r.trialBalance.credit,
      r.adjustment.debit,
      r.adjustment.credit,
      r.adjustedTrialBalance.debit,
      r.adjustedTrialBalance.credit,
      r.incomeStatement.debit,
      r.incomeStatement.credit,
      r.balanceSheet.debit,
      r.balanceSheet.credit,
    ]);
  });

  rows.push([]);
  rows.push([
    'TOTAL',
    '',
    wsRes.totals.trialBalance.debit,
    wsRes.totals.trialBalance.credit,
    wsRes.totals.adjustment.debit,
    wsRes.totals.adjustment.credit,
    wsRes.totals.adjustedTrialBalance.debit,
    wsRes.totals.adjustedTrialBalance.credit,
    wsRes.totals.incomeStatement.debit,
    wsRes.totals.incomeStatement.credit,
    wsRes.totals.balanceSheet.debit,
    wsRes.totals.balanceSheet.credit,
  ]);

  rows.push([
    wsRes.isNetIncome ? 'LABA BERSIH PERIODE BERJALAN' : 'RUGI BERSIH PERIODE BERJALAN',
    '',
    0, 0, 0, 0, 0, 0,
    wsRes.isNetIncome ? wsRes.netIncome : 0,
    wsRes.isNetIncome ? 0 : Math.abs(wsRes.netIncome),
    wsRes.isNetIncome ? 0 : Math.abs(wsRes.netIncome),
    wsRes.isNetIncome ? wsRes.netIncome : 0,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 5. Sheet Laba Rugi
 */
export function buildIncomeStatementSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'LAPORAN LABA RUGI', `${settings.periodStart} s/d ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  const ledgers = calculateLedgers(accounts, transactions, ['umum', 'penyesuaian']);

  let totalPendapatan = 0;
  let totalBeban = 0;

  rows.push(['PENDAPATAN', '']);
  accounts
    .filter((a) => a.category === AccountCategory.PENDAPATAN || a.category === AccountCategory.PENDAPATAN_LRA)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceCredit - l.endingBalanceDebit;
      if (bal !== 0) {
        totalPendapatan += bal;
        rows.push([`  ${acc.name}`, bal]);
      }
    });
  rows.push(['TOTAL PENDAPATAN', totalPendapatan]);
  rows.push([]);

  rows.push(['BEBAN OPERASIONAL', '']);
  accounts
    .filter((a) => a.category === AccountCategory.BEBAN || a.category === AccountCategory.BELANJA_LRA)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceDebit - l.endingBalanceCredit;
      if (bal !== 0) {
        totalBeban += bal;
        rows.push([`  ${acc.name}`, bal]);
      }
    });
  rows.push(['TOTAL BEBAN', totalBeban]);
  rows.push([]);

  const netIncome = totalPendapatan - totalBeban;
  rows.push([netIncome >= 0 ? 'LABA BERSIH TAHUN/PERIODE BERJALAN' : 'RUGI BERSIH TAHUN/PERIODE BERJALAN', netIncome]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 6. Sheet Posisi Keuangan (Neraca)
 */
export function buildBalanceSheetSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'LAPORAN POSISI KEUANGAN (NERACA)', `Per ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  const ledgers = calculateLedgers(accounts, transactions, ['umum', 'penyesuaian']);

  let totalAset = 0;
  let totalLiabilitas = 0;
  let totalEkuitas = 0;

  // Laba Bersih
  let rev = 0, exp = 0;
  accounts.forEach((a) => {
    const l = ledgers.get(a.code);
    if (!l) return;
    if (a.category === AccountCategory.PENDAPATAN || a.category === AccountCategory.PENDAPATAN_LRA) {
      rev += l.endingBalanceCredit - l.endingBalanceDebit;
    }
    if (a.category === AccountCategory.BEBAN || a.category === AccountCategory.BELANJA_LRA) {
      exp += l.endingBalanceDebit - l.endingBalanceCredit;
    }
  });
  const netIncome = rev - exp;

  rows.push(['ASET', '']);
  accounts
    .filter((a) => a.category === AccountCategory.ASET)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = acc.isContra
        ? -(l.endingBalanceCredit - l.endingBalanceDebit)
        : l.endingBalanceDebit - l.endingBalanceCredit;
      if (bal !== 0) {
        totalAset += bal;
        rows.push([`  ${acc.name}`, bal]);
      }
    });
  rows.push(['TOTAL ASET', totalAset]);
  rows.push([]);

  rows.push(['LIABILITAS / KEWAJIBAN', '']);
  accounts
    .filter((a) => a.category === AccountCategory.LIABILITAS)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceCredit - l.endingBalanceDebit;
      if (bal !== 0) {
        totalLiabilitas += bal;
        rows.push([`  ${acc.name}`, bal]);
      }
    });
  rows.push(['TOTAL LIABILITAS', totalLiabilitas]);
  rows.push([]);

  rows.push(['EKUITAS', '']);
  accounts
    .filter((a) => a.category === AccountCategory.EKUITAS && a.code !== '399')
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = acc.isContra
        ? -(l.endingBalanceDebit - l.endingBalanceCredit)
        : l.endingBalanceCredit - l.endingBalanceDebit;
      if (bal !== 0) {
        totalEkuitas += bal;
        rows.push([`  ${acc.name}`, bal]);
      }
    });

  totalEkuitas += netIncome;
  rows.push(['  Laba / (Rugi) Bersih Periode Berjalan', netIncome]);
  rows.push(['TOTAL EKUITAS', totalEkuitas]);
  rows.push([]);

  const totalLiabAndEquity = totalLiabilitas + totalEkuitas;
  rows.push(['TOTAL LIABILITAS DAN EKUITAS', totalLiabAndEquity]);
  rows.push(['STATUS KESEIMBANGAN', totalAset === totalLiabAndEquity ? 'SEIMBANG (BALANCE)' : `SELISIH ${Math.abs(totalAset - totalLiabAndEquity)}`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 7. Sheet Jurnal Penutup
 */
export function buildClosingEntriesSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings, standard: AccountingStandard): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'JURNAL PENUTUP (CLOSING ENTRIES)', `${settings.periodStart} s/d ${settings.periodEnd}`, standard);
  const rows: any[][] = [...header];

  const closingTx = generateClosingEntries(accounts, transactions, settings.periodEnd, standard);

  rows.push(['Tanggal', 'No. Ref', 'Keterangan Akun & Penutupan', 'Kode Akun', 'Debit (Rp)', 'Kredit (Rp)']);

  let totD = 0, totK = 0;
  closingTx.forEach((tx) => {
    tx.entries.forEach((e, idx) => {
      const isFirst = idx === 0;
      const isCredit = e.credit > 0 && e.debit === 0;
      const indent = isCredit ? '    ' : '';

      totD += e.debit;
      totK += e.credit;

      rows.push([
        isFirst ? tx.date : '',
        isFirst ? tx.refNumber : '',
        indent + e.accountName,
        e.accountCode,
        e.debit,
        e.credit,
      ]);
    });
    rows.push(['', '', `  (${tx.description})`, '', 0, 0]);
  });

  rows.push([]);
  rows.push(['TOTAL', '', '', '', totD, totK]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 8. Sheet Khusus SAK Syariah: Laporan Sumber & Penyaluran Zakat
 */
export function buildSyariahZakatSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'LAPORAN SUMBER DAN PENYALURAN DANA ZAKAT', `${settings.periodStart} s/d ${settings.periodEnd}`, 'SAK Syariah');
  const rows: any[][] = [...header];

  const ledgers = calculateLedgers(accounts, transactions, ['umum', 'penyesuaian']);

  let totalSumber = 0;
  let totalSalur = 0;

  rows.push(['A. SUMBER DANA ZAKAT', '']);
  accounts
    .filter((a) => a.code.startsWith('41') || a.name.toLowerCase().includes('penerimaan dana zakat'))
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceCredit;
      totalSumber += bal;
      rows.push([`  ${acc.name}`, bal]);
    });
  rows.push(['TOTAL SUMBER DANA ZAKAT', totalSumber]);
  rows.push([]);

  rows.push(['B. PENYALURAN DANA ZAKAT', '']);
  accounts
    .filter((a) => a.code.startsWith('51') || a.name.toLowerCase().includes('penyaluran dana zakat'))
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceDebit;
      totalSalur += bal;
      rows.push([`  ${acc.name}`, bal]);
    });
  rows.push(['TOTAL PENYALURAN DANA ZAKAT', totalSalur]);
  rows.push([]);

  const surplusZakat = totalSumber - totalSalur;
  rows.push(['KENAIKAN / (PENURUNAN) BERSIH DANA ZAKAT', surplusZakat]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * 9. Sheet Khusus SAP: Laporan Realisasi Anggaran (LRA)
 */
export function buildSAPLraSheet(accounts: Account[], transactions: Transaction[], settings: EntitySettings): XLSX.WorkSheet {
  const header = createReportHeader(settings.entityName, 'LAPORAN REALISASI ANGGARAN (LRA)', `${settings.periodStart} s/d ${settings.periodEnd}`, 'SAP (PP 71/2010)');
  const rows: any[][] = [...header];

  const ledgers = calculateLedgers(accounts, transactions, ['umum', 'penyesuaian']);

  rows.push(['Uraian Akun', 'Kode', 'Realisasi (Rp)', 'Basis Pengukuran']);

  let totalPendapatanLRA = 0;
  let totalBelanjaLRA = 0;

  rows.push(['PENDAPATAN - LRA (BASIS KAS)', '', '', '']);
  accounts
    .filter((a) => a.category === AccountCategory.PENDAPATAN_LRA)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceCredit;
      totalPendapatanLRA += bal;
      rows.push([`  ${acc.name}`, acc.code, bal, 'Basis Kas']);
    });
  rows.push(['TOTAL PENDAPATAN - LRA', '', totalPendapatanLRA, '']);
  rows.push([]);

  rows.push(['BELANJA - LRA (BASIS KAS)', '', '', '']);
  accounts
    .filter((a) => a.category === AccountCategory.BELANJA_LRA)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceDebit;
      totalBelanjaLRA += bal;
      rows.push([`  ${acc.name}`, acc.code, bal, 'Basis Kas']);
    });
  rows.push(['TOTAL BELANJA - LRA', '', totalBelanjaLRA, '']);
  rows.push([]);

  const surplusDefisitLRA = totalPendapatanLRA - totalBelanjaLRA;
  rows.push([surplusDefisitLRA >= 0 ? 'SURPLUS LRA' : 'DEFISIT LRA', '', surplusDefisitLRA, '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = autoFitColumns(rows);
  return ws;
}

/**
 * Main function: Exports all financial statements into a clean multi-sheet .xlsx workbook
 */
export function exportAllReportsToExcel(options: ExportOptions): void {
  const { settings, standard, accounts, transactions } = options;

  const wb = XLSX.utils.book_new();

  // 1. Jurnal Umum
  XLSX.utils.book_append_sheet(wb, buildGeneralJournalSheet(transactions, settings, standard), sanitizeSheetName('Jurnal Umum'));

  // 2. Buku Besar
  XLSX.utils.book_append_sheet(wb, buildLedgerSheet(accounts, transactions, settings, standard), sanitizeSheetName('Buku Besar'));

  // 3. Neraca Saldo
  XLSX.utils.book_append_sheet(wb, buildTrialBalanceSheet(accounts, transactions, settings, standard), sanitizeSheetName('Neraca Saldo'));

  // 4. Kertas Kerja (10 Kolom)
  XLSX.utils.book_append_sheet(wb, buildWorksheetSheet(accounts, transactions, settings, standard), sanitizeSheetName('Kertas Kerja'));

  // 5. Laba Rugi
  XLSX.utils.book_append_sheet(wb, buildIncomeStatementSheet(accounts, transactions, settings, standard), sanitizeSheetName('Laba Rugi'));

  // 6. Posisi Keuangan / Neraca
  XLSX.utils.book_append_sheet(wb, buildBalanceSheetSheet(accounts, transactions, settings, standard), sanitizeSheetName('Posisi Keuangan'));

  // 7. Jurnal Penutup
  XLSX.utils.book_append_sheet(wb, buildClosingEntriesSheet(accounts, transactions, settings, standard), sanitizeSheetName('Jurnal Penutup'));

  // 8. Standar Khusus: Syariah
  if (standard === AccountingStandard.SAK_SYARIAH) {
    XLSX.utils.book_append_sheet(wb, buildSyariahZakatSheet(accounts, transactions, settings), sanitizeSheetName('Dana Zakat'));
  }

  // 9. Standar Khusus: SAP
  if (standard === AccountingStandard.SAP) {
    XLSX.utils.book_append_sheet(wb, buildSAPLraSheet(accounts, transactions, settings), sanitizeSheetName('LRA Anggaran'));
  }

  const safeFileName = `${settings.entityName.replace(/[^a-zA-Z0-9]/g, '_')}_Laporan_Keuangan_${standard}.xlsx`;
  XLSX.writeFile(wb, safeFileName);
}

/**
 * Individual Module Exporters
 */
export function exportSingleSheetToExcel(sheetName: string, ws: XLSX.WorkSheet, fileName: string): void {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName));
  XLSX.writeFile(wb, fileName);
}
