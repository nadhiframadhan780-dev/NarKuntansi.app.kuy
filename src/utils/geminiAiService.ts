import { Account, AccountingStandard, JournalEntryItem } from '../types/accounting';
import { ParsedTransactionDraft } from './transactionParser';

export interface GeminiTestResult {
  valid: boolean;
  message: string;
  modelUsed?: string;
}

export interface GeminiChatResponse {
  answer: string;
  modelUsed?: string;
  error?: string;
}

export interface GeminiParseResponse {
  drafts: ParsedTransactionDraft[];
  message: string;
  isAI: boolean;
  error?: string;
}

/**
 * Standard descriptions for AI System Prompt
 */
const STANDARD_PROMPTS: Record<AccountingStandard, string> = {
  [AccountingStandard.PSAK]:
    'SAK Umum / PSAK (IFRS) Indonesia: Berbasis akrual penuh, aset tetap dengan model biaya/revaluasi, jurnal penyesuaian sewa/depresiasi.',
  [AccountingStandard.SAK_EMKM]:
    'SAK EMKM: Sederhana untuk Usaha Mikro Kecil Menengah, laporan utama: Laporan Posisi Keuangan, Laba Rugi, dan Catatan Atas Laporan Keuangan.',
  [AccountingStandard.SAK_SYARIAH]:
    'SAK Syariah (PSAK 101-112): DILARANG menggunakan bunga/riba/bunga bank. Gunakan akad Murabahah (margin), Mudharabah/Musyarakah (bagi hasil), Ijarah (ujrah/sewa), Wadiah (titipan), serta pengelolaan Kas & Kewajiban Dana Zakat.',
  [AccountingStandard.SAK_EP]:
    'SAK Entitas Privat (SAK EP 2025): Berlaku efektif 1 Januari 2025 menggantikan SAK ETAP, dengan perlakuan akuntansi komprehensif tanpa kerumitan IFRS penuh.',
  [AccountingStandard.SAP]:
    'SAP (PP 71/2010): Standar Akuntansi Pemerintahan Dual-Track: Catat Jurnal Finansial (LO & Neraca) dan Jurnal Anggaran (LRA - Belanja/Pendapatan LRA).',
};

/**
 * Tests a Gemini API Key either via backend proxy or direct REST call
 */
