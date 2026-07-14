import React, { useState } from "react";
import { ArrowLeft, Sparkles, BookOpen } from "lucide-react";

interface LessonCreatorProps {
  onBack: () => void;
  onSave: (title: string, text: string, sentences: string[]) => void;
  apiKey: string;
}

export default function LessonCreator({ onBack, onSave, apiKey }: LessonCreatorProps) {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [sentences, setSentences] = useState<string[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleSplit = async () => {
    const trimmedText = rawText.trim();
    if (!trimmedText) {
      alert("Vui lòng nhập đoạn văn bản tiếng Anh!");
      return;
    }

    setIsSplitting(true);
    try {
      const response = await fetch("/api/split-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmedText, apiKey: apiKey || undefined }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.sentences) && data.sentences.length > 0) {
          setSentences(data.sentences);
          setIsSplitting(false);
          return;
        }
      }
      throw new Error("API call failed or returned empty sentences");
    } catch (e) {
      console.warn("Backend sentence splitting failed, using regex fallback:", e);
      // Smart regex fallback for sentence splitting:
      // Match boundaries of periods, exclamation marks, question marks, followed by space & uppercase letters.
      const split = trimmedText
        .replace(/([.!?])\s*(?=[A-Z“"'])/g, "$1|")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      setSentences(split);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleSaveLesson = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert("Vui lòng nhập tiêu đề bài học!");
      return;
    }
    if (sentences.length === 0) {
      alert("Vui lòng tách câu trước khi lưu!");
      return;
    }
    onSave(trimmedTitle, rawText.trim(), sentences);
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 b-heavy border-slate-900 dark:border-slate-800 shadow-heavy">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white leading-none">
            Tự Tạo Bài Học
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-wider">
            Cá nhân hóa tài liệu nghe chép
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Tiêu đề bài học
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: My School Trip..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            Đoạn văn tiếng Anh
          </label>
          <textarea
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Nhập một đoạn văn tiếng Anh để tách thành các câu nghe chép..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
        </div>

        <button
          onClick={handleSplit}
          disabled={isSplitting}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="h-4 w-4" />{" "}
          {isSplitting ? "Đang xử lý..." : "Tách văn bản thành câu 🪄"}
        </button>

        {sentences.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-850">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block">
              Danh sách các câu đã tách ({sentences.length})
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {sentences.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-start gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    {idx + 1}. {s}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveLesson}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_#000] text-xs uppercase cursor-pointer"
            >
              Lưu bài học & Học Ngay 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
