import React from 'react';
import { Trophy } from 'lucide-react';
import { playClick } from '../utils/audio';

interface NavbarProps {
  onOpenLeaderboard: () => void;
  onRestart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLeaderboard,
  onRestart
}) => {
  return (
    <header className="bg-gradient-to-r from-[#FF3366] via-[#FF6584] to-[#FFA000] text-white border-b-2 border-white/20 sticky top-0 z-40 shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-15 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          onClick={onRestart}
          className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm transform -rotate-3 border border-white/40">
            <span className="text-base sm:text-lg">💍</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight text-white drop-shadow-xs">
                幸福快問快答
              </h1>
              <span className="px-2 py-0.2 text-[10px] font-black rounded-full bg-white/25 text-white border border-white/30">
                10題闖關
              </span>
            </div>
            <p className="text-[10px] text-pink-100 hidden sm:block">
              婚禮賓客專屬連結 · 答對越多、耗時越短分數越高！
            </p>
          </div>
        </button>

        {/* Action buttons: 只留下排行榜可以按 */}
        <div className="flex items-center">
          <button
            onClick={() => {
              playClick();
              onOpenLeaderboard();
            }}
            title="現場親友排行榜"
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/25 hover:bg-white/35 active:scale-95 text-white text-xs sm:text-sm font-black transition-all border border-white/40 shadow-sm cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-200" />
            <span>排行榜 👑</span>
          </button>
        </div>
      </div>
    </header>
  );
};
