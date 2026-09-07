import { QuizResultData } from '../types';

/**
 * Google 表單設定 (自動將婚禮遊戲成績儲存至 Google 試算表)
 * 表單網址: https://docs.google.com/forms/d/e/1FAIpQLScqD6ZUW9bP4yuPIf-McLLdIKaq-pEnYjFbZYlwM42Mr0sLLg/viewform
 * 提交目標: .../formResponse
 */
const GOOGLE_FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScqD6ZUW9bP4yuPIf-McLLdIKaq-pEnYjFbZYlwM42Mr0sLLg/formResponse';

// 表單中的 6 個欄位 entry ID
export const GOOGLE_FORM_ENTRIES = {
  // 1. 賓客稱謂 / 暱稱 (例如 111)
  NAME: 'entry.1514838001',
  // 2. 所在桌次 (例如 22233)
  TABLE: 'entry.651836650',
  // 3. 最終總得分 (例如 333)
  FINAL_SCORE: 'entry.1145424728',
  // 4. 答對題數 (例如 444)
  CORRECT_COUNT: 'entry.1294760030',
  // 5. 總答題耗時 (秒) (例如 555)
  TIME_SPENT: 'entry.937174221',
  // 6. 吉祥物代表 / 答題明細 / 提交時間備註 (例如 666)
  REMARKS: 'entry.302665884'
} as const;

// 防止重複發送的快取快顯
const submittedCache = new Set<string>();

/**
 * 靜默背景提交賓客成績至 Google 表單 (Google Sheets)
 * 即使賓客未登入 Google 或在無痕模式，以 no-cors 模式發送均能成功記錄且不跳頁。
 */
export async function submitToGoogleForm(result: QuizResultData): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    
    // 欄位 1: 暱稱
    formData.append(GOOGLE_FORM_ENTRIES.NAME, result.playerName || '神秘嘉賓');
    
    // 欄位 2: 桌次
    formData.append(GOOGLE_FORM_ENTRIES.TABLE, result.tableNumber || '未指定桌次');
    
    // 欄位 3: 總分 (數字格式)
    formData.append(GOOGLE_FORM_ENTRIES.FINAL_SCORE, String(result.finalScore));
    
    // 欄位 4: 答對題數 (如: 8 / 10 題)
    formData.append(
      GOOGLE_FORM_ENTRIES.CORRECT_COUNT,
      `${result.correctCount} / ${result.totalQuestions}`
    );
    
    // 欄位 5: 總耗時 (秒)
    formData.append(GOOGLE_FORM_ENTRIES.TIME_SPENT, `${result.totalTimeSpent} 秒`);
    
    // 欄位 6: 詳細摘要 (頭像吉祥物 + 分數組成 + 提交時間)
    const accuracyScoreStr = `答對分: ${result.totalAccuracyScore}`;
    const speedScoreStr = `速度分: ${result.totalSpeedScore}`;
    const dateStr = new Date(result.completedAt || Date.now()).toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const details = `${result.playerAvatar} ${result.playerName} (${accuracyScoreStr}, ${speedScoreStr}) [${dateStr}]`;
    formData.append(GOOGLE_FORM_ENTRIES.REMARKS, details);

    // 紀錄最近送出過的玩家與時間戳記，防止 React 嚴格模式或重複觸發導致重複寫入
    const submissionKey = `${result.playerName}_${result.tableNumber}_${result.finalScore}`;
    if (submittedCache.has(submissionKey)) {
      console.log('⚡ 該筆成績已在稍早送出，略過重複請求:', submissionKey);
      return true;
    }
    submittedCache.add(submissionKey);

    // 優先使用隱藏 iframe 表單提交（單一通道乾淨送出，不重複）
    if (typeof document !== 'undefined') {
      try {
        const iframeName = 'gform_sink_' + Date.now();
        let iframe = document.getElementById(iframeName) as HTMLIFrameElement;
        if (!iframe) {
          iframe = document.createElement('iframe');
          iframe.name = iframeName;
          iframe.id = iframeName;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_FORM_ACTION_URL;
        form.target = iframeName;
        form.style.display = 'none';

        const addField = (name: string, value: string) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };

        addField(GOOGLE_FORM_ENTRIES.NAME, result.playerName || '神秘嘉賓');
        addField(GOOGLE_FORM_ENTRIES.TABLE, result.tableNumber || '未指定桌次');
        addField(GOOGLE_FORM_ENTRIES.FINAL_SCORE, String(result.finalScore));
        addField(GOOGLE_FORM_ENTRIES.CORRECT_COUNT, `${result.correctCount} / ${result.totalQuestions}`);
        addField(GOOGLE_FORM_ENTRIES.TIME_SPENT, `${result.totalTimeSpent} 秒`);
        addField(GOOGLE_FORM_ENTRIES.REMARKS, details);

        document.body.appendChild(form);
        form.submit();

        // 提交後清理 DOM
        setTimeout(() => {
          form.remove();
          iframe.remove();
        }, 3000);

        console.log('✅ 成功送出至 Google 表單/試算表 (單次無重複):', result.playerName, result.finalScore);
        return true;
      } catch (domErr) {
        console.warn('iframe 提交失敗，轉為 fetch 備援:', domErr);
      }
    }

    // 備援方案（若非瀏覽器 DOM 環境時才走 fetch）
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('✅ 成功送出至 Google 表單 (fetch 備援):', result.playerName, result.finalScore);
    return true;
  } catch (error) {
    console.warn('⚠️ 送出至 Google 表單時發生例外 (已降級處理):', error);
    return false;
  }
}
