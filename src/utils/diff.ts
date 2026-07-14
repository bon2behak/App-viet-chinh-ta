import { WordDiff } from "../types";

export function sanitizeForCompare(word: string): string {
  if (!word) return "";
  // Remove starting/ending punctuation, quotes, and brackets, then lowercase
  return word
    .toLowerCase()
    .replace(/^['"“‘(]+|['"”’).,;:!?]+$/g, "")
    .trim();
}

export function alignAndDiff(originalSentence: string, typedSentence: string): WordDiff[] {
  const originalWords = originalSentence.trim().split(/\s+/).filter(Boolean);
  const typedWords = typedSentence.trim().split(/\s+/).filter(Boolean);
  const n = originalWords.length;
  const m = typedWords.length;

  // dp[i][j] holds edit distance costs
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * 1.5;
  for (let j = 0; j <= m; j++) dp[0][j] = j * 1.5;

  for (let i = 1; i <= n; i++) {
    const origSan = sanitizeForCompare(originalWords[i - 1]);
    for (let j = 1; j <= m; j++) {
      const typedSan = sanitizeForCompare(typedWords[j - 1]);
      if (origSan === typedSan) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const subCost = dp[i - 1][j - 1] + 2.0;
        const delCost = dp[i - 1][j] + 1.5;
        const insCost = dp[i][j - 1] + 1.5;
        dp[i][j] = Math.min(subCost, delCost, insCost);
      }
    }
  }

  const diffs: WordDiff[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const origWord = originalWords[i - 1];
      const typedWord = typedWords[j - 1];
      const origSan = sanitizeForCompare(origWord);
      const typedSan = sanitizeForCompare(typedWord);

      if (origSan === typedSan) {
        diffs.unshift({ word: typedWord, type: "correct" });
        i--;
        j--;
      } else {
        const subCost = dp[i - 1][j - 1];
        const delCost = dp[i - 1][j];
        const insCost = dp[i][j - 1];
        const minCost = Math.min(subCost + 2.0, delCost + 1.5, insCost + 1.5);

        if (minCost === subCost + 2.0) {
          diffs.unshift({ word: typedWord, type: "incorrect", correction: origWord });
          i--;
          j--;
        } else if (minCost === delCost + 1.5) {
          diffs.unshift({ word: origWord, type: "missing" });
          i--;
        } else {
          diffs.unshift({ word: typedWord, type: "extra" });
          j--;
        }
      }
    } else if (i > 0) {
      diffs.unshift({ word: originalWords[i - 1], type: "missing" });
      i--;
    } else {
      diffs.unshift({ word: typedWords[j - 1], type: "extra" });
      j--;
    }
  }
  return diffs;
}

export function evaluateMistakes(original: string, typed: string) {
  const diffs = alignAndDiff(original, typed);
  let spellingErrors = 0;
  let missingWords = 0;
  let extraWords = 0;
  let correctWords = 0;

  diffs.forEach((item) => {
    if (item.type === "correct") correctWords++;
    else if (item.type === "incorrect") spellingErrors++;
    else if (item.type === "missing") missingWords++;
    else if (item.type === "extra") extraWords++;
  });

  return {
    totalWords: original.split(/\s+/).filter(Boolean).length,
    correctWords,
    spellingErrors,
    missingWords,
    extraWords,
  };
}
