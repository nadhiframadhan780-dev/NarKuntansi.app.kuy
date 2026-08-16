import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-[#1A1A1A]',
}) => {
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
        className="relative flex-shrink-0 flex items-center justify-center rounded-lg bg-[#1A1A1A] text-[#F9F8F6] shadow-sm border border-[#38342E]"
      >
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
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-editorial-serif tracking-tight leading-none text-xl font-bold ${textColor}`}>
            <span>Nar</span>
            <span className="italic font-normal text-[#5C5852] ml-0.5">Kuntansi</span>
          </span>
          <span className="text-[10px] tracking-widest uppercase font-medium text-[#8C877E] mt-1 font-editorial-sans">
            Multi-Standard Accounting
          </span>
        </div>
      )}
    </div>
  );
};

