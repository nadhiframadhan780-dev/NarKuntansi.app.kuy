import {
  Account,
  AccountingStandard,
  AccountCategory,
  JournalEntryItem,
  LedgerAccount,
  LedgerEntry,
  NormalBalance,
  Transaction,
  TrialBalanceItem,
  TrialBalanceResult,
  WorksheetResult,
  WorksheetRow,
} from '../types/accounting';

/**
 * Calculates General Ledger (Buku Besar) for all accounts given a list of transactions.
 * Chronologically sorts transactions and strictly calculates running balance according to Normal Balance.
 */
export function calculateLedgers(
  accounts: Account[],
  transactions: Transaction[],
  includeCategories: Array<'umum' | 'penyesuaian' | 'penutup' | 'pembalik'> = ['umum', 'penyesuaian']
): Map<string, LedgerAccount> {
  const ledgerMap = new Map<string, LedgerAccount>();

  // Initialize ledger accounts
  accounts.forEach((acc) => {
    ledgerMap.set(acc.code, {
      account: acc,
      entries: [],
      totalDebit: 0,
      totalCredit: 0,
      endingBalance: 0,
      endingBalanceDebit: 0,
      endingBalanceCredit: 0,
    });
  });

  // Filter and sort transactions chronologically
  const sortedTx = [...transactions]
    .filter((tx) => includeCategories.includes(tx.category))
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return (a.refNumber || '').localeCompare(b.refNumber || '');
    });

  // Process journal entries into ledger
  sortedTx.forEach((tx) => {
    tx.entries.forEach((entry) => {
      const ledger = ledgerMap.get(entry.accountCode);
      if (!ledger) return;

      const debit = Math.round(Number(entry.debit) || 0);
      const credit = Math.round(Number(entry.credit) || 0);

      if (debit === 0 && credit === 0) return;

      let newBalance = ledger.endingBalance;
      const isNormalDebit = ledger.account.normalBalance === NormalBalance.DEBIT;

      if (isNormalDebit) {
        newBalance = newBalance + debit - credit;
      } else {
        newBalance = newBalance + credit - debit;
      }

      const ledgerEntry: LedgerEntry = {
        date: tx.date,
        refNumber: tx.refNumber || '-',
        description: tx.description || entry.accountName,
        debit,
        credit,
        runningBalance: newBalance,
        category: tx.category,
      };

      ledger.entries.push(ledgerEntry);
      ledger.totalDebit += debit;
      ledger.totalCredit += credit;
      ledger.endingBalance = newBalance;
    });
  });

  // Finalize ending balance debit/credit columns
  ledgerMap.forEach((ledger) => {
    const isNormalDebit = ledger.account.normalBalance === NormalBalance.DEBIT;
    if (isNormalDebit) {
      if (ledger.endingBalance >= 0) {
        ledger.endingBalanceDebit = ledger.endingBalance;
        ledger.endingBalanceCredit = 0;
      } else {
        ledger.endingBalanceDebit = 0;
        ledger.endingBalanceCredit = Math.abs(ledger.endingBalance);
      }
    } else {
      if (ledger.endingBalance >= 0) {
        ledger.endingBalanceDebit = 0;
        ledger.endingBalanceCredit = ledger.endingBalance;
      } else {
        ledger.endingBalanceDebit = Math.abs(ledger.endingBalance);
        ledger.endingBalanceCredit = 0;
      }
    }
  });

  return ledgerMap;
}

/**
 * Calculates Trial Balance (Neraca Saldo)
 */
