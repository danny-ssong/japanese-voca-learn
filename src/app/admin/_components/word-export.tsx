"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Word } from "@/types";
import { Clipboard } from "lucide-react";

interface WordExportProps {
  words: Word[];
}

export function WordExport({ words }: WordExportProps) {
  function handleExport() {
    try {
      // 단어들을 카테고리별로 분류
      const nouns: Word[] = [];
      const particles: Word[] = [];
      const verbs: Word[] = [];
      const adjectives: Word[] = [];

      words.forEach((word) => {
        switch (word.word_type) {
          case "noun":
            nouns.push(word);
            break;
          case "particle":
            particles.push(word);
            break;
          case "verb":
            verbs.push(word);
            break;
          case "adjective":
            adjectives.push(word);
            break;
        }
      });

      // JSON 객체 생성
      const exportData: Record<string, Word[]> = {};
      if (nouns.length > 0) exportData.nouns = nouns;
      if (particles.length > 0) exportData.particles = particles;
      if (verbs.length > 0) exportData.verbs = verbs;
      if (adjectives.length > 0) exportData.adjectives = adjectives;

      // JSON 문자열로 변환
      const jsonString = JSON.stringify(exportData, null, 2);

      // 클립보드에 복사
      navigator.clipboard.writeText(jsonString);

      toast.success("단어 내보내기 성공", {
        description: "단어 데이터가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      console.error("단어 내보내기 실패:", error);
      toast.error("단어 내보내기 실패", {
        description: "단어 데이터를 내보내는 중 오류가 발생했습니다.",
      });
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={words.length === 0}>
      <Clipboard />
    </Button>
  );
}
