import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface BalanceIndicatorProps {
  isBalanced: boolean;
  difference?: number;
  totalDebit?: number;
  totalCredit?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BalanceIndicator: React.FC<BalanceIndicatorProps> = ({
  isBalanced,
  difference = 0,
  totalDebit,
  totalCredit,
  label = 'Neraca Saldo',
  size = 'md',
}) => {
  if (size === 'sm') {
    return isBalanced ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] font-editorial-sans">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
        {label}: Seimbang (Balance)
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] font-editorial-sans">
        <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
        {label}: Selisih {formatRupiah(difference)}
      </span>
    );
  }

  return (
    <div
      className={`rounded-xl p-4.5 border transition-all ${
        isBalanced
          ? 'bg-[#FFFFFF] border-[#D3CBC0] text-[#1A1A1A] shadow-xs'
          : 'bg-[#FEF2F2]/60 border-[#FECACA] text-[#7F1D1D] shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              isBalanced
                ? 'bg-[#166534] text-[#F9F8F6] border-[#14532D]'
                : 'bg-[#991B1B] text-[#F9F8F6] border-[#7F1D1D]'
            }`}
          >
            {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-base font-editorial-serif flex items-center gap-2">
              <span className="font-semibold text-[#5C5852]">{label}:</span>
              <span className={`font-bold tracking-tight ${isBalanced ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                {isBalanced ? 'SEIMBANG ✓ (BALANCE)' : 'TIDAK SEIMBANG ✗'}
              </span>
            </div>
            <p className="text-xs text-[#5C5852] mt-0.5 font-editorial-sans">
              {isBalanced
                ? 'Total Debit dan Kredit berpasangan secara akurat dan seimbang. Siklus siap dilanjutkan.'
                : `Terdapat selisih matematis sebesar ${formatRupiah(difference)}. Harap telaah kembali entri pembukuan.`}
            </p>
          </div>
        </div>

        {totalDebit !== undefined && totalCredit !== undefined && (
          <div className="flex items-center gap-4 text-xs bg-[#F9F8F6] py-2 px-3.5 rounded-lg border border-[#E6E0D6] shadow-2xs">
            <div>
              <span className="text-[#8C877E] block text-[10px] uppercase font-bold tracking-wider">Total Debit</span>
              <span className="font-bold text-[#1A1A1A] font-editorial-mono">{formatRupiah(totalDebit)}</span>
            </div>
            <div className="h-6 w-px bg-[#D3CBC0]" />
            <div>
              <span className="text-[#8C877E] block text-[10px] uppercase font-bold tracking-wider">Total Kredit</span>
              <span className="font-bold text-[#1A1A1A] font-editorial-mono">{formatRupiah(totalCredit)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

