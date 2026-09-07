export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  timeLimit: number; // in seconds (e.g. 15 or 20)
  points: number; // default 1000
  category?: string;
  explanation?: string;
}

export interface QuizAnswerRecord {
  questionId: string;
  questionText: string;
  options: [string, string, string, string];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds with 2 decimals
  accuracyScore: number; // 答對分數
  speedScore: number; // 時間長短分數
  totalScore: number; // 該題總分
  explanation?: string;
}

export interface QuizResultData {
  id: string;
  playerName: string;
  playerAvatar: string;
  tableNumber: string; // 所在桌號 (例如: "第 1 桌", "主桌 👑")
  totalAccuracyScore: number;
  totalSpeedScore: number;
  finalScore: number;
  totalTimeSpent: number; // in seconds
  correctCount: number;
  totalQuestions: number;
  answers: QuizAnswerRecord[];
  completedAt: number;
}

export interface TableLeaderboardGroup {
  tableName: string;
  memberCount: number;
  highestScore: number;
  topPlayerName: string;
  topPlayerAvatar: string;
  averageScore: number;
  members: QuizResultData[]; // sorted by finalScore desc
}

export interface OptionTheme {
  id: number;
  symbol: string;
  name: string;
  colorName: string;
  bgClass: string;
  borderClass: string;
  hoverClass: string;
  textClass: string;
  ringClass: string;
  activeClass: string;
}
