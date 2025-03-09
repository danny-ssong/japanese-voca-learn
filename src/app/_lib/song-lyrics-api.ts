import { createClient } from "@/util/supabase/client";
import { Sentence, SentenceWordWithJoin } from "@/types";

export interface SongLyrics {
  sentences: Array<{
    sentence: Sentence;
    words: SentenceWordWithJoin[];
  }>;
}

export async function fetchSongLyrics(songId: string) {
  const supabase = createClient();
  try {
    // 노래의 모든 문장 가져오기
    const { data: sentences, error: sentencesError } = await supabase
      .from("sentence")
      .select("*")
      .eq("song_id", songId)
      .order("order", { ascending: true });

    if (sentencesError) throw sentencesError;

    if (!sentences || sentences.length === 0) {
      return { data: { sentences: [] }, error: null };
    }

    // 각 문장에 대한 단어 정보 가져오기
    const sentenceIds = sentences.map((sentence) => sentence.id);

    const { data: sentenceWords, error: sentenceWordsError } = await supabase
      .from("sentence_word")
      .select(
        `
        id,
        sentence_id,
        word_id,
        order,
        word:word_id (*)
      `
      )
      .in("sentence_id", sentenceIds)
      .order("order", { ascending: true });

    if (sentenceWordsError) throw sentenceWordsError;

    // 문장별로 단어 그룹화
    const sentencesWithWords = sentences.map((sentence) => {
      const words = (sentenceWords as unknown as SentenceWordWithJoin[]).filter((sw) => sw.sentence_id === sentence.id);

      return {
        sentence,
        words,
      };
    });

    return {
      data: { sentences: sentencesWithWords },
      error: null,
    };
  } catch (error) {
    console.error("노래 가사 불러오기 실패:", error);
    return { data: { sentences: [] }, error };
  }
}
