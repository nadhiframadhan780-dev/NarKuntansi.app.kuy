import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Key,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Calculator,
  FileSpreadsheet,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { AccountingStandard } from '../types/accounting';
import { askGeminiCpa } from '../utils/geminiAiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  modelUsed?: string;
  error?: boolean;
}

const QUICK_PROMPTS: Record<AccountingStandard, { title: string; prompt: string }[]> = {
  [AccountingStandard.PSAK]: [
    {
      title: 'Jurnal Sewa Dibayar di Muka',
      prompt: 'Jelaskan perbedaan pencatatan sewa dibayar di muka dengan pendekatan beban vs aset, beserta jurnal penyesuaian di akhir periode.',
    },
    {
      title: 'Penyusutan Aset Tetap',
      prompt: 'Bagaimana rumus dan cara menghitung beban penyusutan metode garis lurus dan saldo menurun ganda beserta contoh jurnalnya?',
    },
    {
      title: 'Jurnal Penutup Siklus Akuntansi',
      prompt: 'Tuliskan langkah-langkah dan format jurnal penutup lengkap untuk menutup akun pendapatan, beban, ikhtisar laba rugi, dan prive.',
    },
  ],
  [AccountingStandard.SAK_EMKM]: [
    {
      title: 'Laporan Keuangan SAK EMKM',
      prompt: 'Apa saja 3 komponen utama laporan keuangan menurut SAK EMKM dan bagaimana perbedaannya dengan PSAK umum?',
    },
    {
      title: 'Pencatatan Prive & Modal',
      prompt: 'Bagaimana perlakuan akuntansi pengambilan prive oleh pemilik UMKM dan pengaruhnya terhadap Laporan Posisi Keuangan?',
    },
    {
      title: 'Pencatatan Persediaan Sederhana',
      prompt: 'Jelaskan cara mencatat persediaan barang dagang secara sederhana untuk UMKM menggunakan sistem periodik.',
    },
  ],
  [AccountingStandard.SAK_SYARIAH]: [
    {
      title: 'Akad Murabahah & Margin',
      prompt: 'Bagaimana pencatatan jurnal transaksi jual beli Murabahah secara tangguh (kredit), pengakuan margin tangguhan, dan penerimaan angsuran nasabah?',
    },
    {
      title: 'Penerimaan & Penyaluran Zakat',
      prompt: 'Jelaskan perlakuan akuntansi penerimaan dana zakat dari muzakki dan penyalurannya ke mustahik sesuai PSAK 109.',
    },
    {
      title: 'Akad Ijarah (Sewa Menyewa)',
      prompt: 'Tuliskan jurnal perolehan aset ijarah, pendapatan sewa, dan penyusutan aset ijarah menurut standar akuntansi syariah.',
    },
  ],
  [AccountingStandard.SAK_EP]: [
    {
      title: 'Transisi SAK EP 2025',
      prompt: 'Jelaskan perbedaan utama SAK Entitas Privat (SAK EP 2025) dibandingkan dengan SAK ETAP sebelumnya untuk entitas privat.',
    },
    {
      title: 'Imbalan Kerja Karyawan',
      prompt: 'Bagaimana pencatatan kewajiban imbalan kerja jangka pendek dan pascakerja sesuai SAK EP?',
    },
  ],
  [AccountingStandard.SAP]: [
    {
      title: 'Dual-Track SAP (LO vs LRA)',
      prompt: 'Jelaskan konsep Dual-Track dalam SAP: Mengapa pemerintah mencatat Jurnal Finansial (LO/Neraca) dan Jurnal Anggaran (LRA) secara bersamaan?',
    },
    {
      title: 'Pengadaan Belanja Modal',
      prompt: 'Tuliskan jurnal transaksi saat Pemda melakukan belanja modal pengadaan kendaraan dinas sebesar Rp 250.000.000 secara tunai.',
    },
  ],
};

interface AiConsultantViewProps {
  onOpenSettings: () => void;
  onOpenSmartParser: () => void;
}