export async function testGeminiApiKey(apiKey: string, model = 'gemini-2.5-flash'): Promise<GeminiTestResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { valid: false, message: 'Kunci API kosong. Silakan masukkan Kunci API Gemini Anda.' };
  }

  // 1. Try Backend Proxy first
  try {
    const res = await fetch('/api/test-gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: cleanKey, model }),
    });

    if (res.ok) {
      const data = await res.json();
      return { valid: true, message: data.message || 'Koneksi Gemini AI Berhasil!', modelUsed: data.modelUsed };
    }
  } catch {
    // Backend not reachable (e.g. static GitHub Pages), fall through to direct REST
  }

  // 2. Direct REST Call to Google Generative Language API (Works on GitHub Pages)
  try {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;
    const res = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Jawab singkat satu kata: 'TERHUBUNG'." }] }],
      }),
    });

    if (res.ok) {
      return { valid: true, message: 'Kunci API Gemini valid & siap digunakan (Direct API).', modelUsed: 'gemini-2.5-flash' };
    } else {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${res.status}: Gagal memverifikasi Kunci API`;
      return { valid: false, message: `Kunci API tidak valid: ${msg}` };
    }
  } catch (err: any) {
    return { valid: false, message: `Gagal menghubungi server Gemini: ${err?.message || 'Periksa koneksi internet Anda.'}` };
  }
}

/**
 * Sends a question or case study to Gemini AI CPA Consultant
 */
export async function askGeminiCpa(params: {
  question: string;
  standard: AccountingStandard;
  coaList: Account[];
  apiKey?: string;
  model?: string;
}): Promise<GeminiChatResponse> {
  const { question, standard, coaList, apiKey, model = 'gemini-2.5-flash' } = params;

  // 1. Try Backend API
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        standard,
        coaList,
        apiKey,
        model,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { answer: data.answer, modelUsed: data.modelUsed };
    }
  } catch {
    // If backend unavailable, continue to direct client call
  }

  // 2. Direct Client-Side call for GitHub Pages
  if (apiKey?.trim()) {
    try {
      const cleanKey = apiKey.trim();
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;

      const systemInstruction = `Anda adalah "NarKuntansi AI CPA", asisten Akuntan Publik Indonesia yang sangat ahli dan berwibawa dalam 5 standar akuntansi Indonesia.
Standar Akuntansi Aktif Saat Ini: ${STANDARD_PROMPTS[standard] || standard}

Daftar Akun Utama Yang Digunakan Perusahaan:
${JSON.stringify(coaList.slice(0, 60).map((a) => ({ code: a.code, name: a.name, category: a.category, normalBalance: a.normalBalance })), null, 2)}

Aturan:
1. Berikan jawaban yang komprehensif, terstruktur, mendalam, dan 100% akurat sesuai standar akuntansi Indonesia.
2. Jika ada jurnal transaksi, berikan format tabel berpasangan yang seimbang (Debit = Kredit) dengan kode akun yang relevan.
3. Untuk SAK Syariah: Tidak boleh ada konsep bunga, gunakan margin atau bagi hasil.
4. Gunakan gaya bahasa profesional, ramah, dan format Markdown yang rapi.`;

      const res = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: question }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada balasan dari AI.';
        return { answer: text, modelUsed: 'gemini-2.5-flash' };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return {
          answer: '',
          error: errJson?.error?.message || `Gagal menghubungi Gemini API (Status ${res.status}).`,
        };
      }
    } catch (err: any) {
      return {
        answer: '',
        error: `Koneksi gagal: ${err?.message || 'Periksa jaringan internet.'}`,
      };
    }
  }

  return {
    answer: '',
    error: 'Kunci API Gemini belum diatur. Silakan masukkan Kunci API Anda di menu Pengaturan (ikon roda gigi) di pojok kanan atas.',
  };
}

/**
 * Parses transaction word problems using Gemini AI with fallback
 */
export async function parseTransactionsWithGeminiAI(params: {
  text: string;
  standard: AccountingStandard;
  coaList: Account[];
  apiKey?: string;
  model?: string;
}): Promise<GeminiParseResponse> {
  const { text, standard, coaList, apiKey, model = 'gemini-2.5-flash' } = params;

  // 1. Try backend endpoint
  try {
    const res = await fetch('/api/parse-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        standard,
        coaList,
        apiKey,
        model,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.transactions && Array.isArray(data.transactions)) {
        const drafts: ParsedTransactionDraft[] = data.transactions.map((tx: any, idx: number) => {
          const totalDebit = (tx.entries || []).reduce((acc: number, e: JournalEntryItem) => acc + (Number(e.debit) || 0), 0);
          const totalCredit = (tx.entries || []).reduce((acc: number, e: JournalEntryItem) => acc + (Number(e.credit) || 0), 0);
          const diff = Math.abs(totalDebit - totalCredit);
          return {
            date: tx.date || new Date().toISOString().slice(0, 10),
            refNumber: tx.refNumber || `JU-${String(idx + 1).padStart(3, '0')}`,
            description: tx.description || 'Transaksi Akuntansi',
            category: tx.category || 'umum',
            entries: tx.entries || [],
            notes: tx.notes || `Dianalisis oleh Google Gemini AI (${standard})`,
            totalDebit,
            totalCredit,
            isBalanced: diff === 0,
            difference: diff,
          };
        });

        return {
          drafts,
          message: `Berhasil dianalisis oleh Google Gemini AI (${drafts.length} transaksi berpasangan seimbang).`,
          isAI: true,
        };
      }
    }
  } catch {
    // If backend unavailable, try direct client-side
  }

  // 2. Direct Gemini Call for GitHub Pages
  if (apiKey?.trim()) {
    try {
      const cleanKey = apiKey.trim();
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(cleanKey)}`;

      const systemPrompt = `Anda adalah Akuntan Publik Indonesia (CPA).
Analisis teks transaksi/soal cerita akuntansi bahasa Indonesia, dan buatkan jurnal umum double-entry yang BALANCE (Total Debit = Total Kredit) sesuai standar ${standard}.
Daftar Akun: ${JSON.stringify(coaList.map((a) => ({ code: a.code, name: a.name })), null, 1)}

KEMBALIKAN HANYA FORMAT JSON VALID:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "refNumber": "JU-001",
      "description": "Keterangan transaksi ringkas",
      "category": "umum",
      "notes": "Penjelasan analisis akuntansi",
      "entries": [
        { "accountCode": "101", "accountName": "Kas", "debit": 1000000, "credit": 0 },
        { "accountCode": "301", "accountName": "Modal Pemilik", "debit": 0, "credit": 1000000 }
      ]
    }
  ]
}`;

      const res = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: `Analisis transaksi berikut dan berikan format JSON:\n\n${text}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(jsonText);

        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          const drafts: ParsedTransactionDraft[] = parsed.transactions.map((tx: any, idx: number) => {
            const totalDebit = (tx.entries || []).reduce((acc: number, e: JournalEntryItem) => acc + (Number(e.debit) || 0), 0);
            const totalCredit = (tx.entries || []).reduce((acc: number, e: JournalEntryItem) => acc + (Number(e.credit) || 0), 0);
            const diff = Math.abs(totalDebit - totalCredit);
            return {
              date: tx.date || new Date().toISOString().slice(0, 10),
              refNumber: tx.refNumber || `JU-${String(idx + 1).padStart(3, '0')}`,
              description: tx.description || 'Transaksi Akuntansi',
              category: tx.category || 'umum',
              entries: tx.entries || [],
              notes: tx.notes || `Dianalisis oleh Google Gemini AI (${standard})`,
              totalDebit,
              totalCredit,
              isBalanced: diff === 0,
              difference: diff,
            };
          });

          return {
            drafts,
            message: `Berhasil dianalisis oleh Google Gemini AI (${drafts.length} transaksi seimbang).`,
            isAI: true,
          };
        }
      }
    } catch (err: any) {
      console.warn('Direct Gemini parse failed:', err);
    }
  }

  return {
    drafts: [],
    message: 'Gagal menggunakan Gemini AI.',
    isAI: false,
    error: 'Gemini AI tidak tersedia',
  };
}
