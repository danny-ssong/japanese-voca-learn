import { createClient } from "@/util/supabase/client";

export async function fetchUnknownWordIds(userId: string | undefined) {
  const supabase = createClient();
  try {
    if (!userId) return { data: [], error: null };

    const { data, error } = await supabase.from("unknown_word").select("word_id").eq("user_id", userId);

    if (error) throw error;
    return { data: data.map((item) => item.word_id), error: null };
  } catch (error) {
    console.error("모르는 단어 ID 불러오기 실패:", error);
    return { data: [], error };
  }
}

export async function addUnknownWord(userId: string, wordId: string) {
  const supabase = createClient();
  try {
    const { error } = await supabase.from("unknown_word").insert({ user_id: userId, word_id: wordId });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("모르는 단어 추가 실패:", error);
    return { success: false, error };
  }
}

export async function removeUnknownWord(userId: string, wordId: string) {
  const supabase = createClient();
  try {
    const { error } = await supabase.from("unknown_word").delete().match({ user_id: userId, word_id: wordId });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("모르는 단어 제거 실패:", error);
    return { success: false, error };
  }
}
