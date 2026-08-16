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

  // Initialize Gemini AI Client lazy/gracefully
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health API
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      appName: "NarKuntansi",
      version: "1.0.0",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Transaction Parser API for Accounting Word Problems in Indonesian
  app.post("/api/parse-transaction", async (req, res) => {
    try {
      const { text, standard, coaList } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Teks transaksi soal cerita diperlukan." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY belum terkonfigurasi di server. Silakan gunakan parser rule-based lokal.",
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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Analisis transaksi soal cerita berikut dan buatkan entri jurnalnya:\n\n${text}`,
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
