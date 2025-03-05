import { createClient } from "@/util/supabase/client";
import { Word } from "@/types";
import { toast } from "sonner";

export async function fetchWords(songId: string) {
  const supabase = createClient();
  try {
    const { data, error } =
      songId === "all"
        ? await supabase.from("word").select("*").order("order", { ascending: true })
        : await supabase.from("word").select("*").eq("song_id", songId).order("order", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("단어 목록 불러오기 실패:", error);
    toast.error("단어 목록 불러오기 실패", {
      description: "단어 목록을 불러오는 중 오류가 발생했습니다.",
    });
    return { data: [], error };
  }
}

export async function fetchAllWords() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("word").select("*").order("order", { ascending: true });
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("단어 목록 불러오기 실패:", error);
    toast.error("단어 목록 불러오기 실패", {
      description: "단어 목록을 불러오는 중 오류가 발생했습니다.",
    });
    return { data: [], error };
  }
}

export async function addWord(word: Partial<Word>, songId: string) {
  const supabase = createClient();
  try {
    if (!word.original || !word.pronunciation || !word.meaning) {
      toast.error("필수 정보 누락", {
        description: "원어, 발음, 뜻은 필수 입력 항목입니다.",
      });
      return { success: false, error: new Error("필수 정보가 누락되었습니다"), wordId: null };
    }

    const { data, error } = await supabase
      .from("word")
      .insert({
        song_id: songId,
        original: word.original,
        hiragana: word.hiragana || null,
        pronunciation: word.pronunciation,
        meaning: word.meaning,
        word_type: word.word_type || "noun",
        order: word.order || 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    toast.success("단어 추가 성공", {
      description: "새 단어가 추가되었습니다.",
    });

    return { success: true, error: null, wordId: data?.id };
  } catch (error) {
    console.error("단어 추가 실패:", error);
    toast.error("단어 추가 실패", {
      description: "단어를 추가하는 중 오류가 발생했습니다.",
    });
    return { success: false, error, wordId: null };
  }
}

export async function updateWord(word: Word) {
  const supabase = createClient();
  try {
    if (!word.original || !word.pronunciation || !word.meaning) {
      toast.error("필수 정보 누락", {
        description: "원어, 발음, 뜻은 필수 입력 항목입니다.",
      });
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

    toast.success("단어 수정 성공", {
      description: "단어 정보가 수정되었습니다.",
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("단어 수정 실패:", error);
    toast.error("단어 수정 실패", {
      description: "단어를 수정하는 중 오류가 발생했습니다.",
    });
    return { success: false, error };
  }
}

export async function deleteWord(id: string) {
  const supabase = createClient();
  try {
    const { error } = await supabase.from("word").delete().eq("id", id);

    if (error) throw error;

    toast.success("단어 삭제 성공", {
      description: "단어가 삭제되었습니다.",
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("단어 삭제 실패:", error);
    toast.error("단어 삭제 실패", {
      description: "단어를 삭제하는 중 오류가 발생했습니다.",
    });
    return { success: false, error };
  }
}

export async function moveWord(words: Word[], id: string, direction: "up" | "down") {
  const supabase = createClient();
  try {
    const wordIndex = words.findIndex((w) => w.id === id);
    if (wordIndex === -1) return { success: false, error: new Error("단어를 찾을 수 없습니다") };

    let targetIndex;
    if (direction === "up" && wordIndex > 0) {
      targetIndex = wordIndex - 1;
    } else if (direction === "down" && wordIndex < words.length - 1) {
      targetIndex = wordIndex + 1;
    } else {
      return { success: false, error: new Error("이동할 수 없는 위치입니다") };
    }

    const currentWord = words[wordIndex];
    const targetWord = words[targetIndex];

    // 두 단어의 순서를 서로 바꿈
    const [currentOrder, targetOrder] = [currentWord.order, targetWord.order];
    await supabase.from("word").update({ order: targetOrder }).eq("id", currentWord.id);
    await supabase.from("word").update({ order: currentOrder }).eq("id", targetWord.id);

    return { success: true, error: null };
  } catch (error) {
    console.error("단어 순서 변경 실패:", error);
    toast.error("순서 변경 실패", {
      description: "단어 순서를 변경하는 중 오류가 발생했습니다.",
    });
    return { success: false, error };
  }
}

export async function bulkImportWords(jsonText: string, songId: string, currentMaxOrder: number) {
  const supabase = createClient();

  interface WordsJSON {
    nouns?: Word[];
    particles?: Word[];
    verbs?: Word[];
    adjectives?: Word[];
  }

  try {
    const data: WordsJSON = JSON.parse(jsonText);
    const wordsToAdd: Partial<Word>[] = [];

    let currentOrder = currentMaxOrder + 1;

    // 각 카테고리별 단어 처리
    if (data.nouns) {
      wordsToAdd.push(
        ...data.nouns.map((word) => ({
          song_id: songId,
          original: word.original,
          hiragana: word.hiragana || null,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          word_type: "noun" as const,
          order: currentOrder++,
        }))
      );
    }

    if (data.particles) {
      wordsToAdd.push(
        ...data.particles.map((word) => ({
          song_id: songId,
          original: word.original,
          hiragana: null,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          word_type: "particle" as const,
          order: currentOrder++,
        }))
      );
    }

    if (data.verbs) {
      wordsToAdd.push(
        ...data.verbs.map((word) => ({
          song_id: songId,
          original: word.original,
          hiragana: word.hiragana || null,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          word_type: "verb" as const,
          order: currentOrder++,
        }))
      );
    }

    if (data.adjectives) {
      wordsToAdd.push(
        ...data.adjectives.map((word) => ({
          song_id: songId,
          original: word.original,
          hiragana: word.hiragana || null,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          word_type: "adjective" as const,
          order: currentOrder++,
        }))
      );
    }

    // 일괄 추가
    const { error } = await supabase.from("word").insert(wordsToAdd);

    if (error) throw error;

    toast.success("단어 일괄 추가 성공", {
      description: `${wordsToAdd.length}개의 단어가 추가되었습니다.`,
    });

    return { success: true, count: wordsToAdd.length, error: null };
  } catch (error) {
    console.error("단어 일괄 추가 실패:", error);
    toast.error("단어 일괄 추가 실패", {
      description: "JSON 형식이 올바른지 확인해주세요.",
    });
    return { success: false, count: 0, error };
  }
}

export async function findExistingWord(original: string, hiragana: string | null) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("word")
      .select("*")
      .eq("original", original)
      .eq("hiragana", hiragana)
      .single();

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
