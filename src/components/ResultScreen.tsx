import React from "react";
import { Award, Trophy, ArrowRight, Star, RefreshCw, BookOpen } from "lucide-react";
import { AttemptLog } from "../types";

interface ResultScreenProps {
  lessonTitle: string;
  attempts: AttemptLog[];
  xpEarned: number;
  coinsEarned: number;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export default function ResultScreen({
  lessonTitle,
  attempts,
  xpEarned,
  coinsEarned,
  onRestart,
  onBackToDashboard,
}: ResultScreenProps) {
  const total = attempts.length;
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy text-center space-y-6">
      <div className="w-16 h-16 bg-amber-150 text-amber-600 rounded-full flex items-center justify-center mx-auto b-heavy border-slate-900 shadow-[2px_2px_0_#000] animate-bounce">
        <Trophy className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
          HOÀN THÀNH BÀI TẬP ĐỌC CHÉP
        </span>
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase leading-tight">
          {lessonTitle}
        </h3>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
          Quá tuyệt vời! Bạn vừa hoàn thành xuất sắc bài chép chính tả này và gặt hái thêm nhiều kiến thức mới!
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-3 gap-3.5 pt-2">
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 border-2 border-slate-900 rounded-2xl">
          <span className="text-[9px] font-black uppercase text-blue-500 block">
            Độ chính xác
          </span>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400 block mt-1">
            {accuracy}%
          </span>
        </div>
        <div className="p-3.5 bg-orange-50 dark:bg-orange-950/20 border-2 border-slate-900 rounded-2xl">
          <span className="text-[9px] font-black uppercase text-orange-500 block">
            Kinh nghiệm
          </span>
          <span className="text-lg font-black text-orange-500 block mt-1">
            +{xpEarned} XP
          </span>
        </div>
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border-2 border-slate-900 rounded-2xl">
          <span className="text-[9px] font-black uppercase text-amber-500 block">
            Phần thưởng
          </span>
          <span className="text-lg font-black text-amber-500 block mt-1">
            +{coinsEarned}🪙
          </span>
        </div>
      </div>

      {/* Session Breakdown logs */}
      <div className="text-left space-y-2">
        <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">
          Chi tiết bài chép
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {attempts.map((attempt, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border-2 border-slate-900 flex items-start gap-2.5 ${
                attempt.isCorrect
                  ? "bg-green-50/40 dark:bg-green-950/10"
                  : "bg-red-50/40 dark:bg-red-950/10"
              }`}
            >
              <div className="mt-0.5">
                {attempt.isCorrect ? (
                  <Star className="h-4 w-4 text-green-500 fill-green-500" />
                ) : (
                  <Star className="h-4 w-4 text-slate-300" />
                )}
              </div>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-extrabold text-slate-700 dark:text-slate-300">
                  Câu {attempt.sentenceIdx + 1}: {attempt.original}
                </p>
                {!attempt.isCorrect && attempt.typed && (
                  <p className="font-semibold text-red-500 line-through">
                    Đã nhập: "{attempt.typed}"
                  </p>
                )}
                <span className="text-[9px] font-bold text-slate-400 block uppercase">
                  Lần thử: {attempt.attemptsUsed} • Kết quả:{" "}
                  {attempt.isCorrect ? "Đúng" : "Bỏ qua"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onRestart}
          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-black py-3 px-4 rounded-2xl border-2 border-slate-900 active-pop uppercase text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" /> Luyện Lại
        </button>
        <button
          onClick={onBackToDashboard}
          className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-black py-3 px-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] active-pop uppercase text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          Trang chủ <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
