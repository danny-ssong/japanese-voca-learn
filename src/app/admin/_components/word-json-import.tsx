"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/util/supabase/client";
import type { Word } from "@/types";

interface WordsJSON {
  nouns?: Word[];
  particles?: Word[];
  verbs?: Word[];
  adjectives?: Word[];
}

interface WordJsonImportProps {
  songId: string;
  onSuccess: () => void;
}

export function WordJsonImport({ onSuccess }: WordJsonImportProps) {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function handleBulkImport() {
    if (!jsonInput.trim()) {
      toast.error("JSON 입력 필요", {
        description: "가져올 단어 데이터를 JSON 형식으로 입력해주세요.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data: WordsJSON = JSON.parse(jsonInput);
      const wordsToAdd: Partial<Word>[] = [];

      // 각 카테고리별 단어 처리
      if (data.nouns) {
        wordsToAdd.push(
          ...data.nouns.map((word) => ({
            original: word.original,
            hiragana: word.hiragana || null,
            pronunciation: word.pronunciation,
            meaning: word.meaning,
            word_type: "noun" as const,
          }))
        );
      }

      if (data.particles) {
        wordsToAdd.push(
          ...data.particles.map((word) => ({
            original: word.original,
            hiragana: null,
            pronunciation: word.pronunciation,
            meaning: word.meaning,
            word_type: "particle" as const,
          }))
        );
      }

      if (data.verbs) {
        wordsToAdd.push(
          ...data.verbs.map((word) => ({
            original: word.original,
            hiragana: word.hiragana || null,
            pronunciation: word.pronunciation,
            meaning: word.meaning,
            word_type: "verb" as const,
          }))
        );
      }

      if (data.adjectives) {
        wordsToAdd.push(
          ...data.adjectives.map((word) => ({
            original: word.original,
            hiragana: word.hiragana || null,
            pronunciation: word.pronunciation,
            meaning: word.meaning,
            word_type: "adjective" as const,
          }))
        );
      }

      // 일괄 추가
      const { error } = await supabase.from("word").insert(wordsToAdd);

      if (error) throw error;

      toast.success("단어 일괄 추가 성공", {
        description: `${wordsToAdd.length}개의 단어가 추가되었습니다.`,
      });

      setJsonInput("");
      onSuccess();
    } catch (error) {
      console.error("단어 일괄 추가 실패:", error);
      toast.error("단어 일괄 추가 실패", {
        description: "JSON 형식이 올바른지 확인해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">JSON 일괄 추가</h3>
      <div className="flex gap-4">
        <textarea
          className="flex-1 min-h-[200px] p-2 border rounded-md"
          placeholder={`{
  "nouns": [
    { "original": "君", "hiragana": "きみ", "pronunciation": "키미", "meaning": "너" }
  ],
  "particles": [
    { "original": "の", "pronunciation": "노", "meaning": "~의" }
  ],
  "verbs": [
    { "original": "生きる", "pronunciation": "이키루", "meaning": "살다" }
  ],
  "adjectives": [
    { "original": "悪い", "hiragana": "わるい", "pronunciation": "와루이", "meaning": "나쁘다" }
  ]
}`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <Button onClick={handleBulkImport} disabled={isSubmitting}>
          일괄 추가
        </Button>
      </div>
    </div>
  );
}
