import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get Gemini client either with custom key or env key
  function getGeminiClient(customKey?: string): GoogleGenAI | null {
    const key = customKey?.trim() || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health API
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      appName: "NarKuntansi",
      version: "1.2.0",
      hasServerGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Test Gemini API Key
  app.post("/api/test-gemini-key", async (req, res) => {
    try {
      const { apiKey, model } = req.body;
      const ai = getGeminiClient(apiKey);
      if (!ai) {
        return res.status(400).json({ valid: false, message: "Kunci API tidak ditemukan atau kosong." });
      }

      const modelName = model || "gemini-3.7-flash";
      const response = await ai.models.generateContent({
        model: modelName,
        contents: "Test koneksi. Jawab singkat satu kata: 'TERHUBUNG'.",
      });

      return res.json({
        valid: true,
        message: "Kunci API Google Gemini valid & siap digunakan.",
        modelUsed: modelName,
        response: response.text?.trim() || "OK",
      });
    } catch (err: any) {
      return res.status(400).json({
        valid: false,
        message: err?.message || "Gagal memverifikasi Kunci API Gemini.",
      });
    }
  });

  // AI Accounting Consultant & Q&A API
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, standard, coaList, apiKey, model, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Pertanyaan diperlukan." });
      }

      const ai = getGeminiClient(apiKey);
      if (!ai) {
        return res.status(401).json({
          error: "Kunci API Gemini belum diatur. Silakan masukkan Kunci API Gemini Anda di menu Pengaturan.",
        });
      }

      const standardNames: Record<string, string> = {
        PSAK: "SAK Umum / PSAK (IFRS)",
        SAK_EMKM: "SAK EMKM (Entitas Mikro, Kecil, Menengah)",
        SAK_SYARIAH: "SAK Syariah (Tanpa Bunga/Riba, akad Murabahah/Mudharabah/Musyarakah/Ijarah/Zakat)",
        SAK_EP: "SAK Entitas Privat (SAK EP 2025)",
        SAP: "SAP (Standar Akuntansi Pemerintahan PP 71/2010)",
      };

      const systemPrompt = `Anda adalah "NarKuntansi AI CPA", asisten Akuntan Publik Indonesia yang sangat ahli dan berwibawa dalam 5 standar akuntansi Indonesia (PSAK/IFRS, SAK EMKM, SAK Syariah, SAK EP, SAP).
Anda bertugas menjawab seluruh pertanyaan akuntansi, memberikan solusi soal kasus, menjelaskan teori, menyusun jurnal penyesuaian/penutup, rumus depresiasi, analisis rasio, serta perpajakan terkait dengan akurasi 100%.

Standar Akuntansi Aktif: ${standardNames[standard] || standard || "PSAK"}

Daftar Akun yang tersedia saat ini:
${JSON.stringify((coaList || []).slice(0, 80).map((a: any) => ({ code: a.code, name: a.name, category: a.category, normalBalance: a.normalBalance })), null, 2)}

Ketentuan Jawaban:
1. Berikan penjelasan yang komprehensif, terstruktur dengan rapi, mudah dimengerti, dan berlandaskan PSAK/SAK yang berlaku di Indonesia.
2. Jika pengguna meminta jurnal, sertakan tabel/format Debit dan Kredit yang SEIMBANG (Total Debit = Total Kredit) beserta kode akun yang cocok.
3. Untuk SAK Syariah: Patuhi Fatwa DSN-MUI dan PSAK Syariah (hindari konsep bunga/riba, gunakan margin, bagi hasil, atau ujrah).
4. Untuk SAP: Ingat prinsip Dual-Track (Jurnal Finansial LO/Neraca dan Jurnal Anggaran LRA).
5. Gunakan format Markdown yang rapi (bold, tabel, list, latex/persamaan matematika jika ada rumus).`;

      const modelName = model || "gemini-3.7-flash";
      const response = await ai.models.generateContent({
        model: modelName,
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      return res.json({
        answer: response.text || "Tidak ada respon teks.",
        modelUsed: modelName,
      });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      return res.status(500).json({
        error: error?.message || "Terjadi kesalahan pada layanan AI Gemini.",
      });
    }
  });

  // AI Transaction Parser API for Accounting Word Problems in Indonesian
  app.post("/api/parse-transaction", async (req, res) => {
    try {
      const { text, standard, coaList, apiKey, model } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Teks transaksi soal cerita diperlukan." });
      }

      const ai = getGeminiClient(apiKey);
      if (!ai) {
        return res.status(503).json({
          error: "Kunci API Gemini belum tersedia. Menggunakan parser cerdas lokal.",
          useFallback: true,
        });
      }

      const standardNames: Record<string, string> = {
        PSAK: "SAK Umum / PSAK (IFRS)",
        SAK_EMKM: "SAK EMKM (Mikro, Kecil, Menengah)",
        SAK_SYARIAH: "SAK Syariah (Tanpa Bunga/Riba, akad Murabahah/Mudharabah/Musyarakah/Ijarah/Zakat)",
        SAK_EP: "SAK Entitas Privat (SAK EP 2025)",
        SAP: "SAP (Standar Akuntansi Pemerintahan PP 71/2010)",
      };

      const systemPrompt = `Anda adalah Akuntan Publik Indonesia (CPA) yang ahli dalam menyusun jurnal akuntansi double-entry untuk 5 standar akuntansi Indonesia.
Tugas Anda adalah membaca soal cerita/transaksi akuntansi dalam bahasa Indonesia, lalu menganalisis dan memecahnya menjadi daftar entri jurnal umum yang seimbang (Total Debit = Total Kredit) sesuai standar akuntansi yang dipilih.

Standar yang aktif: ${standardNames[standard] || standard || "SAK Umum / PSAK"}

Daftar Akun yang tersedia (Chart of Accounts):
${JSON.stringify(coaList || [], null, 2)}

ATURAN WAJIB:
1. Setiap transaksi HARUS balance: Total Debit === Total Kredit.
2. Gunakan kode dan nama akun yang paling tepat dari daftar akun yang tersedia.
3. Jika standar adalah SAK Syariah, TIDAK BOLEH ada akun "Bunga", gunakan Margin / Bagi Hasil / Ujrah.
4. Nominal uang harus berupa bilangan bulat positif (Rupiah).
5. Berikan tanggal (format YYYY-MM-DD), no ref (misal: JU-001), keterangan ringkas dan jelas, serta catatan analisis penjelasan akuntansi.
6. Kembalikan response DALAM FORMAT JSON SAJA yang valid sesuai schema berikut.

Format JSON Output:
{
  "transactions": [
    {
      "date": "2026-08-01",
      "refNumber": "JU-001",
      "description": "Keterangan transaksi ringkas",
      "category": "umum",
      "notes": "Penjelasan analisis akuntansi",
      "entries": [
        {
          "accountCode": "101",
          "accountName": "Kas",
          "debit": 10000000,
          "credit": 0
        },
        {
          "accountCode": "301",
          "accountName": "Modal Pemilik",
          "debit": 0,
          "credit": 10000000
        }
      ]
    }
  ]
}`;

      const modelName = model || "gemini-3.7-flash";
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Analisis seluruh transaksi soal cerita berikut dan buatkan entri jurnal akuntansinya:\n\n${text}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const responseText = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        return res.status(500).json({
          error: "Gagal memproses format JSON dari model AI",
          raw: responseText,
          useFallback: true,
        });
      }

      return res.json(parsedData);
    } catch (error: any) {
      console.error("Gemini parse transaction error:", error);
      return res.status(500).json({
        error: error?.message || "Terjadi kesalahan saat memproses AI Parser",
        useFallback: true,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NarKuntansi Server running on http://localhost:${PORT}`);
  });
}

startServer();