export const AiConsultantView: React.FC<AiConsultantViewProps> = ({ onOpenSettings, onOpenSmartParser }) => {
  const { settings, standard, accounts } = useAccounting();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Halo! Saya adalah **NarKuntansi AI CPA**, asisten akuntan publik digital Anda.

Saya siap membantu Anda dalam:
- 💡 **Membahas & Menyelesaikan Soal Kasus Akuntansi** dari sekolah, kuliah, atau bisnis.
- 📐 **Menyusun Jurnal Umum, Penyesuaian (AJP), & Penutup** yang seimbang 100% (Debit = Kredit).
- ⚖️ **Menerapkan Ketentuan Standar**: **${standard}** untuk *${settings.entityName || 'Perusahaan Anda'}*.
- 📊 **Perhitungan Depresiasi, Pajak, Rasio Keuangan, & Akad Syariah**.

Silakan ketik pertanyaan atau tempelkan soal cerita transaksi Anda di bawah!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: settings.aiModelPreference || 'gemini-2.5-flash',
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const hasApiKey = Boolean(settings.geminiApiKey?.trim());

  const handleSend = async (customPrompt?: string) => {
    const question = (customPrompt || inputQuestion).trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await askGeminiCpa({
        question,
        standard,
        coaList: accounts,
        apiKey: settings.geminiApiKey,
        model: settings.aiModelPreference,
      });

      if (res.answer) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: res.modelUsed || settings.aiModelPreference || 'gemini-2.5-flash',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Gagal memproses jawaban**: ${res.error || 'Periksa Kunci API Gemini Anda di menu Pengaturan.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Terjadi kesalahan: ${err?.message || 'Gagal menghubungi layanan AI.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Bersihkan riwayat percakapan konsultasi AI?')) {
      setMessages([
        {
          id: 'init-clean',
          sender: 'ai',
          text: `Riwayat percakapan telah dibersihkan. Silakan ajukan pertanyaan atau soal transaksi baru untuk standar **${standard}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const quickItems = QUICK_PROMPTS[standard] || QUICK_PROMPTS[AccountingStandard.PSAK];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-sm overflow-hidden font-editorial-sans">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-[#E6E0D6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1A1A1A] text-[#86EFAC] rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1A1A1A] font-editorial-serif">
                NarKuntansi AI CPA Consultant
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-[#1A1A1A] text-[#F9F8F6] rounded">
                {standard}
              </span>
            </div>
            <p className="text-xs text-[#5C5852]">
              Konsultan Akuntansi Publik Berbasis Google Gemini • Akurasi Standar Indonesia 100%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasApiKey ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gemini Key Terhubung ({settings.aiModelPreference || 'gemini-2.5-flash'})</span>
            </div>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border border-[#FCD34D] rounded-lg text-xs font-semibold transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Masukkan API Key Gemini</span>
            </button>
          )}

          <button
            onClick={onOpenSmartParser}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#2F2C28] rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Parser Soal Cerita</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-[#8C877E] hover:text-[#1A1A1A] hover:bg-[#EFECE5] rounded-lg transition-colors"
            title="Bersihkan Percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompt Bar */}
      <div className="px-5 py-2 bg-[#FAF9F6] border-b border-[#E6E0D6] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-[#8C877E] whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Topik Cepat:
        </span>
        {quickItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-full text-[#1A1A1A] text-xs font-medium transition-colors cursor-pointer"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FFFFFF]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-[#86EFAC] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-3xl rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1A1A1A] text-[#F9F8F6] font-editorial-sans'
                    : msg.error
                    ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
                    : 'bg-[#FAF9F6] border border-[#E6E0D6] text-[#1A1A1A]'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-black/10 dark:border-white/10 text-[11px] opacity-80">
                  <span className="font-semibold">
                    {isUser ? 'Pertanyaan Anda' : `NarKuntansi AI CPA (${msg.modelUsed || 'Gemini'})`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && !msg.error && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 hover:bg-black/5 rounded transition-colors"
                        title="Salin Jawaban"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Text with simple markdown formatting */}
                <div className="whitespace-pre-wrap font-editorial-sans leading-relaxed space-y-2">
                  {msg.text}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#5C5852] text-[#F9F8F6] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-[#86EFAC] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#FAF9F6] border border-[#E6E0D6] rounded-xl p-3 text-xs text-[#5C5852] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16A34A] animate-spin" />
              <span>NarKuntansi AI sedang menganalisis standar akuntansi dan menyusun solusi...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-[#FAF9F6] border-t border-[#E6E0D6]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Tanyakan soal akuntansi, rumus penyesuaian, jurnal penutup, atau kasus SAK..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-[#FFFFFF] border border-[#D3CBC0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-xs sm:text-sm text-[#1A1A1A]"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#F9F8F6] flex items-center gap-1.5 transition-all shadow-xs ${
              isLoading || !inputQuestion.trim()
                ? 'bg-[#D3CBC0] text-[#8C877E] cursor-not-allowed'
                : 'bg-[#1A1A1A] hover:bg-[#2F2C28]'
            }`}
          >
            <span>Kirim</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 text-[11px] text-[#8C877E]">
          <span>Mendukung seluruh siklus akuntansi Indonesia tanpa batasan jumlah token/pertanyaan.</span>
          <span className="hidden sm:inline">Tekan Enter untuk mengirim pertanyaan</span>
        </div>
      </div>
    </div>
  );
};
