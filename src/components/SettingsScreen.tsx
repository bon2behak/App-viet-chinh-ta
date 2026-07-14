import React, { useState } from "react";
import { ArrowLeft, Key, Lock, Volume2, Sparkles, Sun, Moon, Type } from "lucide-react";
import { Settings } from "../types";

interface SettingsScreenProps {
  settings: Settings;
  voices: SpeechSynthesisVoice[];
  onSave: (updated: Settings) => void;
  onBack: () => void;
}

export default function SettingsScreen({ settings, voices, onSave, onBack }: SettingsScreenProps) {
  const [voiceId, setVoiceId] = useState(settings.voiceId || "");
  const [speed, setSpeed] = useState(settings.speed || 1.0);
  const [alwaysShowTranslation, setAlwaysShowTranslation] = useState(settings.alwaysShowTranslation || false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">(settings.fontSize || "md");
  const [theme, setTheme] = useState<"light" | "dark">(settings.theme || "light");
  const [customApiKey, setCustomApiKey] = useState(settings.apiSettings.customApiKey || "");
  const [useCustomKey, setUseCustomKey] = useState(settings.apiSettings.useCustomKey || false);

  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));

  const testVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Welcome to Dictation Hero! Practice makes perfect.");
    const voice = englishVoices.find((v) => v.name === voiceId);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    onSave({
      theme,
      voiceId,
      speed,
      alwaysShowTranslation,
      fontSize,
      apiSettings: {
        customApiKey: customApiKey.trim(),
        useCustomKey,
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white leading-none">
            Cấu Hình Ứng Dụng
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
            Tùy chỉnh giọng nói và trải nghiệm học
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Voice Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Chọn giọng đọc Tiếng Anh
          </label>
          <div className="flex gap-2">
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
            >
              <option value="">Giọng đọc mặc định (Hệ thống)</option>
              {englishVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={testVoice}
              className="px-4 py-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer text-xs font-black uppercase flex items-center gap-1 active-pop"
            >
              <Volume2 className="h-4 w-4" /> Thử giọng
            </button>
          </div>
        </div>

        {/* Speed Adjustment */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            <span>Tốc độ đọc giọng nói</span>
            <span className="text-blue-500">{speed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Font size and theme toggles */}
        <div className="grid grid-cols-2 gap-4">
          {/* Font Sizes */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Type className="h-4.5 w-4.5" /> Cỡ chữ hiển thị
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
              {(["sm", "md", "lg"] as const).map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg cursor-pointer ${
                    fontSize === sz
                      ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  {sz === "sm" ? "Nhỏ" : sz === "md" ? "Vừa" : "To"}
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sun className="h-4.5 w-4.5" /> Giao diện hiển thị
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
              {(["light", "dark"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1 ${
                    theme === t
                      ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  {t === "light" ? (
                    <>
                      <Sun className="h-3 w-3" /> Sáng
                    </>
                  ) : (
                    <>
                      <Moon className="h-3 w-3" /> Tối
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Translation Preference */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
          <div className="space-y-0.5">
            <label className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none">
              Tự Động Hiện Bản Dịch
            </label>
            <span className="text-[10px] text-slate-400 font-bold block leading-relaxed">
              Luôn hiện câu dịch tiếng Việt dưới ô gõ phím khi làm bài.
            </span>
          </div>
          <input
            type="checkbox"
            checked={alwaysShowTranslation}
            onChange={(e) => setAlwaysShowTranslation(e.target.checked)}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
          />
        </div>

        {/* API Settings */}
        <div className="p-4 bg-purple-50/40 dark:bg-purple-950/10 border-2 border-purple-200 dark:border-purple-950/20 rounded-[28px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Cài đặt Gemini API Key
            </span>
            <input
              type="checkbox"
              checked={useCustomKey}
              onChange={(e) => setUseCustomKey(e.target.checked)}
              className="w-4.5 h-4.5 accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <input
              type="password"
              disabled={!useCustomKey}
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="AI Studio API Key (AIzaSy...)..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-850 dark:text-white disabled:opacity-50"
            />
            <span className="text-[9px] font-bold text-slate-400 block pl-1">
              Chỉ dùng khóa của bạn để thực hiện các yêu cầu dịch thuật và phân tích lỗi chép chính tả nâng cao.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] text-xs uppercase cursor-pointer active-pop"
        >
          Lưu Cấu Hình & Hoàn Tất ✔
        </button>
      </div>
    </div>
  );
}
