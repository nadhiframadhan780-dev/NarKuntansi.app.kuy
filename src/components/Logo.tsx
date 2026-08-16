import React from 'react';
import { useAccounting } from '../context/AccountingContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  customSrc?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-[#1A1A1A]',
  customSrc,
}) => {
  const { settings } = useAccounting();
  const logoSource = customSrc || settings?.customLogoUrl;

  const sizePixels = {
    sm: 32,
    md: 42,
    lg: 52,
    xl: 68,
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div
        style={{ width: sizePixels, height: sizePixels }}
        className="relative flex-shrink-0 flex items-center justify-center rounded-lg bg-[#1A1A1A] text-[#F9F8F6] shadow-sm border border-[#38342E] overflow-hidden"
      >
        {logoSource ? (
          <img
            src={logoSource}
            alt="Logo Perusahaan"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain p-1 rounded-lg bg-white"
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5"
          >
            {/* Classical Editorial Monogram / Crest */}
            <rect x="8" y="8" width="84" height="84" rx="4" stroke="#E6E0D6" strokeWidth="2" strokeDasharray="4 2" />
            <path
              d="M26 72V28H38L62 60V28H74V72H62L38 40V72H26Z"
              fill="#F9F8F6"
            />
            {/* Editorial Double Rule Accent */}
            <line x1="22" y1="80" x2="78" y2="80" stroke="#D3CBC0" strokeWidth="1.5" />
            <line x1="26" y1="83" x2="74" y2="83" stroke="#D3CBC0" strokeWidth="1" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-editorial-serif font-bold text-xl sm:text-2xl tracking-tight leading-none ${textColor}`}>
              NarKuntansi
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#E6E0D6] text-[#4A453E] border border-[#D3CBC0] font-editorial-mono">
              EDISI INDONESIA
            </span>
          </div>
          <span className="text-[11px] text-[#7A756D] font-medium tracking-wide">
            Sistem Akuntansi Multi-Standar & Kertas Kerja
          </span>
        </div>
      )}
    </div>
  );
};
