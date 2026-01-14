
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Wings - Detailed feather style */}
          <g fill="#1b4fd9">
            <path d="M45 50 C 35 30, 10 35, 5 60 C 15 55, 30 55, 45 50" />
            <path d="M45 55 C 30 45, 15 50, 10 70 C 20 65, 35 65, 45 55" />
            <path d="M45 60 C 35 55, 25 60, 20 80 C 30 75, 40 75, 45 60" />
            
            <path d="M55 50 C 65 30, 90 35, 95 60 C 85 55, 70 55, 55 50" />
            <path d="M55 55 C 70 45, 85 50, 90 70 C 80 65, 65 65, 55 55" />
            <path d="M55 60 C 65 55, 75 60, 80 80 C 70 75, 60 75, 55 60" />
          </g>
          
          {/* Shield - Sharp classic shape */}
          <path d="M50 15 L82 30 L82 45 C 82 75, 50 90, 50 90 C 50 90, 18 75, 18 45 L18 30 Z" fill="#d91b1b" stroke="#8a1111" strokeWidth="1" />
          
          {/* "Vision" Text on Shield */}
          <text x="50" y="52" textAnchor="middle" fill="white" fontSize="13" fontWeight="600" fontFamily="serif" letterSpacing="0.5">Vision</text>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tight" style={{ color: '#d91b1b' }}>
            Aviation Academy
          </span>
          <span className="text-[10px] font-bold tracking-[0.3em] text-blue-600 mt-1 uppercase">
            Wings to fly
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
