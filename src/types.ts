export interface Lesson {
  id: string;
  title: string;
  rawText: string;
  sentences: string[];
  isCustom?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  target: number;
  progress: number;
  unlocked: boolean;
}

export interface Stats {
  level: number;
  xp: number;
  coins: number;
  streak: number;
  totalScore: number;
  lastActiveDate: string;
}

export interface Settings {
  theme: "light" | "dark";
  voiceId: string;
  speed: number;
  alwaysShowTranslation: boolean;
  fontSize: "sm" | "md" | "lg";
  apiSettings: {
    customApiKey: string;
    useCustomKey: boolean;
  };
}

export interface AttemptLog {
  sentenceIdx: number;
  original: string;
  typed: string;
  isCorrect: boolean;
  attemptsUsed: number;
}

export interface SessionHistory {
  id: string;
  lessonId: string;
  lessonTitle: string;
  date: string;
  difficulty: "easy" | "normal" | "hard";
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  totalXP: number;
  coinsEarned: number;
  attempts: AttemptLog[];
}

export interface VocabularyWord {
  id: string;
  wrongWord: string;
  correctWord: string;
  sentenceContext: string;
  dateAdded: string;
}

export interface WordDiff {
  word: string;
  type: "correct" | "incorrect" | "missing" | "extra";
  correction?: string;
}
