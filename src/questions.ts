import { Question, OptionTheme } from './types';

export const OPTION_THEMES: OptionTheme[] = [
  {
    id: 0,
    symbol: '▲',
    name: '甜心粉紅',
    colorName: '粉紅',
    bgClass: 'bg-[#FF3366] active:bg-[#E61E53] text-white shadow-rose-900/20',
    borderClass: 'border-pink-200',
    hoverClass: 'hover:bg-[#FF4D7A]',
    textClass: 'text-[#FF3366]',
    ringClass: 'ring-[#FF3366]',
    activeClass: 'bg-[#FF3366]'
  },
  {
    id: 1,
    symbol: '◆',
    name: '蜜桃粉橘',
    colorName: '蜜桃',
    bgClass: 'bg-[#FF6584] active:bg-[#ED4A6C] text-white shadow-pink-900/20',
    borderClass: 'border-rose-200',
    hoverClass: 'hover:bg-[#FF7D98]',
    textClass: 'text-[#FF6584]',
    ringClass: 'ring-[#FF6584]',
    activeClass: 'bg-[#FF6584]'
  },
  {
    id: 2,
    symbol: '●',
    name: '璀璨金黃',
    colorName: '金黃',
    bgClass: 'bg-[#F59E0B] active:bg-[#D97706] text-white shadow-amber-900/20',
    borderClass: 'border-amber-200',
    hoverClass: 'hover:bg-[#FBBF24]',
    textClass: 'text-[#F59E0B]',
    ringClass: 'ring-[#F59E0B]',
    activeClass: 'bg-[#F59E0B]'
  },
  {
    id: 3,
    symbol: '■',
    name: '活力暖橘',
    colorName: '暖橘',
    bgClass: 'bg-[#FF7A00] active:bg-[#E66A00] text-white shadow-orange-900/20',
    borderClass: 'border-orange-200',
    hoverClass: 'hover:bg-[#FF8D24]',
    textClass: 'text-[#FF7A00]',
    ringClass: 'ring-[#FF7A00]',
    activeClass: 'bg-[#FF7A00]'
  }
];

export const DEFAULT_10_QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: '新郎與新娘最初是在哪裡認識的？',
    options: ['玉山銀行', '中國信託', '捷運站', '機場'],
    correctIndex: 0,
    timeLimit: 15,
    points: 1000,
    category: '相識緣分',
    explanation: '命運的起點！新郎與新娘最初是在「玉山銀行」相識相遇的～'
  },
  {
    id: 'q2',
    question: '新郎與新娘曾經讀過同一所學校，請問是哪間？',
    options: ['台灣大學', '中央大學', '政治大學', '華威大學'],
    correctIndex: 3,
    timeLimit: 15,
    points: 1000,
    category: '求學校友',
    explanation: '緣分深厚！兩人都曾就讀英國名校「華威大學」（University of Warwick）！'
  },
  {
    id: 'q3',
    question: '新郎與新娘最近喜歡的運動是什麼？',
    options: ['打高爾夫', '打桌球', '打羽球', '早起散步'],
    correctIndex: 3,
    timeLimit: 15,
    points: 1000,
    category: '日常運動',
    explanation: '健康又甜蜜！兩人最近最喜歡的運動就是一早享受清晨陽光「早起散步」～'
  },
  {
    id: 'q4',
    question: '新郎的小名是什麼？',
    options: ['帥哥', '大帥哥', '小寶', '超級大帥哥'],
    correctIndex: 2,
    timeLimit: 15,
    points: 1000,
    category: '新郎小名',
    explanation: '新娘專屬甜蜜暱稱！新郎的小名就是親切可愛的「小寶」！'
  },
  {
    id: 'q5',
    question: '新郎最喜歡玩的遊戲是？',
    options: ['英雄聯盟', '神魔之塔', 'Switch', 'PS5'],
    correctIndex: 0,
    timeLimit: 15,
    points: 1000,
    category: '休閒娛樂',
    explanation: '召喚峽谷見！新郎平時最喜歡玩的電競遊戲就是「英雄聯盟」！'
  },
  {
    id: 'q6',
    question: '新娘有哪一項特別厲害的興趣？',
    options: ['橋牌', '寫書法', '下圍棋', '唱歌'],
    correctIndex: 2,
    timeLimit: 15,
    points: 1000,
    category: '新娘才藝',
    explanation: '才貌兼備！新娘有一項特別厲害的高智商興趣就是「下圍棋」！'
  },
  {
    id: 'q7',
    question: '新郎與新娘最喜歡一起看哪一個節目？',
    options: ['逐玉', '拜託冰箱', '甄嬛傳', '還珠格格'],
    correctIndex: 1,
    timeLimit: 15,
    points: 1000,
    category: '追劇日常',
    explanation: '料理與歡笑兼具！兩人最喜歡一起窩著收看的美食料理節目就是「拜託冰箱」！'
  },
  {
    id: 'q8',
    question: '新郎與新娘曾經一起去過哪一個國家玩？',
    options: ['英國', '日本', '義大利', '法國'],
    correctIndex: 0,
    timeLimit: 15,
    points: 1000,
    category: '甜蜜旅行',
    explanation: '充滿美好回憶！新郎與新娘曾經一同漫步暢遊浪漫的「英國」！'
  },
  {
    id: 'q9',
    question: '新娘的小名是什麼？',
    options: ['美女', '大美女', '葉子', '超級大美女'],
    correctIndex: 2,
    timeLimit: 15,
    points: 1000,
    category: '新娘小名',
    explanation: '清新甜美！新娘最可愛的小名叫做「葉子」！'
  },
  {
    id: 'q10',
    question: '新郎與新娘現在在哪裡工作？',
    options: ['玉山銀行', '中國信託', '台新新光', '永豐銀行'],
    correctIndex: 1,
    timeLimit: 15,
    points: 1000,
    category: '職場舞台',
    explanation: '攜手打拼！新郎與新娘現在都在「中國信託」上班工作！'
  }
];

export const FUN_AVATARS = [
  '👰🏻', '🤵🏻', '💍', '💐', '🥂', '🍰', '💌', '💖', 
  '🕊️', '👑', '🌸', '🎁', '🥑', '✨', '🎈', '🎉'
];

export const BOT_NAMES = [
  '伴郎最強應援 🕶️', '新娘好閨蜜 🌸', '幸福見證官 💍', '搶捧花種子選手 💐', 
  '紅包準備超大 🧧', '吃喜酒第一名 🍰', '早生貴子助攻團 👶', '首席喜宴攝影師 📸'
];
