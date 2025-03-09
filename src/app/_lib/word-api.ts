import { createClient } from "@/util/supabase/client";
import { Word } from "@/types";

export async function fetchWords(songId: string): Promise<{ data: Word[]; error: Error | null }> {
  const supabase = createClient();
  try {
    if (songId === "all") {
      const { data, error } = await supabase.from("word").select("*");
      return { data: data || [], error: error || null };
    }

    // sentence_word를 통해 노래에 속한 단어들을 가져옴
    const { data: sentenceIds } = await supabase.from("sentence").select("id").eq("song_id", songId);

    const { data, error } = await supabase
      .from("sentence_word")
      .select(
        `
        word:word_id (*)
      `
      )
      .in("sentence_id", sentenceIds?.map((row) => row.id) || [])
      .order("order");

    if (error) throw error;

    const uniqueWords = [
      ...new Map(
        data
          .map((item) => ({
            word: Array.isArray(item.word) ? item.word[0] : item.word, // word가 배열이면 첫 번째 요소를 사용
          }))
          .filter((item) => item.word) // null 체크
          .map((item) => [item.word.id, item.word])
      ).values(),
    ];
    return { data: uniqueWords, error: null };
  } catch (error) {
    console.error("단어 목록 불러오기 실패:", error);
    return { data: [], error: error as Error };
  }
}

export async function fetchAllWords() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("word").select("*");
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("단어 목록 불러오기 실패:", error);
    return { data: [], error };
  }
}

export async function addWord(word: Partial<Word>) {
  const supabase = createClient();
  try {
    if (!word.original || !word.pronunciation || !word.meaning) {
      console.log("필수 정보가 누락되었습니다");
      console.log(word);
      return { success: false, error: new Error("필수 정보가 누락되었습니다"), wordId: null };
    }

    const { data, error } = await supabase
      .from("word")
      .insert({
        original: word.original,
        hiragana: word.hiragana || null,
        pronunciation: word.pronunciation,
        meaning: word.meaning,
        word_type: word.word_type || "noun",
      })
      .select("id")
      .single();

    if (error) throw error;

    return { success: true, error: null, wordId: data?.id };
  } catch (error) {
    console.error("단어 추가 실패:", error);
    return { success: false, error, wordId: null };
  }
}

export async function updateWord(word: Word) {
  const supabase = createClient();
  try {
    if (!word.original || !word.pronunciation || !word.meaning) {
      return { success: false, error: new Error("필수 정보가 누락되었습니다") };
    }

    const { error } = await supabase
      .from("word")
      .update({
        original: word.original,
        hiragana: word.hiragana || null,
        pronunciation: word.pronunciation,
        meaning: word.meaning,
        word_type: word.word_type,
      })
      .eq("id", word.id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("단어 수정 실패:", error);
    return { success: false, error };
  }
}

export async function deleteWord(id: string) {
  const supabase = createClient();
  try {
    // 1. 해당 단어가 사용된 문장 수 확인
    const { data: usageCount, error: checkError } = await supabase
      .from("sentence_word")
      .select("sentence_id", { count: "exact" })
      .eq("word_id", id);

    if (checkError) throw checkError;

    // 2. 단어가 사용 중이면 삭제 방지
    if (usageCount && usageCount.length > 0) {
      return {
        success: false,
        error: new Error(`이 단어는 ${usageCount.length}개의 문장에서 사용 중입니다. 삭제할 수 없습니다.`),
      };
    }

    // 3. 사용되지 않는 경우에만 단어 삭제
    const { error } = await supabase.from("word").delete().eq("id", id);
    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("단어 삭제 실패:", error);
    return { success: false, error };
  }
}

export async function bulkImportWords(jsonText: string, songId: string) {
  const supabase = createClient();

  interface WordsJSON {
    nouns?: Word[];
    particles?: Word[];
    verbs?: Word[];
    adjectives?: Word[];
  }

  try {
    const data: WordsJSON = JSON.parse(jsonText);
    const sentenceWordsToAdd: { sentence_id: string; word_id: string; order: number }[] = [];

    // 먼저 문장 생성
    const { data: sentence } = await supabase.from("sentence").insert({ song_id: songId }).select("id").single();

    if (!sentence) throw new Error("문장 생성 실패");

    let currentOrder = 0;

    // 각 카테고리별 단어 처리
    const processWords = async (words: Word[], wordType: string) => {
      for (const word of words) {
        // 단어 추가
        const { data: wordData } = await supabase
          .from("word")
          .insert({
            original: word.original,
            hiragana: word.hiragana || null,
            pronunciation: word.pronunciation,
            meaning: word.meaning,
            word_type: wordType,
          })
          .select("id")
          .single();

        if (wordData) {
          // sentence_word 관계 추가
          sentenceWordsToAdd.push({
            sentence_id: sentence.id,
            word_id: wordData.id,
            order: currentOrder++,
          });
        }
      }
    };

    // 각 카테고리 처리
    if (data.nouns) await processWords(data.nouns, "noun");
    if (data.particles) await processWords(data.particles, "particle");
    if (data.verbs) await processWords(data.verbs, "verb");
    if (data.adjectives) await processWords(data.adjectives, "adjective");

    // sentence_word 관계 일괄 추가
    if (sentenceWordsToAdd.length > 0) {
      const { error } = await supabase.from("sentence_word").insert(sentenceWordsToAdd);
      if (error) throw error;
    }

    return { success: true, count: sentenceWordsToAdd.length, error: null };
  } catch (error) {
    console.error("단어 일괄 추가 실패:", error);
    return { success: false, count: 0, error };
  }
}

export async function findExistingWord(original: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("word").select("*").eq("original", original).single();

    if (error && error.code !== "PGRST116") {
      // PGRST116는 결과가 없을 때 발생하는 에러
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("단어 검색 실패:", error);
    return { data: null, error };
  }
}
