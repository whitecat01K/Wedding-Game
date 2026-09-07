import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizAnswerRecord } from '../types';
import { OPTION_THEMES } from '../data/defaultQuestions';
import { calculateQuestionScore } from '../utils/quizScoring';
import { Clock, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizPlayProps {
  questions: Question[];
  playerName: string;
  playerAvatar: string;
  tableNumber: string;
  onFinishQuiz: (records: QuizAnswerRecord[]) => void;
}

export function QuizPlay({
  questions,
  playerName,
  playerAvatar,
  tableNumber,
  onFinishQuiz
}: QuizPlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Time tracking
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Accumulated answers
  const answersRef = useRef<QuizAnswerRecord[]>([]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // Sound effect helpers
  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted
    }
  };

  // Start question timer
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setQuestionSeconds(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
      setQuestionSeconds(parseFloat(elapsed.toFixed(1)));
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentIndex]);

  // Handle Option Click
  const handleSelectOption = (index: number) => {
    if (isTransitioning) return;

    playClickSound();
    setSelectedIndex(index);
    setIsTransitioning(true);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const timeSpent = parseFloat(((Date.now() - questionStartTimeRef.current) / 1000).toFixed(2));
    const scoreResult = calculateQuestionScore(currentQuestion, index, timeSpent);

    const record: QuizAnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      options: currentQuestion.options,
      selectedOptionIndex: index,
      correctOptionIndex: currentQuestion.correctIndex,
      isCorrect: scoreResult.isCorrect,
      timeSpent,
      accuracyScore: scoreResult.accuracyScore,
      speedScore: scoreResult.speedScore,
      totalScore: scoreResult.totalScore,
      explanation: currentQuestion.explanation
    };

    answersRef.current.push(record);

    // 0.28s quick tactile confirmation, then immediately advance to next question
    setTimeout(() => {
      setSelectedIndex(null);
      setIsTransitioning(false);

      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onFinishQuiz(answersRef.current);
      }
    }, 280);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 py-2.5 sm:py-5 flex flex-col min-h-[calc(100vh-4.5rem)] justify-between">
      <div>
        {/* Mobile-optimized Header Bar */}
        <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 shadow-sm border border-pink-100 flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl shrink-0">{playerAvatar}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-stone-800 truncate">
                  {playerName}
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-pink-100 text-[#FF3366] text-[10px] font-black border border-pink-200 shrink-0">
                  {tableNumber}
                </span>
              </div>
              <span className="text-[9px] text-stone-400 font-bold block">
                挑戰中 · 答完自動下一題
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Timer */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-black">
              <Clock className="w-3 h-3 text-[#FFA000] animate-pulse" />
              <span>{questionSeconds.toFixed(1)}s</span>
            </div>

            {/* Question Counter */}
            <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#FFA000] text-white text-xs font-black shadow-xs">
              {currentIndex + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-pink-100 h-1.5 rounded-full overflow-hidden mb-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#FF3366] via-[#FF6584] to-[#FFA000] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-pink-100 mb-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#FF3366] text-[10px] sm:text-xs font-black border border-pink-200">
                {currentQuestion.category || '甜蜜考驗'}
              </span>

              <div className="flex items-center gap-1 text-[10px] font-bold text-[#FFA000]">
                <Zap className="w-3 h-3 fill-[#FFA000]" />
                <span>答越快加分越高！</span>
              </div>
            </div>

            <h2 className="text-base sm:text-xl font-black text-stone-900 leading-snug tracking-tight">
              {currentQuestion.question}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* 4 Options (Clean, large mobile touch buttons) */}
        <div className="space-y-2.5 sm:space-y-3">
          {currentQuestion.options.map((optionText, optIdx) => {
            const theme = OPTION_THEMES[optIdx] || OPTION_THEMES[0];
            const isSelected = selectedIndex === optIdx;

            return (
              <motion.button
                key={optIdx}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectOption(optIdx)}
                disabled={isTransitioning}
                className={`relative w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3 shadow-sm cursor-pointer min-h-[56px] select-none ${
                  isSelected
                    ? 'ring-3 ring-offset-1 ring-[#FF3366] scale-[1.01] ' + theme.bgClass
                    : `${theme.bgClass} hover:brightness-105 active:scale-[0.98]`
                } ${theme.borderClass}`}
              >
                {/* Symbol icon badge */}
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black text-base shrink-0 border border-white/30">
                  {theme.symbol}
                </div>

                {/* Option text */}
                <span className="text-sm sm:text-base font-black text-white leading-snug flex-1 drop-shadow-xs">
                  {optionText}
                </span>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-white text-[#FF3366] flex items-center justify-center font-black shrink-0 animate-in zoom-in-75">
                    <CheckCircle2 className="w-4 h-4 fill-current text-white bg-[#FF3366] rounded-full" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center py-2.5 text-[10px] text-stone-400 font-bold">
        點選後立即換題 · 共 {totalQuestions} 題
      </div>
    </div>
  );
}
