import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Sparkles, BookOpen, Volume2, History as HistoryIcon, 
  Award, Settings as SettingsIcon, LogOut, Sun, Moon, Plus 
} from "lucide-react";

// Types
import { Lesson, Stats, Settings, SessionHistory, VocabularyWord, Achievement, AttemptLog } from "./types";

// Components
import WelcomeScreen from "./components/WelcomeScreen";
import Dashboard from "./components/Dashboard";
import LessonCreator from "./components/LessonCreator";
import PracticeScreen from "./components/PracticeScreen";
import ResultScreen from "./components/ResultScreen";
import HistoryScreen from "./components/HistoryScreen";
import AchievementsScreen from "./components/AchievementsScreen";
import SettingsScreen from "./components/SettingsScreen";

// Premade Lessons
const PREMADE_LESSONS: Lesson[] = [
  {
    id: "premade-1",
    title: "Con Quạ Thông Minh (The Clever Crow)",
    rawText: "A thirsty crow flew all over the fields looking for water. For a long time, she could not find any. Suddenly, she saw a water jug with a little water in it. She tried to reach the water, but her beak could not reach down. She thought of a clever plan. She picked up small pebbles one by one and dropped them into the jug. The water rose to the top, and the crow drank eagerly.",
    sentences: [
      "A thirsty crow flew all over the fields looking for water.",
      "For a long time, she could not find any.",
      "Suddenly, she saw a water jug with a little water in it.",
      "She tried to reach the water, but her beak could not reach down.",
      "She thought of a clever plan.",
      "She picked up small pebbles one by one and dropped them into the jug.",
      "The water rose to the top, and the crow drank eagerly.",
    ],
  },
  {
    id: "premade-2",
    title: "Ngày Mưa Thú Vị (A Rainy Day Adventure)",
    rawText: "The sky grew dark with heavy grey clouds. Soon, big raindrops began to fall on the green grass. Tim put on his yellow raincoat and shiny red boots. He ran outside to splash in the deep puddles. His friendly puppy followed him, barking happily. After playing, they both came inside for warm cocoa.",
    sentences: [
      "The sky grew dark with heavy grey clouds.",
      "Soon, big raindrops began to fall on the green grass.",
      "Tim put on his yellow raincoat and shiny red boots.",
      "He ran outside to splash in the deep puddles.",
      "His friendly puppy followed him, barking happily.",
      "After playing, they both came inside for warm cocoa.",
    ],
  },
  {
    id: "premade-3",
    title: "Thói Quen Lành Mạnh (Healthy Habits)",
    rawText: "Drinking pure water every day is very good for your body. You should eat fresh fruits and green vegetables for breakfast. Sleeping early helps your brain feel refreshed in the morning. Do not spend too many hours looking at screens. Playing games outside makes your bones healthy and strong.",
    sentences: [
      "Drinking pure water every day is very good for your body.",
      "You should eat fresh fruits and green vegetables for breakfast.",
      "Sleeping early helps your brain feel refreshed in the morning.",
      "Do not spend too many hours looking at screens.",
      "Playing games outside makes your bones healthy and strong.",
    ],
  },
];

// Initial Stats
const DEFAULT_STATS: Stats = {
  level: 1,
  xp: 0,
  coins: 100,
  streak: 0,
  totalScore: 0,
  lastActiveDate: "",
};

// Initial Settings
const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  voiceId: "",
  speed: 1.0,
  alwaysShowTranslation: false,
  fontSize: "md",
  apiSettings: {
    customApiKey: "",
    useCustomKey: false,
  },
};