export function calculateTrialBalance(
  accounts: Account[],
  transactions: Transaction[],
  categories: Array<'umum' | 'penyesuaian' | 'penutup' | 'pembalik'> = ['umum']
): TrialBalanceResult {
  const ledgers = calculateLedgers(accounts, transactions, categories);
  const items: TrialBalanceItem[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  accounts.forEach((acc) => {
    const ledger = ledgers.get(acc.code);
    if (!ledger) return;

    const debit = ledger.endingBalanceDebit;
    const credit = ledger.endingBalanceCredit;

    // Include account if it has activity or non-zero balance
    if (debit > 0 || credit > 0 || ledger.entries.length > 0) {
      items.push({
        account: acc,
        debit,
        credit,
      });
      totalDebit += debit;
      totalCredit += credit;
    }
  });

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference === 0;

  return {
    items,
    totalDebit,
    totalCredit,
    isBalanced,
    difference,
  };
}

/**
 * Calculates 10-Column Worksheet (Kertas Kerja / Neraca Lajur)
 * Pair Columns:
 * 1-2: Neraca Saldo (D/K)
 * 3-4: Penyesuaian (D/K)
 * 5-6: Neraca Saldo Disesuaikan (D/K)
 * 7-8: Laba Rugi (D/K)
 * 9-10: Neraca (D/K)
 */
export function calculateWorksheet(
  accounts: Account[],
  transactions: Transaction[]
): WorksheetResult {
  const umumTx = transactions.filter((t) => t.category === 'umum');
  const adjTx = transactions.filter((t) => t.category === 'penyesuaian');

  const rawTrialBalanceLedgers = calculateLedgers(accounts, umumTx, ['umum']);

  // Calculate Adjustments per account
  const adjMap = new Map<string, { debit: number; credit: number }>();
  adjTx.forEach((tx) => {
    tx.entries.forEach((e) => {
      const cur = adjMap.get(e.accountCode) || { debit: 0, credit: 0 };
      cur.debit += Math.round(Number(e.debit) || 0);
      cur.credit += Math.round(Number(e.credit) || 0);
      adjMap.set(e.accountCode, cur);
    });
  });

  const rows: WorksheetRow[] = [];

  let tbTotD = 0, tbTotK = 0;
  let adjTotD = 0, adjTotK = 0;
  let nsdTotD = 0, nsdTotK = 0;
  let lrTotD = 0, lrTotK = 0;
  let neracaTotD = 0, neracaTotK = 0;

  accounts.forEach((acc) => {
    const rawL = rawTrialBalanceLedgers.get(acc.code);
    const adj = adjMap.get(acc.code) || { debit: 0, credit: 0 };

    const tbDebit = rawL ? rawL.endingBalanceDebit : 0;
    const tbCredit = rawL ? rawL.endingBalanceCredit : 0;

    // Has activity in either trial balance or adjustments?
    const hasActivity =
      tbDebit > 0 ||
      tbCredit > 0 ||
      adj.debit > 0 ||
      adj.credit > 0 ||
      (rawL && rawL.entries.length > 0);

    if (!hasActivity) return;

    tbTotD += tbDebit;
    tbTotK += tbCredit;
    adjTotD += adj.debit;
    adjTotK += adj.credit;

    // Calculate Adjusted Trial Balance (NSD)
    let netDebit = tbDebit + adj.debit;
    let netCredit = tbCredit + adj.credit;

    let nsdDebit = 0;
    let nsdCredit = 0;

    if (acc.normalBalance === NormalBalance.DEBIT) {
      const netVal = netDebit - netCredit;
      if (netVal >= 0) {
        nsdDebit = netVal;
        nsdCredit = 0;
      } else {
        nsdDebit = 0;
        nsdCredit = Math.abs(netVal);
      }
    } else {
      const netVal = netCredit - netDebit;
      if (netVal >= 0) {
        nsdDebit = 0;
        nsdCredit = netVal;
      } else {
        nsdDebit = Math.abs(netVal);
        nsdCredit = 0;
      }
    }

    nsdTotD += nsdDebit;
    nsdTotK += nsdCredit;

    // Determine target column: Laba Rugi (Revenue & Expense) or Neraca (Asset, Liability, Equity)
    let lrDebit = 0;
    let lrCredit = 0;
    let neracaDebit = 0;
    let neracaCredit = 0;

    const isIncomeStatement =
      acc.category === AccountCategory.PENDAPATAN ||
      acc.category === AccountCategory.BEBAN ||
      acc.category === AccountCategory.PENDAPATAN_LRA ||
      acc.category === AccountCategory.BELANJA_LRA;

    if (isIncomeStatement) {
      lrDebit = nsdDebit;
      lrCredit = nsdCredit;
      lrTotD += lrDebit;
      lrTotK += lrCredit;
    } else {
      neracaDebit = nsdDebit;
      neracaCredit = nsdCredit;
      neracaTotD += neracaDebit;
      neracaTotK += neracaCredit;
    }

    rows.push({
      account: acc,
      trialBalance: { debit: tbDebit, credit: tbCredit },
      adjustment: { debit: adj.debit, credit: adj.credit },
      adjustedTrialBalance: { debit: nsdDebit, credit: nsdCredit },
      incomeStatement: { debit: lrDebit, credit: lrCredit },
      balanceSheet: { debit: neracaDebit, credit: neracaCredit },
    });
  });

  // Net Income / Loss: Laba Rugi Kredit (Pendapatan) - Debit (Beban)
  const netIncome = lrTotK - lrTotD;
  const isNetIncome = netIncome >= 0;

  const totals = {
    trialBalance: {
      debit: tbTotD,
      credit: tbTotK,
      diff: Math.abs(tbTotD - tbTotK),
      balanced: tbTotD === tbTotK,
    },
    adjustment: {
      debit: adjTotD,
      credit: adjTotK,
      diff: Math.abs(adjTotD - adjTotK),
      balanced: adjTotD === adjTotK,
    },
    adjustedTrialBalance: {
      debit: nsdTotD,
      credit: nsdTotK,
      diff: Math.abs(nsdTotD - nsdTotK),
      balanced: nsdTotD === nsdTotK,
    },
    incomeStatement: {
      debit: lrTotD,
      credit: lrTotK,
      diff: Math.abs(lrTotD - lrTotK),
    },
    balanceSheet: {
      debit: neracaTotD,
      credit: neracaTotK,
      diff: Math.abs(neracaTotD - neracaTotK),
    },
  };

  const finalBalanced =
    totals.trialBalance.balanced &&
    totals.adjustment.balanced &&
    totals.adjustedTrialBalance.balanced;

  return {
    rows,
    totals,
    netIncome,
    isNetIncome,
    finalBalanced,
  };
}

/**
 * Generates the 4 Standard Closing Entries (Jurnal Penutup)
 * 1. Tutup Akun Pendapatan ke Ikhtisar Laba Rugi
 * 2. Tutup Akun Beban ke Ikhtisar Laba Rugi
 * 3. Tutup Ikhtisar Laba Rugi ke Modal / Saldo Laba
 * 4. Tutup Prive / Dividen ke Modal / Saldo Laba
 */
export function generateClosingEntries(
  accounts: Account[],
  transactions: Transaction[],
  closingDate: string,
  standard: AccountingStandard
): Transaction[] {
  const activeTx = transactions.filter(
    (t) => t.category === 'umum' || t.category === 'penyesuaian'
  );
  const ledgers = calculateLedgers(accounts, activeTx, ['umum', 'penyesuaian']);

  const closingTxList: Transaction[] = [];

  // Find Ikhtisar Laba Rugi account or default
  const ikhtisarAcc =
    accounts.find((a) => a.code === '399' || a.name.toLowerCase().includes('ikhtisar')) || {
      id: 'closing-399',
      code: '399',
      name: 'Ikhtisar Laba Rugi',
      category: AccountCategory.EKUITAS,
      normalBalance: NormalBalance.KREDIT,
    };

  // Find Capital / Retained Earnings Account
  const modalAcc =
    accounts.find(
      (a) =>
        a.code === '301' ||
        a.code === '302' ||
        a.code === '303' ||
        a.name.toLowerCase().includes('modal') ||
        a.name.toLowerCase().includes('saldo laba') ||
        a.name.toLowerCase().includes('ekuitas dana')
    ) || {
      id: 'closing-301',
      code: '301',
      name: standard === AccountingStandard.PSAK ? 'Saldo Laba' : 'Modal Pemilik',
      category: AccountCategory.EKUITAS,
      normalBalance: NormalBalance.KREDIT,
    };

  // Find Prive / Dividen Account
  const priveAcc = accounts.find(
    (a) =>
      a.name.toLowerCase().includes('prive') ||
      a.name.toLowerCase().includes('dividen') ||
      a.isContra && a.category === AccountCategory.EKUITAS
  );

  // 1. Step 1: Closing Revenues
  const revenueEntries: JournalEntryItem[] = [];
  let totalRevenue = 0;

  accounts
    .filter(
      (a) =>
        a.category === AccountCategory.PENDAPATAN ||
        a.category === AccountCategory.PENDAPATAN_LRA
    )
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceCredit - l.endingBalanceDebit;
      if (bal > 0) {
        revenueEntries.push({
          accountCode: acc.code,
          accountName: acc.name,
          debit: bal,
          credit: 0,
        });
        totalRevenue += bal;
      }
    });

  if (revenueEntries.length > 0 && totalRevenue > 0) {
    revenueEntries.push({
      accountCode: ikhtisarAcc.code,
      accountName: ikhtisarAcc.name,
      debit: 0,
      credit: totalRevenue,
    });

    closingTxList.push({
      id: `closing-rev-${Date.now()}`,
      date: closingDate,
      refNumber: 'JP-001',
      description: 'Menutup seluruh akun Pendapatan ke Ikhtisar Laba Rugi',
      category: 'penutup',
      entries: revenueEntries,
      notes: 'Langkah 1 Jurnal Penutup: Menolkan saldo akun nominal pendapatan',
    });
  }

  // 2. Step 2: Closing Expenses
  const expenseEntries: JournalEntryItem[] = [];
  let totalExpense = 0;

  accounts
    .filter(
      (a) =>
        a.category === AccountCategory.BEBAN ||
        a.category === AccountCategory.BELANJA_LRA
    )
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceDebit - l.endingBalanceCredit;
      if (bal > 0) {
        expenseEntries.push({
          accountCode: acc.code,
          accountName: acc.name,
          debit: 0,
          credit: bal,
        });
        totalExpense += bal;
      }
    });

  if (expenseEntries.length > 0 && totalExpense > 0) {
    const fullExpenseEntries: JournalEntryItem[] = [
      {
        accountCode: ikhtisarAcc.code,
        accountName: ikhtisarAcc.name,
        debit: totalExpense,
        credit: 0,
      },
      ...expenseEntries,
    ];

    closingTxList.push({
      id: `closing-exp-${Date.now()}`,
      date: closingDate,
      refNumber: 'JP-002',
      description: 'Menutup seluruh akun Beban ke Ikhtisar Laba Rugi',
      category: 'penutup',
      entries: fullExpenseEntries,
      notes: 'Langkah 2 Jurnal Penutup: Menolkan saldo akun nominal beban',
    });
  }

  // 3. Step 3: Closing Income Summary to Capital / Equity
  const netIncome = totalRevenue - totalExpense;
  if (netIncome !== 0) {
    const isProfit = netIncome > 0;
    const entries: JournalEntryItem[] = isProfit
      ? [
          {
            accountCode: ikhtisarAcc.code,
            accountName: ikhtisarAcc.name,
            debit: netIncome,
            credit: 0,
          },
          {
            accountCode: modalAcc.code,
            accountName: modalAcc.name,
            debit: 0,
            credit: netIncome,
          },
        ]
      : [
          {
            accountCode: modalAcc.code,
            accountName: modalAcc.name,
            debit: Math.abs(netIncome),
            credit: 0,
          },
          {
            accountCode: ikhtisarAcc.code,
            accountName: ikhtisarAcc.name,
            debit: 0,
            credit: Math.abs(netIncome),
          },
        ];

    closingTxList.push({
      id: `closing-net-${Date.now()}`,
      date: closingDate,
      refNumber: 'JP-003',
      description: isProfit
        ? 'Menutup Laba Bersih ke akun Modal/Saldo Laba'
        : 'Menutup Rugi Bersih ke akun Modal/Saldo Laba',
      category: 'penutup',
      entries,
      notes: isProfit
        ? `Laba Bersih sebesar ${netIncome} menambah ekuitas modal`
        : `Rugi Bersih sebesar ${Math.abs(netIncome)} mengurangi ekuitas modal`,
    });
  }

  // 4. Step 4: Closing Prive / Dividen to Capital
  if (priveAcc) {
    const priveLedger = ledgers.get(priveAcc.code);
    if (priveLedger) {
      const priveBal =
        priveLedger.endingBalanceDebit - priveLedger.endingBalanceCredit;
      if (priveBal > 0) {
        closingTxList.push({
          id: `closing-prive-${Date.now()}`,
          date: closingDate,
          refNumber: 'JP-004',
          description: `Menutup akun ${priveAcc.name} ke Modal`,
          category: 'penutup',
          entries: [
            {
              accountCode: modalAcc.code,
              accountName: modalAcc.name,
              debit: priveBal,
              credit: 0,
            },
            {
              accountCode: priveAcc.code,
              accountName: priveAcc.name,
              debit: 0,
              credit: priveBal,
            },
          ],
          notes: 'Langkah 4 Jurnal Penutup: Menutup pengambilan pribadi / dividen ke modal',
        });
      }
    }
  }

  return closingTxList;
}

