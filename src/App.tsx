import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuizAnswerRecord, QuizResultData } from './types';
import { loadSavedQuestions } from './utils/sync';
import {
  getLocalLeaderboard,
  fetchRemoteLeaderboard,
  submitQuizResultToServer
} from './utils/quizScoring';
import { submitToGoogleForm } from './utils/googleFormSync';
import { Navbar } from './components/Navbar';
import { QuizWelcome } from './components/QuizWelcome';
import { QuizPlay } from './components/QuizPlay';
import { QuizResult } from './components/QuizResult';
import { LeaderboardModal } from './components/LeaderboardModal';

export default function App() {
  // Questions list (the official 10 wedding quiz questions)
  const [questions] = useState<Question[]>(() => {
    return loadSavedQuestions();
  });

  // Game Flow: 'welcome' | 'playing' | 'result'
  const [phase, setPhase] = useState<'welcome' | 'playing' | 'result'>('welcome');

  // Player info
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('👰🏻');
  const [tableNumber, setTableNumber] = useState<string>('主桌 👑');

  // Completed result
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<QuizResultData[]>(() => getLocalLeaderboard());

  // Modal
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Fetch latest leaderboard from server on mount
  useEffect(() => {
    fetchRemoteLeaderboard().then((data) => {
      if (data) {
        setLeaderboard(data);
      }
    });
  }, []);

  // Manual or timer-based refresh for leaderboard with equality check to prevent visual jitter
  const refreshLeaderboard = useCallback(async () => {
    try {
      const data = await fetchRemoteLeaderboard();
      if (data) {
        setLeaderboard((prev) => {
          if (
            prev.length === data.length &&
            prev.every(
              (p, idx) =>
                p.playerName === data[idx].playerName &&
                p.finalScore === data[idx].finalScore &&
                p.tableNumber === data[idx].tableNumber
            )
          ) {
            return prev; // Same data, keep existing reference so no re-render or jumping!
          }
          return data;
        });
      }
    } catch (err) {
      console.warn('Refresh leaderboard error:', err);
    }
  }, []);

  // Start game from Welcome screen
  const handleStartQuiz = (name: string, avatar: string, table: string) => {
    setPlayerName(name);
    setPlayerAvatar(avatar);
    setTableNumber(table);
    setPhase('playing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Finish game and calculate final score
  const handleFinishQuiz = async (records: QuizAnswerRecord[]) => {
    const totalAccuracyScore = records.reduce((sum, r) => sum + r.accuracyScore, 0);
    const totalSpeedScore = records.reduce((sum, r) => sum + r.speedScore, 0);
    const finalScore = totalAccuracyScore + totalSpeedScore;
    const totalTimeSpent = Number(records.reduce((sum, r) => sum + r.timeSpent, 0).toFixed(1));
    const correctCount = records.filter(r => r.isCorrect).length;

    const result: QuizResultData = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      playerName,
      playerAvatar,
      tableNumber,
      totalAccuracyScore,
      totalSpeedScore,
      finalScore,
      totalTimeSpent,
      correctCount,
      totalQuestions: questions.length,
      answers: records,
      completedAt: Date.now()
    };

    setQuizResult(result);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. Submit to Google Form / Google Sheets (runs silently in background)
    submitToGoogleForm(result);

    // 2. Submit to shared server & update local state
    const updatedLeaderboard = await submitQuizResultToServer(result);
    setLeaderboard(updatedLeaderboard);
  };

  // Reset to Welcome
  const handleRestart = () => {
    setPhase('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-stone-800 flex flex-col font-sans selection:bg-[#FF3366] selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenLeaderboard={() => {
          refreshLeaderboard();
          setIsLeaderboardOpen(true);
        }}
        onRestart={handleRestart}
      />

      {/* Main Game Stage */}
      <main className="flex-1">
        {phase === 'welcome' && (
          <QuizWelcome
            onStart={handleStartQuiz}
            totalQuestions={questions.length}
            onOpenLeaderboard={() => {
              refreshLeaderboard();
              setIsLeaderboardOpen(true);
            }}
          />
        )}

        {phase === 'playing' && (
          <QuizPlay
            questions={questions}
            playerName={playerName}
            playerAvatar={playerAvatar}
            tableNumber={tableNumber}
            onFinishQuiz={handleFinishQuiz}
          />
        )}

        {phase === 'result' && quizResult && (
          <QuizResult
            result={quizResult}
            questions={questions}
            onOpenLeaderboard={() => {
              refreshLeaderboard();
              setIsLeaderboardOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
        onRefresh={refreshLeaderboard}
        currentResultId={quizResult?.id}
      />
    </div>
  );
}
