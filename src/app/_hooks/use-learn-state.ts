"use client";

import { useState, useEffect } from "react";
import { Word } from "@/types";
import { useWordSettingsStore } from "@/store/use-word-settings-store";
import { useUnknownWords } from "@/app/_hooks/use-unknown-words";

interface UseLearnStateProps {
  initialWords: Word[];
  currentSongId: string;
}

export function useLearnState({ initialWords, currentSongId }: UseLearnStateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { settings } = useWordSettingsStore();
  const { unknownWordMap, handleUnknownWordChange } = useUnknownWords({
    songId: currentSongId,
    initialWords: initialWords,
  });

  // 필터링된 단어 목록
  let filteredWords = initialWords.filter(
    (word) => settings.wordTypes[word.word_type as keyof typeof settings.wordTypes]
  );

  if (settings.showOnlyUnknown) {
    filteredWords = filteredWords.filter((word) => unknownWordMap[word.id]);
  }

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 노래가 변경될 때 인덱스 초기화
  useEffect(() => {
    setCurrentIndex(0);
  }, [currentSongId, settings]);

  return {
    currentIndex,
    filteredWords,
    unknownWordMap,
    settings,
    handleNext,
    handlePrev,
    handleUnknownWordChange,
  };
}
