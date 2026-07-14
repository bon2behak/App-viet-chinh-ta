/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * Shared helper to initialize the GoogleGenAI SDK safely
 */
function getGenAIClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No Gemini API key available. Please configure your key in settings or secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * API: Split lesson text into individual sentences
 */
app.post("/api/split-lesson", async (req, res) => {
  try {
    const { text, apiKey } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required to split into sentences." });
    }

    try {
      const ai = getGenAIClient(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Split the following English paragraph or text into a list of individual sentences. 
Do not include any numbering, blank lines, or formatting outside of the standard sentence contents.
Text to split:
"${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["sentences"],
            properties: {
              sentences: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of extracted individual sentences in original order.",
              },
            },
          },
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text.trim());
        if (Array.isArray(data.sentences) && data.sentences.length > 0) {
          // Clean up any empty strings
          const cleanSentences = data.sentences
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
          return res.json({ sentences: cleanSentences });
        }
      }
      throw new Error("Invalid output format from Gemini");
    } catch (geminiError) {
      console.warn("Gemini sentence split failed, using regex fallback:", geminiError);
      
      // Smart regex fallback for sentence splitting:
      // Match boundaries of periods, exclamation marks, question marks, followed by space & uppercase letters.
      const sentences = text
        .replace(/([.!?])\s*(?=[A-Z“"'])/g, "$1|")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      return res.json({ sentences });
    }
  } catch (error: any) {
    console.error("Split lesson error:", error);
    res.status(500).json({ error: error.message || "Failed to parse lesson text." });
  }
});

/**
 * API: Translate a sentence into Vietnamese
 */
app.post("/api/translate-sentence", async (req, res) => {
  try {
    const { sentence, apiKey } = req.body;
    if (!sentence || typeof sentence !== "string" || !sentence.trim()) {
      return res.status(400).json({ error: "Sentence is required for translation." });
    }

    try {
      const ai = getGenAIClient(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate the following English sentence into clear, natural Vietnamese suitable for English learners (elementary to high school level). Output ONLY the translation, no extra comments, explanations or markdown.
Sentence: "${sentence}"`,
      });

      const translation = response.text?.trim() || "";
      if (translation) {
        return res.json({ translation });
      }
      throw new Error("Empty translation returned");
    } catch (geminiError) {
      console.warn("Gemini translation failed, using simple message:", geminiError);
      return res.json({ translation: "(Chưa có bản dịch. Hãy cài đặt Gemini API Key để dịch tự động.)" });
    }
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: error.message || "Failed to translate sentence." });
  }
});

/**
 * API: Explain spelling/grammar mistake
 */
app.post("/api/explain-mistake", async (req, res) => {
  try {
    const { original, typed, apiKey } = req.body;
    if (!original || !typed) {
      return res.status(400).json({ error: "Both original and typed sentences are required." });
    }

    try {
      const ai = getGenAIClient(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an encouraging and patient English teacher in Vietnam.
Analyze the user's spelling/grammar mistakes in this dictation exercise.
Original English sentence: "${original}"
User typed sentence: "${typed}"

Provide a short, easy-to-understand explanation in Vietnamese (1 to 3 short sentences/bullet points) targeted at elementary or middle school students.
Explain clearly what they wrote wrong and why it should be corrected (e.g. singular vs plural, spelling of a specific word, tense difference, missing word, etc.).
Keep it friendly, clear, and highly encouraging! Do not use markdown styling like headers, keep it simple text or basic bullet points.`,
      });

      const explanation = response.text?.trim() || "";
      return res.json({ explanation });
    } catch (geminiError) {
      console.warn("Gemini explanation failed:", geminiError);
      return res.json({ explanation: "Không thể kết nối AI để lấy giải thích chi tiết. Vui lòng kiểm tra lại cài đặt API Key." });
    }
  } catch (error: any) {
    console.error("Explain error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI explanation." });
  }
});

/**
 * Serve client application
 */
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
