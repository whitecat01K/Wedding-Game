import { QuizResultData } from '../types';

/**
 * 試算表公開發布 CSV 網址
 */
export const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSB20-PJlq-7QeOy-hPnejndkuHsqx1MgAEf0-2CbabdJRIthL9BID6CBNA3aPEKiBK3IT0Qor0-xu2/pub?output=csv';

/**
 * 輕量穩定的 CSV 解析器（支援包含換行或逗號的引號欄位）
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // 略過下一個引號
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * 從發布的 Google 試算表 CSV 即時抓取所有賓客成績紀錄
 * 試算表標題結構：
 * [時間戳記, 暱稱, 桌次, 得分, 答對題數, 花費時間, 吉祥物與備註]
 */
export async function fetchLeaderboardFromGoogleSheet(): Promise<QuizResultData[]> {
  try {
    // 加上時間戳記防瀏覽器快取，確保拿到當下最新試算表回覆
    const cacheBusterUrl = `${GOOGLE_SHEET_CSV_URL}&_t=${Date.now()}`;
    const res = await fetch(cacheBusterUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Google Sheet fetch returned status ${res.status}`);
    }

    const csvText = await res.text();
    const rows = parseCSV(csvText);

    if (rows.length <= 1) {
      return [];
    }

    // 第一列是標題列
    const headers = rows[0].map((h) => h.toLowerCase());
    
    // 動態偵測各欄位索引（相容性最高）
    let nameIdx = headers.findIndex((h) => h.includes('暱稱') || h.includes('稱謂') || h.includes('姓名'));
    let tableIdx = headers.findIndex((h) => h.includes('桌次') || h.includes('桌號'));
    let timeIdx = headers.findIndex((h) => h.includes('花費') || (h.includes('時間') && !h.includes('戳記')));
    let remarksIdx = headers.findIndex((h) => h.includes('備註') || h.includes('明細') || h.includes('提交') || h.includes('說明'));

    if (nameIdx === -1) nameIdx = 1;
    if (tableIdx === -1) tableIdx = 2;
    if (timeIdx === -1) timeIdx = 5;
    if (remarksIdx === -1) remarksIdx = 6;

    const results: QuizResultData[] = [];

    // 從第 2 列開始解析每一位賓客的資料
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length <= 2) continue;

      const playerName = (row[nameIdx] || '').trim();
      if (!playerName) continue;

      const tableNumber = (row[tableIdx] || '未指定桌次').trim();
      
      // 智慧判斷欄位 3 與 4 哪一個是總分、哪一個是答對題數
      // 在 Google 表單中，答對題數通常含有斜線 (如 "3 / 10" 或 "10 / 10 題")
      // 而總得分通常是較大的純整數數字 (如 5939, 17637, 19800)
      const colA = (row[3] || '').trim();
      const colB = (row[4] || '').trim();

      let finalScore = 0;
      let correctAnswersCount = 0;
      let totalQuestions = 10;

      if (colA.includes('/')) {
        const m = colA.match(/(\d+)\s*\/\s*(\d+)/);
        if (m) {
          correctAnswersCount = parseInt(m[1], 10);
          totalQuestions = parseInt(m[2], 10) || 10;
        }
        finalScore = parseInt(colB.replace(/[^0-9]/g, ''), 10) || 0;
      } else if (colB.includes('/')) {
        const m = colB.match(/(\d+)\s*\/\s*(\d+)/);
        if (m) {
          correctAnswersCount = parseInt(m[1], 10);
          totalQuestions = parseInt(m[2], 10) || 10;
        }
        finalScore = parseInt(colA.replace(/[^0-9]/g, ''), 10) || 0;
      } else {
        // 若皆無斜線，數字較大者為總分，較小者為題數
        const numA = parseInt(colA.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(colB.replace(/[^0-9]/g, ''), 10) || 0;
        if (numA > numB) {
          finalScore = numA;
          correctAnswersCount = numB;
        } else {
          finalScore = numB;
          correctAnswersCount = numA;
        }
      }

      // 提取耗時秒數 (例如 "35.2 秒" 或 "1.2")
      const timeStr = row[timeIdx] || '';
      const rawTime = timeStr.match(/(\d+(\.\d+)?)/);
      const totalTimeSeconds = rawTime ? parseFloat(rawTime[1]) : 0;

      // 提取吉祥物頭像與細部得分（從備註或預設）
      const remarks = (remarksIdx < row.length ? row[remarksIdx] : '') || '';
      let avatar = '👰🏻';
      const avatarMatch = remarks.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF])/);
      if (avatarMatch) {
        avatar = avatarMatch[1];
      }

      // 檢查 remarks 是否有明確紀錄「答對分: 3000, 速度分: 2939」
      const accMatch = remarks.match(/答對分:\s*(\d+)/);
      const spdMatch = remarks.match(/速度分:\s*(\d+)/);
      let accuracyScore = correctAnswersCount * 1000;
      let speedScore = Math.max(0, finalScore - accuracyScore);

      if (accMatch && spdMatch) {
        accuracyScore = parseInt(accMatch[1], 10);
        speedScore = parseInt(spdMatch[1], 10);
        // 若欄位計算出的 finalScore 與 remarks 略有出入，以加總為準
        if (finalScore === 0) {
          finalScore = accuracyScore + speedScore;
        }
      }

      const timestampStr = row[0] || '';

      results.push({
        id: `gsheet_${r}_${playerName}_${finalScore}_${totalTimeSeconds}`,
        playerName,
        playerAvatar: avatar,
        tableNumber,
        totalAccuracyScore: accuracyScore,
        totalSpeedScore: speedScore,
        finalScore,
        correctCount: correctAnswersCount,
        totalQuestions,
        totalTimeSpent: totalTimeSeconds,
        completedAt: timestampStr ? new Date(timestampStr).getTime() || Date.now() : Date.now(),
        answers: []
      });
    }

    // 依總分由高到低排序，若同分則耗時較短者優先
    results.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      return a.totalTimeSpent - b.totalTimeSpent;
    });

    return results;
  } catch (err) {
    console.warn('無法從 Google 試算表取得即時排行榜，將降級切換為本機/API 模式:', err);
    return [];
  }
}