/**
 * Generates Reversing Entries (Jurnal Pembalik)
 * Reverses adjusting entries made for accruals (expenses/revenues still to be paid/received)
 */
export function generateReversingEntries(
  transactions: Transaction[],
  reversingDate: string
): Transaction[] {
  const adjTx = transactions.filter((t) => t.category === 'penyesuaian');
  const reversingTxList: Transaction[] = [];

  adjTx.forEach((tx, idx) => {
    // Reverse only accrual related adjustments
    const descLower = tx.description.toLowerCase();
    const isAccrual =
      descLower.includes('akrual') ||
      descLower.includes('yang masih harus') ||
      descLower.includes('terutang') ||
      descLower.includes('belum diterima') ||
      descLower.includes('masih harus dibayar');

    if (isAccrual) {
      const reversedEntries: JournalEntryItem[] = tx.entries.map((entry) => ({
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debit: entry.credit,
        credit: entry.debit,
      }));

      reversingTxList.push({
        id: `rev-${tx.id || idx}-${Date.now()}`,
        date: reversingDate,
        refNumber: `JMB-${String(idx + 1).padStart(3, '0')}`,
        description: `Pembalik: ${tx.description}`,
        category: 'pembalik',
        entries: reversedEntries,
        notes: 'Jurnal Pembalik awal periode berikutnya untuk akun akrual',
      });
    }
  });

  return reversingTxList;
}
