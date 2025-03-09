import { useState, useEffect } from "react";
import { useAuth } from "@/app/_components/auth-provider";
import { toast } from "sonner";
import { Word } from "@/types";
import { fetchUnknownWordIds, addUnknownWord, removeUnknownWord } from "@/app/_lib/unknown-word-api";
import { fetchWords } from "@/app/_lib/word-api";

type Props = {
  songId?: string;
  initialWords?: Word[];
};

export function useUnknownWords({ songId, initialWords }: Props = {}) {
  const [unknownWordIds, setUnknownWordIds] = useState<string[]>([]);
  const [fetchedWords, setFetchedWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuth();

  // words는 상태가 아닌 계산된 값으로 변경
  const words = initialWords || fetchedWords;

  // 계산된 값들
  const unknownWords = words.filter((word) => unknownWordIds.includes(word.id));

  const unknownWordMap = unknownWordIds.reduce((acc: Record<string, boolean>, wordId) => {
    acc[wordId] = true;
    return acc;
  }, {});

  // unknownWords 데이터 로딩
  useEffect(() => {
    const loadUnknownWords = async () => {
      try {
        let fetchedWordIds: string[] = [];
        if (authUser) {
          const { data, error } = await fetchUnknownWordIds(authUser.id);
          if (error) throw error;
          fetchedWordIds = data;
        } else {
          const stored = localStorage.getItem("unknownWords");
          if (stored) fetchedWordIds = JSON.parse(stored);
        }
        setUnknownWordIds(fetchedWordIds);
      } catch (error) {
        console.error("Error loading unknown words:", error);
        toast.error("모르는 단어 목록 로딩 실패");
      }
    };

    loadUnknownWords();
  }, [authUser]); // authUser가 바뀔 때만 다시 로드

  // words 데이터 로딩
  useEffect(() => {
    const loadWordsData = async () => {
      if (initialWords) return;

      setLoading(true);
      try {
        const { data, error } = await fetchWords(songId || "all");
        if (error) throw error;
        setFetchedWords(data || []);
      } catch (error) {
        console.error("Error loading words:", error);
        toast.error("단어 목록 로딩 실패");
      } finally {
        setLoading(false);
      }
    };

    loadWordsData();
  }, [songId, initialWords]);

  const handleUnknownWordChange = async (wordId: string, isUnknown: boolean) => {
    try {
      if (!authUser && !localStorage.getItem("unknownWords")) {
        localStorage.setItem("unknownWords", "[]");
      }

      if (authUser) {
        const { error } = isUnknown
          ? await addUnknownWord(authUser.id, wordId)
          : await removeUnknownWord(authUser.id, wordId);

        if (error) throw error;
      } else {
        const storedUnknownWords = JSON.parse(localStorage.getItem("unknownWords") || "[]");
        const newUnknownWords = isUnknown
          ? [...storedUnknownWords, wordId]
          : storedUnknownWords.filter((id: string) => id !== wordId);
        localStorage.setItem("unknownWords", JSON.stringify(newUnknownWords));
      }

      setUnknownWordIds((prev) => (isUnknown ? [...prev, wordId] : prev.filter((id) => id !== wordId)));

      toast.success(isUnknown ? "단어가 추가되었습니다." : "단어가 제거되었습니다.");
    } catch (error) {
      console.error("Error updating unknown word:", error);
      toast.error("단어 상태 변경 실패", {
        description: "단어 상태를 변경하는 중 오류가 발생했습니다.",
      });
    }
  };

  return {
    unknownWords,
    unknownWordMap,
    loading,
    handleUnknownWordChange,
  };
}
