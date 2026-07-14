import React from "react";
import { ArrowLeft, Award, Trophy, Star, Shield, ShieldCheck, Flame, Zap } from "lucide-react";
import { Achievement, Stats } from "../types";

interface AchievementsScreenProps {
  achievements: Achievement[];
  stats: Stats;
  onBack: () => void;
}

export default function AchievementsScreen({ achievements, stats, onBack }: AchievementsScreenProps) {
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
            Bảng Thành Tích
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
            Vinh danh cột mốc học tập của bạn
          </p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-slate-900 rounded-2xl text-center">
          <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <span className="text-[9px] font-black uppercase text-slate-400 block">
            Tổng điểm tích lũy
          </span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-0.5">
            {stats.totalScore} XP
          </span>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-slate-900 rounded-2xl text-center">
          <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1 animate-bounce" />
          <span className="text-[9px] font-black uppercase text-slate-400 block">
            Chuỗi liên tục (Streak)
          </span>
          <span className="text-xl font-black text-slate-800 dark:text-white block mt-0.5">
            {stats.streak} ngày
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-slate-400 pl-1">
          Huy hiệu đạt được
        </h4>

        <div className="space-y-3">
          {achievements.map((item) => {
            const isUnlocked = item.progress >= item.target;
            const percentage = Math.min(Math.round((item.progress / item.target) * 100), 100);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 border-slate-900 flex items-center justify-between gap-4 transition-colors ${
                  isUnlocked
                    ? "bg-gradient-to-r from-blue-50/20 to-blue-100/10 dark:from-slate-850 dark:to-slate-800"
                    : "bg-slate-50 dark:bg-slate-950/40 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl b-heavy border-slate-900 flex items-center justify-center text-2xl shadow-[2px_2px_0_#000] ${
                      isUnlocked
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-600"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                        {item.title}
                      </h5>
                      {isUnlocked ? (
                        <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Shield className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 w-24">
                  <span className="text-[9px] font-black text-slate-400 block mb-1">
                    {item.progress} / {item.target}
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
