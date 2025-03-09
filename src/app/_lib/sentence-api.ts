import { SentenceWordWithJoin } from "@/types";
import { createClient } from "@/util/supabase/client";

export async function fetchSentences(songId: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("sentence")
      .select("*")
      .eq("song_id", songId)
      .order("order", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("문장 목록 불러오기 실패:", error);
    return { data: [], error };
  }
}

export async function fetchSentenceWithWords(sentenceId: string) {
  const supabase = createClient();
  try {
    // 문장 정보 가져오기
    const { data: sentenceData, error: sentenceError } = await supabase
      .from("sentence")
      .select("*")
      .eq("id", sentenceId)
      .single();

    if (sentenceError) throw sentenceError;

    // 문장에 포함된 단어 정보 가져오기
    const { data: sentenceWordsData, error: sentenceWordsError } = await supabase
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
      .eq("sentence_id", sentenceId)
      .order("order", { ascending: true });

    if (sentenceWordsError) throw sentenceWordsError;

    return {
      data: {
        sentence: sentenceData,
        words: sentenceWordsData as unknown as SentenceWordWithJoin[],
      },
      error: null,
    };
  } catch (error) {
    console.error("문장과 단어 불러오기 실패:", error);
    return { data: null, error };
  }
}

export async function addSentence(
  songId: string,
  sentence: {
    original: string;
    pronunciation: string;
    meaning: string;
  },
  order: number
) {
  const supabase = createClient();
  try {
    if (!sentence.original || !sentence.pronunciation || !sentence.meaning) {
      return { success: false, data: null, error: new Error("필수 정보가 누락되었습니다") };
    }

    const { data, error } = await supabase
      .from("sentence")
      .upsert(
        {
          song_id: songId,
          original: sentence.original,
          pronunciation: sentence.pronunciation,
          meaning: sentence.meaning,
          order: order,
        },
        { onConflict: "song_id, order" }
      )
      .select()
      .single();

    if (error) throw error;

    return { success: true, data, error: null };
  } catch (error) {
    console.error("문장 추가 실패:", error);
    return { success: false, data: null, error };
  }
}

export async function addSentenceWord(sentenceId: string, wordId: string, order: number) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("sentence_word")
      .insert({
        sentence_id: sentenceId,
        word_id: wordId,
        order: order,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data, error: null };
  } catch (error) {
    console.error("문장-단어 연결 실패:", error);
    return { success: false, data: null, error };
  }
}

export async function deleteSentence(id: string) {
  const supabase = createClient();
  try {
    // 1. 삭제할 문장에서 사용된 단어들의 ID 가져오기
    const { data: sentenceWords } = await supabase.from("sentence_word").select("word_id").eq("sentence_id", id);

    if (sentenceWords && sentenceWords.length > 0) {
      const wordIds = sentenceWords.map((sw) => sw.word_id);

      // 2. 이 단어들이 다른 문장에서도 사용되는지 확인
      const { data: wordUsageInOtherSentences } = await supabase
        .from("sentence_word")
        .select("word_id")
        .in("word_id", wordIds)
        .neq("sentence_id", id);

      // 3. 다른 문장에서 사용되지 않는 단어 ID 필터링
      const unusedWordIds = wordIds.filter(
        (wordId) => !wordUsageInOtherSentences?.some((usage) => usage.word_id === wordId)
      );

      // 4. sentence_word 관계 삭제
      await supabase.from("sentence_word").delete().eq("sentence_id", id);

      // 5. 사용되지 않는 단어들 삭제
      if (unusedWordIds.length > 0) {
        await supabase.from("word").delete().in("id", unusedWordIds);
      }
    }

    // 6. 문장 삭제
    const { error } = await supabase.from("sentence").delete().eq("id", id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("문장 삭제 실패:", error);
    return { success: false, error };
  }
}
