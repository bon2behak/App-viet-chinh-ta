import React, { useState } from "react";
import { 
  ArrowLeft, Calendar, Award, Trash2, Volume2, BookOpen, Clock, 
  ChevronRight, AlertTriangle, Sparkles 
} from "lucide-react";
import { SessionHistory, VocabularyWord } from "../types";

interface HistoryScreenProps {
  history: SessionHistory[];
  vocabulary: VocabularyWord[];
  voices: SpeechSynthesisVoice[];
  voiceId: string;
  speed: number;
  onClearHistory: () => void;
  onRemoveVocabulary: (id: string) => void;
  onBack: () => void;
}

export default function HistoryScreen({
  history,
  vocabulary,
  voices,
  voiceId,
  speed,
  onClearHistory,
  onRemoveVocabulary,
  onBack,
}: HistoryScreenProps) {
  const [activeTab, setActiveTab] = useState<"sessions" | "vocab">("sessions");

  const speakVocab = (word: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voice = voices.find((v) => v.name === voiceId);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy">
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white leading-none">
            Nhật Ký Học Tập
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
            Xem lại hành trình rèn luyện chính tả
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl gap-1.5 mb-6">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer text-center ${
            activeTab === "sessions"
              ? "bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 shadow-sm"
              : "text-slate-550 hover:text-slate-700"
          }`}
        >
          Lịch sử tập ({history.length})
        </button>
        <button
          onClick={() => setActiveTab("vocab")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer text-center ${
            activeTab === "vocab"
              ? "bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 shadow-sm"
              : "text-slate-550 hover:text-slate-700"
          }`}
        >
          Sổ tay từ vựng ({vocabulary.length})
        </button>
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
              Các phiên đã làm
            </span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[10px] font-black uppercase text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Xóa lịch sử
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-2">
              <Clock className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Bạn chưa làm bài chép chính tả nào!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-150">
                        {log.difficulty === "easy" ? "Dễ" : log.difficulty === "normal" ? "Thường" : "Khó"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {log.date}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                      {log.lessonTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Số câu đúng: {log.correctCount} / {log.correctCount + log.wrongCount}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Độ chính xác
                      </span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        {log.accuracy}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Phần thưởng
                      </span>
                      <span className="text-xs font-black text-orange-500 block">
                        +{log.totalXP} XP
                      </span>
                      <span className="text-xs font-black text-amber-500 block">
                        +{log.coinsEarned}🪙
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vocab Tab */}
      {activeTab === "vocab" && (
        <div className="space-y-4">
          <div className="pl-1">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
              Từ viết sai của bạn
            </span>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Tự động lưu từ có lỗi chính tả để nghe lại giọng đọc phát âm chuẩn và làm quen mặt chữ.
            </p>
          </div>

          {vocabulary.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-2">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Bạn chưa viết sai từ nào. Tuyệt quá!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {vocabulary.map((vocab) => (
                <div
                  key={vocab.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-150">
                          Đã viết: "{vocab.wrongWord}"
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                        <span className="text-[9px] font-black uppercase text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded border border-green-150">
                          Sửa: "{vocab.correctWord}"
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 italic leading-relaxed pt-1">
                        Ngữ cảnh: "{vocab.sentenceContext}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakVocab(vocab.correctWord)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-900 cursor-pointer flex items-center justify-center"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRemoveVocabulary(vocab.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-550 dark:text-slate-400 rounded-xl cursor-pointer"
                        title="Đã thuộc từ này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 text-right uppercase block">
                    Đã thêm ngày: {vocab.dateAdded}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