export default function App() {
  // Screen Router
  const [screen, setScreen] = useState<string>("dashboard");

  // Core App States
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [lessons, setLessons] = useState<Lesson[]>(PREMADE_LESSONS);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Selection states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [practiceDifficulty, setPracticeDifficulty] = useState<"easy" | "normal" | "hard">("normal");

  // Active session outcomes
  const [activeSessionAttempts, setActiveSessionAttempts] = useState<AttemptLog[]>([]);
  const [activeSessionXp, setActiveSessionXp] = useState(0);
  const [activeSessionCoins, setActiveSessionCoins] = useState(0);

  // Initialize data and triggers
  useEffect(() => {
    // 1. Load system voices
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // 2. Load Local Storage Stats
    const savedStats = localStorage.getItem("dh_stats");
    if (savedStats) setStats(JSON.parse(savedStats));

    // 3. Load Local Storage Settings
    const savedSettings = localStorage.getItem("dh_settings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      applyTheme(parsedSettings.theme);
    } else {
      applyTheme("light");
    }

    // 4. Load Custom Lessons
    const savedLessons = localStorage.getItem("dh_custom_lessons");
    if (savedLessons) {
      setLessons([...PREMADE_LESSONS, ...JSON.parse(savedLessons)]);
    }

    // 5. Load History
    const savedHistory = localStorage.getItem("dh_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // 6. Load Vocab
    const savedVocab = localStorage.getItem("dh_vocabulary");
    if (savedVocab) setVocabulary(JSON.parse(savedVocab));

    // 7. Onboarding trigger
    const completedOnboard = localStorage.getItem("dh_onboarded");
    if (!completedOnboard) {
      setScreen("welcome");
    }
  }, []);

  // Update stats on streak day checks
  useEffect(() => {
    if (stats.lastActiveDate) {
      const today = new Date().toLocaleDateString();
      if (stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();

        let updatedStreak = stats.streak;
        if (stats.lastActiveDate === yesterdayStr) {
          updatedStreak += 1;
        } else {
          updatedStreak = 1; // reset streak if gap day
        }

        const nextStats = { ...stats, streak: updatedStreak, lastActiveDate: today };
        setStats(nextStats);
        localStorage.setItem("dh_stats", JSON.stringify(nextStats));
      }
    }
  }, [stats.lastActiveDate]);

  const applyTheme = (t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Onboarding welcome save
  const handleWelcomeSave = (apiKey: string, skip: boolean) => {
    const updatedSettings = {
      ...settings,
      apiSettings: {
        customApiKey: apiKey,
        useCustomKey: !!apiKey,
      },
    };
    setSettings(updatedSettings);
    localStorage.setItem("dh_settings", JSON.stringify(updatedSettings));
    localStorage.setItem("dh_onboarded", "true");

    // Initialize first streak date
    const today = new Date().toLocaleDateString();
    const updatedStats = { ...stats, streak: stats.streak || 1, lastActiveDate: today };
    setStats(updatedStats);
    localStorage.setItem("dh_stats", JSON.stringify(updatedStats));

    setScreen("dashboard");
  };

  // Custom lesson additions
  const handleSaveCustomLesson = (title: string, rawText: string, sentences: string[]) => {
    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title,
      rawText,
      sentences,
      isCustom: true,
    };
    const savedCustoms = JSON.parse(localStorage.getItem("dh_custom_lessons") || "[]");
    const updatedCustoms = [...savedCustoms, newLesson];
    localStorage.setItem("dh_custom_lessons", JSON.stringify(updatedCustoms));

    setLessons([...PREMADE_LESSONS, ...updatedCustoms]);
    setSelectedLesson(newLesson);
    setPracticeDifficulty("normal");
    setScreen("practice");
  };

  // Finish practice session
  const handleFinishPractice = (
    attempts: AttemptLog[],
    earnedXp: number,
    earnedCoins: number,
    newMissedVocab: VocabularyWord[]
  ) => {
    if (!selectedLesson) return;

    // 1. Calculate accuracy
    const total = attempts.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // 2. Save Session History
    const nextSession: SessionHistory = {
      id: `session-${Date.now()}`,
      lessonId: selectedLesson.id,
      lessonTitle: selectedLesson.title,
      date: new Date().toLocaleDateString(),
      difficulty: practiceDifficulty,
      accuracy,
      correctCount,
      wrongCount: total - correctCount,
      totalXP: earnedXp,
      coinsEarned: earnedCoins,
      attempts,
    };

    const nextHistory = [nextSession, ...history];
    setHistory(nextHistory);
    localStorage.setItem("dh_history", JSON.stringify(nextHistory));

    // 3. Save Vocabulary
    const nextVocab = [...newMissedVocab, ...vocabulary];
    setVocabulary(nextVocab);
    localStorage.setItem("dh_vocabulary", JSON.stringify(nextVocab));

    // 4. Update Stats (XP, Level, Coins, Score)
    const newXP = stats.xp + earnedXp;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level-up
    const nextStats: Stats = {
      level: newLevel,
      xp: newXP,
      coins: stats.coins + earnedCoins,
      streak: stats.streak || 1,
      totalScore: stats.totalScore + earnedXp,
      lastActiveDate: new Date().toLocaleDateString(),
    };
    setStats(nextStats);
    localStorage.setItem("dh_stats", JSON.stringify(nextStats));

    // 5. Populate stats for Result Screen
    setActiveSessionAttempts(attempts);
    setActiveSessionXp(earnedXp);
    setActiveSessionCoins(earnedCoins);
    setScreen("result");
  };

  // Remove Vocabulary word
  const handleRemoveVocabulary = (id: string) => {
    const updated = vocabulary.filter((v) => v.id !== id);
    setVocabulary(updated);
    localStorage.setItem("dh_vocabulary", JSON.stringify(updated));
  };

  // Reset/Clear History log
  const handleClearHistory = () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả lịch sử làm bài?")) {
      setHistory([]);
      localStorage.removeItem("dh_history");
    }
  };

  // Achievements evaluation
  const getAchievements = (): Achievement[] => {
    const totalSessions = history.length;
    return [
      {
        id: "ach-1",
        title: "Tân Binh Đọc Chép",
        description: "Hoàn thành phiên chép đầu tiên của bạn.",
        badge: "🥉",
        target: 1,
        progress: totalSessions,
        unlocked: totalSessions >= 1,
      },
      {
        id: "ach-2",
        title: "Chiến Thần Chăm Chỉ",
        description: "Đạt chuỗi liên tục (streak) học tập trong 3 ngày.",
        badge: "🔥",
        target: 3,
        progress: stats.streak,
        unlocked: stats.streak >= 3,
      },
      {
        id: "ach-3",
        title: "Kinh Nghiệm Dồi Dào",
        description: "Tích lũy được tổng cộng 250 điểm kinh nghiệm XP.",
        badge: "⚡",
        target: 250,
        progress: stats.xp,
        unlocked: stats.xp >= 250,
      },
      {
        id: "ach-4",
        title: "Kỷ Lục Gia Hoàn Hảo",
        description: "Đạt độ chính xác tuyệt đối 100% trong ít nhất 3 bài tập.",
        badge: "👑",
        target: 3,
        progress: history.filter((h) => h.accuracy === 100).length,
        unlocked: history.filter((h) => h.accuracy === 100).length >= 3,
      },
    ];
  };

  // Save Settings
  const handleSaveSettings = (updatedSettings: Settings) => {
    setSettings(updatedSettings);
    applyTheme(updatedSettings.theme);
    localStorage.setItem("dh_settings", JSON.stringify(updatedSettings));
    alert("Cài đặt đã được lưu thành công!");
    setScreen("dashboard");
  };

  return (
    <div className={`min-h-screen ${settings.theme === "dark" ? "dark" : ""}`}>
      {/* Navbar Header */}
      <header className="bg-white dark:bg-slate-900 border-b-4 border-slate-900 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setScreen("dashboard")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 bg-blue-500 rounded-xl b-heavy border-slate-900 flex items-center justify-center text-white font-black text-sm">
              DH
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">
                Dictation Hero
              </h1>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                Chép Chính Tả Tiếng Anh
              </span>
            </div>
          </button>

          {/* Quick status counters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-900" title="Chuỗi học liên tục">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
              <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                {stats.streak}d
              </span>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900" title="Coins">
              <span className="text-xs">🪙</span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {stats.coins}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900" title="Level">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                LV.{stats.level}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {screen === "welcome" && (
          <WelcomeScreen 
            savedKey={settings.apiSettings.customApiKey} 
            onSave={handleWelcomeSave} 
          />
        )}

        {screen === "dashboard" && (
          <Dashboard
            stats={stats}
            lessons={lessons}
            setScreen={setScreen}
            onSelectLesson={(lesson) => {
              setSelectedLesson(lesson);
              // prompt user for difficulty modal
              const diff = prompt("Chọn chế độ học (Dễ: 'easy' / Thường: 'normal' / Khó: 'hard'):", "normal");
              const validDiff = (diff === "easy" || diff === "hard") ? diff : "normal";
              setPracticeDifficulty(validDiff);
              setScreen("practice");
            }}
          />
        )}

        {screen === "create" && (
          <LessonCreator
            apiKey={settings.apiSettings.customApiKey}
            onBack={() => setScreen("dashboard")}
            onSave={handleSaveCustomLesson}
          />
        )}

        {screen === "practice" && selectedLesson && (
          <PracticeScreen
            lesson={selectedLesson}
            difficulty={practiceDifficulty}
            speed={settings.speed}
            voiceId={settings.voiceId}
            voices={voices}
            settings={settings}
            onBack={() => setScreen("dashboard")}
            onFinish={handleFinishPractice}
          />
        )}

        {screen === "result" && selectedLesson && (
          <ResultScreen
            lessonTitle={selectedLesson.title}
            attempts={activeSessionAttempts}
            xpEarned={activeSessionXp}
            coinsEarned={activeSessionCoins}
            onRestart={() => setScreen("practice")}
            onBackToDashboard={() => setScreen("dashboard")}
          />
        )}

        {screen === "history" && (
          <HistoryScreen
            history={history}
            vocabulary={vocabulary}
            voices={voices}
            voiceId={settings.voiceId}
            speed={settings.speed}
            onClearHistory={handleClearHistory}
            onRemoveVocabulary={handleRemoveVocabulary}
            onBack={() => setScreen("dashboard")}
          />
        )}

        {screen === "achievements" && (
          <AchievementsScreen
            achievements={getAchievements()}
            stats={stats}
            onBack={() => setScreen("dashboard")}
          />
        )}

        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            voices={voices}
            onSave={handleSaveSettings}
            onBack={() => setScreen("dashboard")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-[10px] font-bold uppercase text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-850 mt-12">
        <p>© 2026 Dictation Hero • Tiếng Anh An Khê Dictation</p>
      </footer>
    </div>
  );
}
