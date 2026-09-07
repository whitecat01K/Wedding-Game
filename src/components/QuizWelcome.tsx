import React, { useState } from 'react';
import { FUN_AVATARS } from '../questions';
import { WEDDING_TABLES } from '../utils/quizScoring';
import { Heart, Sparkles, Clock, CheckCircle2, Trophy, ArrowRight, User, MapPin } from 'lucide-react';

interface QuizWelcomeProps {
  onStart: (playerName: string, playerAvatar: string, tableNumber: string) => void;
  totalQuestions: number;
  onOpenLeaderboard: () => void;
}

export function QuizWelcome({
  onStart,
  totalQuestions,
  onOpenLeaderboard
}: QuizWelcomeProps) {
  const [name, setName] = useState('');
  const [table, setTable] = useState<string>('主桌 👑');
  const [selectedAvatar, setSelectedAvatar] = useState('👰🏻');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanTable = table.trim();

    if (!cleanName) {
      setError('請輸入您的暱稱或稱謂（例如：伴娘小晴、阿豪）');
      return;
    }

    if (!cleanTable) {
      setError('請點選您所在的桌次');
      return;
    }

    setError('');
    onStart(cleanName, selectedAvatar, cleanTable);
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-3 sm:py-6">
      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4.5 sm:p-6 shadow-xl border-2 border-pink-200 text-stone-800">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-100 border border-pink-200 text-[#FF3366] text-[11px] font-black mb-1.5 shadow-2xs">
            <Heart className="w-3 h-3 fill-[#FF3366]" />
            <span>婚禮專屬 · 全場手機連線挑戰</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
            💍 幸福快問快答
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            十題甜蜜考驗 · 看看誰最懂新郎新娘！
          </p>
        </div>

        {/* Compact Scoring Explanation */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-gradient-to-r from-pink-50 via-rose-50/50 to-amber-50 p-2.5 rounded-2xl border border-pink-100/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF3366] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-black text-stone-800 text-[11px]">① 答對分數</div>
              <div className="text-[10px] text-stone-500 leading-tight">每題 1,000 分</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFA000] text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-black text-stone-800 text-[11px]">② 時間分數</div>
              <div className="text-[10px] text-stone-500 leading-tight">越快答分數越高</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. 桌次選擇（主桌、第 2 桌、第 3 桌、第 4 桌、第 5 桌、第 6 桌） */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-stone-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF3366]" />
                <span>請點選您所在的桌次（主桌、第 2 ～ 6 桌）</span>
              </label>
              <span className="text-[10px] text-[#FF3366] font-bold">
                * 點選快速綁定
              </span>
            </div>

            {/* 6 桌觸控按鈕群組 (3x2 整齊排列) */}
            <div className="grid grid-cols-3 gap-2">
              {WEDDING_TABLES.map((t) => {
                const isSelected = table === t;
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setTable(t);
                      if (error) setError('');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center text-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FF3366] to-[#FFA000] text-white shadow-sm ring-2 ring-pink-300 scale-[1.02]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 active:scale-95'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Name Input */}
          <div>
            <label className="block text-xs font-black text-stone-800 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#FF3366]" />
              <span>您的暱稱 / 稱謂</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="例如：伴娘小晴、阿豪、表妹"
                className="w-full px-3.5 py-2.5 pl-10 rounded-2xl bg-pink-50/40 border-2 border-pink-200 focus:border-[#FF3366] focus:bg-white focus:outline-none font-bold text-base text-stone-900 transition-colors placeholder:text-stone-400 placeholder:text-xs"
                maxLength={15}
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* 3. Mascot Avatar Selector */}
          <div>
            <label className="block text-xs font-black text-stone-800 mb-1">
              挑選您的代表吉祥物
            </label>
            <div className="grid grid-cols-8 gap-1.5 bg-pink-50/30 p-2 rounded-2xl border border-pink-200">
              {FUN_AVATARS.slice(0, 16).map((avatar) => (
                <button
                  type="button"
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    selectedAvatar === avatar
                      ? 'bg-gradient-to-br from-yellow-300 to-amber-400 scale-110 shadow-xs ring-2 ring-[#FF3366]'
                      : 'hover:bg-white active:scale-95'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2 rounded-xl bg-pink-50 border border-pink-200 text-[#FF3366] text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Start CTA Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3366] via-[#FF6584] to-[#FFA000] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-2 border-white/40 mt-1"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>開始挑戰（共 {totalQuestions} 題）</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Links Footer: 只保留排行榜按鈕，不顯示計分規則說明 */}
        <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-center text-xs font-bold text-stone-600">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 hover:text-[#FF3366] transition-colors py-1 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-[#FFA000]" />
            <span>查看現場親友排行榜 👑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
