import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Volume2, Play, CheckCircle2, AlertCircle, RefreshCw, 
  Eye, EyeOff, Sparkles, BookOpen, Volume1, HelpCircle, AlertTriangle 
} from "lucide-react";
import { Lesson, Settings, AttemptLog, VocabularyWord, WordDiff } from "../types";
import { alignAndDiff, evaluateMistakes } from "../utils/diff";

interface PracticeScreenProps {
  lesson: Lesson;
  difficulty: "easy" | "normal" | "hard";
  speed: number;
  voiceId: string;
  voices: SpeechSynthesisVoice[];
  settings: Settings;
  onFinish: (attempts: AttemptLog[], xp: number, coins: number, missedVocab: VocabularyWord[]) => void;
  onBack: () => void;
}

export default function PracticeScreen({
  lesson,
  difficulty,
  speed,
  voiceId,
  voices,
  settings,
  onFinish,
  onBack,
}: PracticeScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [attemptsUsed, setAttemptsUsed] = useState(1);
  const [playCount, setPlayCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [alwaysShowTrans, setAlwaysShowTrans] = useState(settings.alwaysShowTranslation);

  // Stats / Progression
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [combo, setCombo] = useState(0);
  const [attemptsLog, setAttemptsLog] = useState<AttemptLog[]>([]);
  const [missedVocab, setMissedVocab] = useState<VocabularyWord[]>([]);

  // Word highlights & AI assists
  const [wordDiffs, setWordDiffs] = useState<WordDiff[]>([]);
  const [translation, setTranslation] = useState("");
  const [isLoadingTrans, setIsLoadingTrans] = useState(false);
  const [aiExplain, setAiExplain] = useState("");
  const [isLoadingExplain, setIsLoadingExplain] = useState(false);

  const currentSentence = lesson.sentences[currentIdx] || "";

  const speakText = (text: string, customSpeed: number = speed) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === voiceId);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = customSpeed;
    window.speechSynthesis.speak(utterance);
  };

  const handleListen = (customSpeed: number = speed) => {
    if (difficulty === "hard" && playCount >= 1) {
      alert("Chế độ KHÓ: Chỉ nghe tối đa 1 lần!");
      return;
    }
    if (difficulty === "normal" && playCount >= 3 && !submitted) {
      alert("Chế độ THƯỜNG: Chỉ nghe tối đa 3 lần trước khi nộp!");
      return;
    }
    setPlayCount((p) => p + 1);
    speakText(currentSentence, customSpeed);
  };

  const handleFetchTranslation = async () => {
    if (translation) return;
    setIsLoadingTrans(true);
    try {
      const response = await fetch("/api/translate-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: currentSentence, apiKey: settings.apiSettings.customApiKey || undefined }),
      });
      if (response.ok) {
        const data = await response.json();
        setTranslation(data.translation);
      } else {
        setTranslation("(Không tải được bản dịch)");
      }
    } catch (e) {
      setTranslation("(Không kết nối được dịch vụ dịch thuật)");
    } finally {
      setIsLoadingTrans(false);
    }
  };

  const handleFetchExplanation = async () => {
    if (aiExplain) return;
    setIsLoadingExplain(true);
    try {
      const response = await fetch("/api/explain-mistake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: currentSentence,
          typed: typed,
          apiKey: settings.apiSettings.customApiKey || undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiExplain(data.explanation);
      } else {
        setAiExplain("(Không tải được giải thích lỗi)");
      }
    } catch (e) {
      setAiExplain("(Không tải được giải thích lỗi)");
    } finally {
      setIsLoadingExplain(false);
    }
  };

  // Auto play on sentence change
  useEffect(() => {
    setTyped("");
    setAttemptsUsed(1);
    setPlayCount(0);
    setSubmitted(false);
    setIsCorrect(false);
    setShowAnswer(false);
    setTranslation("");
    setAiExplain("");
    setWordDiffs([]);

    if (difficulty !== "hard") {
      const timer = setTimeout(() => {
        speakText(currentSentence, speed);
        setPlayCount(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIdx]);

  // Auto translation trigger if preference alwaysShowTranslation is set
  useEffect(() => {
    if (alwaysShowTrans && currentSentence) {
      handleFetchTranslation();
    }
  }, [alwaysShowTrans, currentIdx]);

  const handleSubmit = () => {
    const trimmedTyped = typed.trim();
    if (!trimmedTyped) {
      alert("Hãy nhập câu trả lời của bạn!");
      return;
    }

    const diffs = alignAndDiff(currentSentence, trimmedTyped);
    setWordDiffs(diffs);

    const metrics = evaluateMistakes(currentSentence, trimmedTyped);
    const correct = metrics.spellingErrors === 0 && metrics.missingWords === 0 && metrics.extraWords === 0;

    setSubmitted(true);
    if (correct) {
      setIsCorrect(true);
      const isPerfectCombo = combo >= 2;
      const baseXP = difficulty === "easy" ? 30 : difficulty === "normal" ? 50 : 80;
      const baseCoins = difficulty === "easy" ? 5 : difficulty === "normal" ? 10 : 20;

      const bonusXP = isPerfectCombo ? 20 : 0;
      const bonusCoins = isPerfectCombo ? 5 : 0;

      const finalXP = baseXP + bonusXP;
      const finalCoins = baseCoins + bonusCoins;

      setXpEarned((prev) => prev + finalXP);
      setCoinsEarned((prev) => prev + finalCoins);
      setCombo((prev) => prev + 1);

      // Play success chime or sound feedback
      speakText("Correct!");

      // Save success logs
      setAttemptsLog((prev) => [
        ...prev,
        {
          sentenceIdx: currentIdx,
          original: currentSentence,
          typed: trimmedTyped,
          isCorrect: true,
          attemptsUsed: attemptsUsed,
        },
      ]);
    } else {
      setIsCorrect(false);
      setCombo(0);

      // Save missed vocabulary from misspelled words
      const newErrors: VocabularyWord[] = [];
      diffs.forEach((d) => {
        if (d.type === "incorrect" && d.correction) {
          newErrors.push({
            id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            wrongWord: d.word,
            correctWord: d.correction,
            sentenceContext: currentSentence,
            dateAdded: new Date().toLocaleDateString(),
          });
        }
      });
      if (newErrors.length > 0) {
        setMissedVocab((prev) => [...prev, ...newErrors]);
      }

      // Check mistake explanation via Gemini if key present
      if (settings.apiSettings.customApiKey) {
        handleFetchExplanation();
      }
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setAttemptsUsed((a) => a + 1);
    setWordDiffs([]);
    setAiExplain("");
    speakText(currentSentence, speed);
  };

  const handleNext = () => {
    // If not correct and skipped, record as incorrect attempt
    if (!isCorrect) {
      setAttemptsLog((prev) => [
        ...prev,
        {
          sentenceIdx: currentIdx,
          original: currentSentence,
          typed: typed.trim(),
          isCorrect: false,
          attemptsUsed: attemptsUsed,
        },
      ]);
    }

    if (currentIdx + 1 < lesson.sentences.length) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      // Completed last sentence of the lesson
      onFinish(
        [
          ...attemptsLog,
          ...(!isCorrect
            ? []
            : []), // Already logged above if correct
        ],
        xpEarned,
        coinsEarned,
        missedVocab
      );
    }
  };

  const handleSkip = () => {
    setShowAnswer(true);
    setSubmitted(true);
    setIsCorrect(false);
    setCombo(0);
    const diffs = alignAndDiff(currentSentence, typed);
    setWordDiffs(diffs);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">
              {lesson.title}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Câu {currentIdx + 1} / {lesson.sentences.length} • Chế độ:{" "}
              {difficulty === "easy" ? "Dễ" : difficulty === "normal" ? "Thường" : "Khó"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {combo > 1 && (
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full animate-bounce flex items-center gap-1 shadow-sm">
              🔥 Combo x{combo}
            </span>
          )}
          <span className="text-xs font-black text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 border border-blue-150 dark:border-blue-900 rounded-xl">
            {xpEarned} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + (submitted && isCorrect ? 1 : 0)) / lesson.sentences.length) * 100}%` }}
        />
      </div>

      {/* Audio Player Controls */}
      <div className="bg-[#F3F8FF] dark:bg-slate-950/40 rounded-3xl p-5 border-2 border-dashed border-blue-100 dark:border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Play Audio */}
          <button
            onClick={() => handleListen()}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer active-pop flex items-center gap-1.5"
          >
            <Volume2 className="h-4.5 w-4.5" />
            <span>Nghe Toàn Bộ</span>
          </button>

          {/* Slow speed play audio */}
          <button
            onClick={() => handleListen(0.7)}
            className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer active-pop flex items-center gap-1"
          >
            <Volume1 className="h-4 w-4" />
            <span>Nghe Chậm (0.7x)</span>
          </button>
        </div>

        <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          <span>Lần nghe: {playCount}</span>
        </div>
      </div>

      {/* Workstation */}
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-555">
            Nhập phần nghe của bạn (Tiếng Anh)
          </label>
          <textarea
            disabled={submitted}
            rows={3}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ví dụ: Today is my first day at school..."
            className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Translation Assistant Block */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Bản dịch Tiếng Việt
            </span>
            <button
              onClick={() => {
                setAlwaysShowTrans(!alwaysShowTrans);
                if (!alwaysShowTrans) handleFetchTranslation();
              }}
              className="text-[10px] font-black uppercase text-blue-500 hover:underline flex items-center gap-1"
            >
              {alwaysShowTrans ? (
                <>
                  <EyeOff className="h-3 w-3" /> Tắt Tự Động
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" /> Luôn Hiện
                </>
              )}
            </button>
          </div>

          {isLoadingTrans ? (
            <span className="text-xs font-bold text-slate-400 animate-pulse block">
              Đang tải bản dịch từ AI...
            </span>
          ) : translation ? (
            <p className="text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed italic">
              "{translation}"
            </p>
          ) : (
            <button
              onClick={handleFetchTranslation}
              className="text-xs font-bold text-blue-500 hover:underline"
            >
              Xem gợi ý bản dịch bằng tiếng Việt 💡
            </button>
          )}
        </div>

        {/* Evaluation Output Details */}
        {submitted && (
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
            {/* Verdict */}
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="w-9 h-9 bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 rounded-full flex items-center justify-center border border-green-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="w-9 h-9 bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-full flex items-center justify-center border border-red-200">
                  <AlertCircle className="h-5 w-5" />
                </div>
              )}
              <div>
                <h4
                  className={`text-sm font-black uppercase leading-none ${
                    isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isCorrect ? "Đúng rồi! Cực Đỉnh" : "Chưa chính xác! Hãy nghe và viết lại"}
                </h4>
                <span className="text-[10px] text-slate-400 font-bold block mt-1">
                  Đánh giá chi tiết từ Dictation Engine
                </span>
              </div>
            </div>

            {/* Word Diff Map */}
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Kết quả so khớp từ
              </span>
              <div className="flex flex-wrap gap-x-2 gap-y-3 p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl mt-1 leading-relaxed">
                {wordDiffs.map((item, idx) => {
                  if (item.type === "correct") {
                    return (
                      <span key={idx} className="text-sm font-bold text-green-600 dark:text-green-400">
                        {item.word}
                      </span>
                    );
                  } else if (item.type === "incorrect") {
                    return (
                      <span key={idx} className="relative group text-sm font-bold text-red-500 border-b-2 border-red-300">
                        {item.word}
                        {item.correction && (
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            Sửa: {item.correction}
                          </span>
                        )}
                      </span>
                    );
                  } else if (item.type === "missing") {
                    return (
                      <span key={idx} className="text-sm font-bold text-slate-400 dark:text-slate-600 line-through">
                        {item.word}
                      </span>
                    );
                  } else {
                    // extra words
                    return (
                      <span key={idx} className="text-sm font-bold text-amber-500 underline decoration-wavy">
                        {item.word}
                      </span>
                    );
                  }
                })}
              </div>
              <div className="flex gap-4 text-[9px] font-bold text-slate-400 mt-2 pl-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> Đúng
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" /> Sai chính tả
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full" /> Thiếu từ
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" /> Thừa từ
                </span>
              </div>
            </div>

            {/* Answer Showcase */}
            {(!isCorrect || showAnswer) && (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-blue-500 block">
                  Đáp án chính xác
                </span>
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 leading-relaxed select-text mt-1">
                  {currentSentence}
                </p>
                <button
                  onClick={() => speakText(currentSentence)}
                  className="mt-1 text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-1"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Nghe lại giọng đọc đáp án
                </button>
              </div>
            )}

            {/* AI Error Explanations */}
            {!isCorrect && settings.apiSettings.customApiKey && (
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-purple-500 flex items-center gap-1 mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI Phân Tích Lỗi Sai
                </span>
                {isLoadingExplain ? (
                  <span className="text-xs font-bold text-slate-400 animate-pulse block">
                    AI đang xem xét bài viết của bạn...
                  </span>
                ) : aiExplain ? (
                  <p className="text-xs font-semibold text-purple-950 dark:text-purple-300 leading-relaxed whitespace-pre-wrap">
                    {aiExplain}
                  </p>
                ) : (
                  <button
                    onClick={handleFetchExplanation}
                    className="text-xs font-bold text-purple-500 hover:underline"
                  >
                    Yêu cầu AI giải thích chi tiết lỗi viết sai 🤖
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
          <div className="flex gap-2">
            {!submitted && (
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 bg-slate-150 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:text-slate-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
              >
                Bỏ qua
              </button>
            )}
            {submitted && !isCorrect && !showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:text-slate-300 rounded-xl font-bold text-xs uppercase cursor-pointer flex items-center gap-1"
              >
                <Eye className="h-4 w-4" /> Hiện đáp án
              </button>
            )}
          </div>

          <div className="flex gap-2.5">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer"
              >
                Kiểm tra đáp án 🔍
              </button>
            ) : !isCorrect && !showAnswer ? (
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" /> Nghe và viết lại 🔁
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-black text-xs uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer"
              >
                {currentIdx + 1 < lesson.sentences.length ? "Câu tiếp theo ➡️" : "Hoàn thành bài tập 🏁"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
