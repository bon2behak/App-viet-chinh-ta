import React from "react";
import { Plus, History, Award, Settings as SettingsIcon, BookOpen } from "lucide-react";
import { Lesson, Stats } from "../types";

interface DashboardProps {
  stats: Stats;
  lessons: Lesson[];
  setScreen: (screen: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export default function Dashboard({ stats, lessons, setScreen, onSelectLesson }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Top banner summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-[32px] p-6 text-white b-heavy border-slate-900 shadow-heavy flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 translate-y-8" />
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-full tracking-wider border border-white/10">
              BẢNG TIẾN ĐỘ NGƯỜI HÙNG
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-2">
              Hôm nay là một ngày tuyệt vời để học chính tả!
            </h3>
            <p className="text-xs text-blue-100 font-semibold max-w-md">
              Hãy chọn một bài học bên dưới để rèn luyện đôi tai, nâng cao vốn từ vựng và tích lũy thật nhiều điểm kinh nghiệm XP nhé!
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-black relative z-10">
            <span>Cấp độ hiện tại: Level {stats.level}</span>
            <span className="bg-white text-blue-600 px-3 py-1 rounded-xl">
              XP tích lũy: {stats.xp}
            </span>
          </div>
        </div>

        {/* Quick action grid */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-5 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy dark:shadow-heavy-dark flex flex-col justify-between gap-4">
          <h4 className="text-sm font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
            Hành động nhanh
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScreen("create")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 border-2 border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-black text-xs gap-1 cursor-pointer transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo bài học</span>
            </button>
            <button
              onClick={() => setScreen("history")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 border-2 border-slate-100 dark:border-slate-800 text-purple-600 dark:text-purple-400 font-black text-xs gap-1 cursor-pointer transition-all"
            >
              <History className="h-5 w-5" />
              <span>Lịch sử & Ôn</span>
            </button>
            <button
              onClick={() => setScreen("achievements")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 border-2 border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-black text-xs gap-1 cursor-pointer transition-all"
            >
              <Award className="h-5 w-5" />
              <span>Thành tích</span>
            </button>
            <button
              onClick={() => setScreen("settings")}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border-2 border-slate-150 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-black text-xs gap-1 cursor-pointer transition-all"
            >
              <SettingsIcon className="h-5 w-5" />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lesson List Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" /> Bài Học Chính Tả Sẵn Có
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white dark:bg-slate-900 rounded-[28px] p-5 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy dark:shadow-heavy-dark hover:scale-[1.01] transition-transform duration-200 flex flex-col justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">
                  {lesson.isCustom ? "TỰ SOẠN THẢO" : "CHUYÊN ĐỀ ĐỌC CHÉP"}
                </span>
                <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                  {lesson.title}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold line-clamp-2 mt-1 leading-relaxed">
                  {lesson.rawText}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-450 uppercase">
                  {lesson.sentences.length} Câu
                </span>
                <button
                  onClick={() => onSelectLesson(lesson)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  Học Ngay 🚀
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
