import { Question } from '../types';
import { DEFAULT_10_QUESTIONS } from '../data/defaultQuestions';

const QUESTIONS_STORAGE_KEY = 'wedding_quiz_official_10_questions_v3';

// Load questions from local storage or fallback to the official 10 questions
export function loadSavedQuestions(): Question[] {
  try {
    const saved = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved questions', e);
  }
  return DEFAULT_10_QUESTIONS;
}

export function saveQuestionsToStorage(questions: Question[]): void {
  try {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions', e);
  }
}
