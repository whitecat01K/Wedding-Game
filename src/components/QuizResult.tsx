import React, { useEffect, useState } from 'react';
import { QuizResultData, Question } from '../types';
import { Trophy, Clock, CheckCircle2, XCircle, Sparkles, Lightbulb, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizResultProps {
  result: QuizResultData;
  questions: Question[];
  onOpenLeaderboard: () => void;
}

export function QuizResult({
  result,
  questions,
  onOpenLeaderboard
}: QuizResultProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Fire celebration confetti when reaching result
  useEffect(() => {
    const colors = ['#FF3366', '#FF6584', '#FFA000', '#FFD166', '#FFFFFF'];
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { x: 0.2, y: 0.5 },
        colors
      });
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { x: 0.8, y: 0.5 },
        colors
      });
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  // Title evaluation
  const getFeedbackBadge = () => {
    if (result.correctCount === 10) {
      return { title: '👑 滿分！新人天生一對神隊友！', color: 'from-amber-400 to-yellow-500 text-amber-950' };
    } else if (result.correctCount >= 8) {
      return { title: '💖 默契超群！新人的頭號摯友！', color: 'from-pink-500 to-rose-600 text-white' };
    } else if (result.correctCount >= 5) {
      return { title: '🥂 甜蜜同樂！非常懂新人的好朋友！', color: 'from-orange-400 to-amber-500 text-stone-900' };
    } else {
      return { title: '✨ 熱情滿分！感謝給予新人的滿滿祝福！', color: 'from-stone-700 to-stone-900 text-white' };
    }
  };

  const feedback = getFeedbackBadge();

  // Copy result text for sharing with friends at table
  const handleCopyResult = () => {
    const text = `💍 幸福快問快答！我代表【${result.tableNumber}】拿下 ${result.finalScore.toLocaleString()} 分（答對 ${result.correctCount}/${result.totalQuestions} 題，總耗時 ${result.totalTimeSpent} 秒）！大家快來挑戰！`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3.5 py-4 sm:py-7 space-y-5">
      {/* Hero Score Summary Card */}
      <div className="bg-white rounded-3xl p-4.5 sm:p-7 shadow-xl border-2 border-pink-200 text-center relative overflow-hidden">
        <div className="w-40 h-40 rounded-full bg-pink-100/50 blur-2xl absolute -top-10 -left-10 pointer-events-none" />
        <div className="w-40 h-40 rounded-full bg-amber-100/50 blur-2xl absolute -bottom-10 -right-10 pointer-events-none" />

        <div className="relative z-10">
          {/* Avatar and Name */}
          <div className="inline-block relative mb-1.5">
            <div className="text-5xl sm:text-6xl p-2.5 bg-pink-50 rounded-3xl border-2 border-pink-200 shadow-2xs">
              {result.playerAvatar}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-800 flex items-center justify-center gap-1.5 flex-wrap">
            <span>{result.playerName}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black">
              {result.tableNumber}
            </span>
          </h2>

          <div className={`inline-block px-3.5 py-1 rounded-full bg-gradient-to-r ${feedback.color} font-black text-xs mt-1.5 shadow-2xs`}>
            {feedback.title}
          </div>

          {/* Big Final Score */}
          <div className="my-4 py-3.5 px-4 bg-gradient-to-r from-pink-50/80 via-white to-amber-50/80 rounded-2xl border-2 border-pink-200 inline-block w-full max-w-sm mx-auto shadow-xs">
            <div className="text-[11px] font-black uppercase tracking-wider text-stone-500">
              最終累計總得分
            </div>
            <div className="text-4xl sm:text-5xl font-black text-[#FF3366] font-mono tracking-tight my-0.5">
              {result.finalScore.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-stone-600">
              答對 {result.correctCount} / {result.totalQuestions} 題 · 耗時 {result.totalTimeSpent} 秒
            </div>
          </div>

          {/* Two Score Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left mb-3">
            {/* Part 1: Accuracy */}
            <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 p-3 rounded-2xl border border-pink-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-xs font-black text-[#FF3366]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  第一項：答對分數
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {result.correctCount} / 10 題
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#FF3366] font-mono">
                +{result.totalAccuracyScore.toLocaleString()}{' '}
                <span className="text-xs font-bold text-stone-500">分</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                答對越多題，分數越高（每題 1,000 分）
              </div>
            </div>

            {/* Part 2: Speed */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-3 rounded-2xl border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-xs font-black text-[#FFA000]">
                  <Clock className="w-3.5 h-3.5 text-[#FFA000]" />
                  第二項：時間速度分數
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {result.totalTimeSpent} 秒
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#FFA000] font-mono">
                +{result.totalSpeedScore.toLocaleString()}{' '}
                <span className="text-xs font-bold text-stone-500">分</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                時間越短，分數越高（神速答題加成）
              </div>
            </div>
          </div>

          {/* Submission Notice (No replay button as requested) */}
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>成績已自動送出！已即時記錄於新人雲端戰績與【{result.tableNumber}】！</span>
          </div>

          {/* Action Buttons (NO "再玩一次" button as requested) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF3366] via-[#FF6584] to-[#FFA000] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-2 border-white/40"
            >
              <Trophy className="w-5 h-5 text-yellow-200" />
              <span>查看各桌紀錄與排行榜 👑</span>
            </button>

            <button
              onClick={handleCopyResult}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">已複製成績！</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>分享我的成績</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= DETAILED QUESTION REVIEW (每題答對或答錯選項回顧) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF3366]" />
              <span>十題答對與答錯詳細選項回顧</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              檢視每題的作答選擇與甜蜜秘密解說！
            </p>
          </div>

          <div className="text-xs font-black text-[#FF3366] bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-200 shrink-0">
            答對 {result.correctCount} / {result.totalQuestions} 題
          </div>
        </div>

        <div className="space-y-2.5">
          {result.answers.map((ans, idx) => {
            const questionData = questions[idx];
            const isCorrect = ans.isCorrect;
            const selectedText = ans.options[ans.selectedOptionIndex];
            const correctText = ans.options[ans.correctOptionIndex];

            return (
              <div
                key={ans.questionId || idx}
                className={`bg-white rounded-2xl p-4 shadow-2xs border-2 transition-all ${
                  isCorrect
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                }`}
              >
                {/* Header of review card */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-black">
                      第 {idx + 1} 題
                    </span>
                    {questionData?.category && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-pink-50 text-[#FF3366] text-[10px] font-bold border border-pink-200">
                        {questionData.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-stone-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {ans.timeSpent}s
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>答對</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>答錯</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h4 className="font-black text-stone-900 text-sm sm:text-base mb-2.5 leading-snug">
                  {ans.questionText}
                </h4>

                {/* Answers Breakdown */}
                <div className="space-y-1.5 text-xs">
                  {/* Your Answer */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                        : 'bg-rose-50/70 border-rose-200 text-rose-950 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0 font-black">
                        {isCorrect ? '✅ 你的選擇：' : '❌ 你的選擇：'}
                      </span>
                      <span className="truncate">{selectedText || '未作答'}</span>
                    </div>

                    <span className="shrink-0 text-[10px] font-mono font-black text-[#FF3366]">
                      {isCorrect ? `+${ans.totalScore.toLocaleString()}分` : '+0分'}
                    </span>
                  </div>

                  {/* Correct Answer Display if player was wrong */}
                  {!isCorrect && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-bold flex items-center gap-1.5">
                      <span className="shrink-0 font-black text-emerald-700">
                        💡 正確標準解答：
                      </span>
                      <span className="text-emerald-900 font-black truncate">{correctText}</span>
                    </div>
                  )}

                  {/* Sweet explanation */}
                  {ans.explanation && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-950 text-[11px] leading-relaxed flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#FFA000] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-900">甜蜜秘密：</strong>
                        {ans.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to Leaderboard */}
        <div className="pt-2 text-center">
          <button
            onClick={onOpenLeaderboard}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3366] via-[#FF6584] to-[#FFA000] text-white font-black text-base shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            查看各桌戰績與親友排行榜 👑
          </button>
        </div>
      </div>
    </div>
  );
}
