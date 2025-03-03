import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/util/supabase/client";
import { useAuth } from "@/app/_components/auth-provider";
import { toast } from "sonner";
import { Word } from "@/types";

type Props = {
  songId?: string;
  initialWords?: Word[];
};

export function useUnknownWords({ songId, initialWords }: Props = {}) {
  const [unknownWordIds, setUnknownWordIds] = useState<string[]>([]);
  const [fetchedWords, setFetchedWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuth();
  const supabase = createClient();

  // words는 상태가 아닌 계산된 값으로 변경
  const words = initialWords || fetchedWords;

  // 계산된 값들
  const unknownWords = words.filter((word) => unknownWordIds.includes(word.id) && (!songId || word.song_id === songId));

  const unknownWordMap = unknownWordIds.reduce((acc: Record<string, boolean>, wordId) => {
    acc[wordId] = true;
    return acc;
  }, {});

  const fetchUnknownWords = useCallback(async () => {
    try {
      setLoading(true);
      let fetchedWordIds: string[] = [];

      if (authUser) {
        const { data, error } = await supabase.from("unknown_word").select("word_id").eq("user_id", authUser.id);

        if (error) throw error;
        fetchedWordIds = data.map((item) => item.word_id);
      } else {
        // 로컬 스토리지에서 가져오기
        const storedUnknownWords = localStorage.getItem("unknownWords");
        if (storedUnknownWords) {
          fetchedWordIds = JSON.parse(storedUnknownWords);
        }
      }

      setUnknownWordIds(fetchedWordIds);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
      toast.error("모르는 단어 로딩 실패");
    } finally {
      setLoading(false);
    }
  }, [supabase, authUser]);

  // initialWords가 없는 경우에만 단어 데이터 가져오기
  const fetchWords = useCallback(async () => {
    if (initialWords) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = songId
        ? await supabase.from("word").select("*").eq("song_id", songId)
        : await supabase.from("word").select("*");

      if (error) throw error;
      setFetchedWords(data || []);
    } catch (error) {
      console.error("Error fetching words:", error);
      toast.error("단어 로딩 실패");
    } finally {
      setLoading(false);
    }
  }, [songId, supabase, initialWords]);

  useEffect(() => {
    const loadData = async () => {
      await fetchUnknownWords();
      await fetchWords();
    };

    loadData();
  }, [fetchUnknownWords, fetchWords]);

  const handleUnknownWordChange = async (wordId: string, isUnknown: boolean) => {
    try {
      if (!authUser && !localStorage.getItem("unknownWords")) {
        localStorage.setItem("unknownWords", "[]");
      }

      if (authUser) {
        if (isUnknown) {
          const { error } = await supabase.from("unknown_word").insert({ user_id: authUser.id, word_id: wordId });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("unknown_word")
            .delete()
            .match({ user_id: authUser.id, word_id: wordId });
          if (error) throw error;
        }
      } else {
        const storedUnknownWords = JSON.parse(localStorage.getItem("unknownWords") || "[]");
        const newUnknownWords = isUnknown
          ? [...storedUnknownWords, wordId]
          : storedUnknownWords.filter((id: string) => id !== wordId);
        localStorage.setItem("unknownWords", JSON.stringify(newUnknownWords));
      }

      // 상태 업데이트
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
