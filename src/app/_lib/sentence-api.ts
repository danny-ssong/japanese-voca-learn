import { SentenceWordWithJoin } from "@/types";
import { createClient } from "@/util/supabase/client";
import { toast } from "sonner";

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
    toast.error("문장 목록 불러오기 실패", {
      description: "문장 목록을 불러오는 중 오류가 발생했습니다.",
    });
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
    toast.error("문장 정보 불러오기 실패", {
      description: "문장과 단어 정보를 불러오는 중 오류가 발생했습니다.",
    });
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
      toast.error("필수 정보 누락", {
        description: "원문, 발음, 의미는 필수 입력 항목입니다.",
      });
      return { success: false, data: null, error: new Error("필수 정보가 누락되었습니다") };
    }

    const { data, error } = await supabase
      .from("sentence")
      .insert({
        song_id: songId,
        original: sentence.original,
        pronunciation: sentence.pronunciation,
        meaning: sentence.meaning,
        order: order,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data, error: null };
  } catch (error) {
    console.error("문장 추가 실패:", error);
    toast.error("문장 추가 실패", {
      description: "문장을 추가하는 중 오류가 발생했습니다.",
    });
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
    // 먼저 문장-단어 연결 삭제
    await supabase.from("sentence_word").delete().eq("sentence_id", id);

    // 그 다음 문장 삭제
    const { error } = await supabase.from("sentence").delete().eq("id", id);

    if (error) throw error;

    toast.success("문장 삭제 성공", {
      description: "문장과 관련 단어 연결이 삭제되었습니다.",
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("문장 삭제 실패:", error);
    toast.error("문장 삭제 실패", {
      description: "문장을 삭제하는 중 오류가 발생했습니다.",
    });
    return { success: false, error };
  }
}
