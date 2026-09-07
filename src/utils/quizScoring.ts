import { QuizAnswerRecord, Question, QuizResultData, TableLeaderboardGroup } from '../types';
import { fetchLeaderboardFromGoogleSheet } from './googleSheetLeaderboard';

/**
 * 婚禮桌次（主桌、第 2 桌、第 3 桌、第 4 桌、第 5 桌、第 6 桌）
 */
export const WEDDING_TABLES = [
  '主桌 👑',
  '第 2 桌',
  '第 3 桌',
  '第 4 桌',
  '第 5 桌',
  '第 6 桌'
] as const;

/**
 * 計算單題得分
 * @param question 題目
 * @param selectedIndex 親友選擇的選項 (0-3)
 * @param timeSpentSeconds 該題耗時（秒，保留兩位小數）
 */
export function calculateQuestionScore(
  question: Question,
  selectedIndex: number,
  timeSpentSeconds: number
): {
  isCorrect: boolean;
  accuracyScore: number;
  speedScore: number;
  totalScore: number;
} {
  const isCorrect = selectedIndex === question.correctIndex;

  if (!isCorrect) {
    return {
      isCorrect: false,
      accuracyScore: 0,
      speedScore: 0,
      totalScore: 0
    };
  }

  // 1. 答對分數：每答對一題給予 1,000 分
  const accuracyScore = 1000;

  // 2. 時間長短分數：時間越短分數越高！以 15 秒為基準，答題越快獲得越高速度分 (最高 1,000 分)
  const timeLimit = Math.max(10, question.timeLimit || 15);
  const ratio = Math.max(0, Math.min(1, timeSpentSeconds / timeLimit));
  const speedScore = Math.max(100, Math.round((1 - ratio) * 1000));

  return {
    isCorrect: true,
    accuracyScore,
    speedScore,
    totalScore: accuracyScore + speedScore
  };
}

const LEADERBOARD_KEY = 'wedding_quiz_leaderboard_records_clean_v1';

// 初始戰績清空（待現場賓客連線作答）
export const INITIAL_LEADERBOARD: QuizResultData[] = [];

// 從本機 localStorage 取得暫存排行榜
export function getLocalLeaderboard(): QuizResultData[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.finalScore - a.finalScore);
    }
  } catch (e) {
    console.error('Failed to load local leaderboard', e);
  }
  return [];
}

// 異步取得全場即時排行榜（優先直連 Google 試算表即時連線，不依賴特定伺服器）
export async function fetchRemoteLeaderboard(): Promise<QuizResultData[]> {
  // 1. 優先從 Google 試算表即時同步最新全場戰況（以 Google 試算表為唯一權威來源）
  try {
    const sheetResults = await fetchLeaderboardFromGoogleSheet();
    // 只要成功連線 Google 試算表，無論有無資料（包含已刪除清空成 0 筆），都以試算表最新現況為準
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sheetResults));
    return sheetResults;
  } catch (sheetErr) {
    console.warn('Google Sheet sync failed, fallback to local/API', sheetErr);
  }

  // 2. 備援：若處於全端伺服器環境則嘗試呼叫 /api/leaderboard
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.leaderboard)) {
        const sorted = data.leaderboard.sort(
          (a: QuizResultData, b: QuizResultData) => b.finalScore - a.finalScore
        );
        return sorted;
      }
    }
  } catch (e) {
    // 忽略 API 備援失敗
  }

  // 3. 降級使用本機暫存
  return getLocalLeaderboard();
}

// 儲存賓客成績到後端伺服器與本機
export async function submitQuizResultToServer(
  result: QuizResultData
): Promise<QuizResultData[]> {
  // 1. 本機備份
  try {
    const current = getLocalLeaderboard();
    const updated = [result, ...current.filter((r) => r.id !== result.id)].sort(
      (a, b) => b.finalScore - a.finalScore
    );
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save result locally', e);
  }

  // 2. 送出至共享後端伺服器
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    if (res.ok) {
      return await fetchRemoteLeaderboard();
    }
  } catch (e) {
    console.warn('Failed to POST result to server, using local data', e);
  }

  return getLocalLeaderboard();
}

// 清空排行榜（供新人婚禮開始前一鍵重設）
export async function clearAllLeaderboard(): Promise<void> {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
    await fetch('/api/leaderboard', { method: 'DELETE' });
  } catch (e) {
    console.error('Failed to clear leaderboard', e);
  }
}

/**
 * 依照桌次分組紀錄各桌成績（不分冠軍桌，僅紀錄各桌人員與分數）
 * @param records 所有參賽親友的成績紀錄
 * @param sortBy 排序方式: 'table' (依主桌至第6桌順序) 或 'score' (依該桌最高分)
 */
export function groupLeaderboardByTable(
  records: QuizResultData[],
  sortBy: 'table' | 'score' = 'table'
): TableLeaderboardGroup[] {
  const tableMap = new Map<string, QuizResultData[]>();

  records.forEach((record) => {
    const tableName = (record.tableNumber || '未指定桌次').trim();
    if (!tableMap.has(tableName)) {
      tableMap.set(tableName, []);
    }
    tableMap.get(tableName)!.push(record);
  });

  const groups: TableLeaderboardGroup[] = [];

  tableMap.forEach((members, tableName) => {
    const sortedMembers = [...members].sort((a, b) => b.finalScore - a.finalScore);
    const topMember = sortedMembers[0];
    const totalScore = sortedMembers.reduce((sum, m) => sum + m.finalScore, 0);
    const averageScore = Math.round(totalScore / sortedMembers.length);

    groups.push({
      tableName,
      memberCount: sortedMembers.length,
      highestScore: topMember.finalScore,
      topPlayerName: topMember.playerName,
      topPlayerAvatar: topMember.playerAvatar,
      averageScore,
      members: sortedMembers
    });
  });

  // 排序：主桌 -> 第 2 桌 -> 第 3 桌 -> 第 4 桌 -> 第 5 桌 -> 第 6 桌
  const getTableOrderIndex = (name: string) => {
    if (name.includes('主桌')) return 0;
    if (name.includes('2')) return 1;
    if (name.includes('3')) return 2;
    if (name.includes('4')) return 3;
    if (name.includes('5')) return 4;
    if (name.includes('6')) return 5;
    if (name.includes('1')) return 98; // 舊測試資料保留在最後
    return 99;
  };

  return groups.sort((a, b) => {
    if (sortBy === 'score') {
      return b.highestScore - a.highestScore;
    }
    // 依桌次順序排列: 主桌 -> 第 1 桌 -> 第 2 桌 ...
    return getTableOrderIndex(a.tableName) - getTableOrderIndex(b.tableName);
  });
}
