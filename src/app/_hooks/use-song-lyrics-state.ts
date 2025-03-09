"use client";

import { useState, useEffect } from "react";
import { SongLyrics, fetchSongLyrics } from "@/app/_lib/song-lyrics-api";
import { useWordSettingsStore } from "@/store/use-word-settings-store";
import { useUnknownWords } from "@/app/_hooks/use-unknown-words";

interface UseSongLyricsStateProps {
  songId: string;
}

export function useSongLyricsState({ songId }: UseSongLyricsStateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [songLyrics, setSongLyrics] = useState<SongLyrics>({ sentences: [] });
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const { settings } = useWordSettingsStore();
  const { unknownWordMap, handleUnknownWordChange } = useUnknownWords({
    songId,
    initialWords: songLyrics.sentences[currentSentenceIndex]?.words.map((sw) => sw.word) || [],
  });

  // 현재 문장과 단어 가져오기
  const currentSentence = songLyrics.sentences[currentSentenceIndex];
  const currentWords = currentSentence?.words || [];
  // 필터링된 단어 목록
  const filteredWords = currentWords
    .filter((sw) => settings.wordTypes[sw.word.word_type as keyof typeof settings.wordTypes])
    .filter((sw) => !settings.showOnlyUnknown || unknownWordMap[sw.word.id]);

  // 다음 단어로 이동
  const handleNextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  // 이전 단어로 이동
  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // 다음 문장으로 이동
  const handleNextSentence = () => {
    if (currentSentenceIndex < songLyrics.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setCurrentWordIndex(0);
    }
  };

  // 이전 문장으로 이동
  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      setCurrentWordIndex(0);
    }
  };

  // 노래 가사 불러오기
  useEffect(() => {
    async function loadSongLyrics() {
      if (!songId || songId === "all") {
        setSongLyrics({ sentences: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await fetchSongLyrics(songId);

        if (error) throw error;

        setSongLyrics(data);
        setCurrentSentenceIndex(0);
        setCurrentWordIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다"));
      } finally {
        setIsLoading(false);
      }
    }

    loadSongLyrics();
  }, [songId]);

  // 설정이 변경될 때 인덱스 초기화
  useEffect(() => {
    setCurrentWordIndex(0);
  }, [settings]);

  return {
    isLoading,
    error,
    songLyrics,
    currentSentenceIndex,
    currentWordIndex,
    currentSentence,
    filteredWords,
    unknownWordMap,
    settings,
    handleNextWord,
    handlePrevWord,
    handleNextSentence,
    handlePrevSentence,
    handleUnknownWordChange,
  };
}
