import React, { useState } from "react";
import { Award, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  savedKey: string;
  onSave: (key: string, skip: boolean) => void;
}

export default function WelcomeScreen({ savedKey, onSave }: WelcomeScreenProps) {
  const [key, setKey] = useState(savedKey || "");

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-[32px] p-6 text-center b-heavy border-slate-900 dark:border-slate-800 shadow-heavy">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 b-heavy border-slate-900">
        <Award className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-tight">
        Chào mừng Người Hùng!
      </h2>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
        Học chép chính tả tiếng Anh toàn diện với phản hồi chấm sửa tức thì, độ chính xác chi tiết và giải thích thông minh từ AI!
      </p>

      <div className="mt-6 space-y-4">
        <div className="text-left space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
            Nhập Gemini API Key (Tùy chọn)
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AI Studio API Key (AIzaSy...)..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
          <span className="text-[10px] font-bold text-slate-400 block pl-1 leading-relaxed">
            Mở khóa đầy đủ khả năng chia đoạn văn, tự động dịch câu và phản hồi sửa lỗi ngữ pháp thông minh của AI.
          </span>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => onSave(key, false)}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 px-6 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] active-pop uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Lưu Khóa & Bắt Đầu 🎯
          </button>
          <button
            onClick={() => onSave("", true)}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-300 font-black py-3 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs uppercase cursor-pointer"
          >
            Học Ngoại Tuyến (Offline)
          </button>
        </div>
      </div>
    </div>
  );
}
