import { createClient } from "@/util/supabase/client";
import { Song } from "@/types";

export async function fetchSongs() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("song").select("*").order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("노래 목록 불러오기 실패:", error);
    return { data: [], error };
  }
}

export async function fetchSongById(songId: string) {
  const supabase = createClient();
  try {
    const { data, error } =
      songId === "all"
        ? await supabase.from("song").select("*")
        : await supabase.from("song").select("*").eq("id", songId).single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("노래 정보 불러오기 실패:", error);
    return { data: null, error };
  }
}

export async function getSongId(newSong: Partial<Song>): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("song").select("id").eq("title", newSong.title?.trim()).single();
  if (error) return null;
  return data?.id || null;
}

export async function addSong(newSong: Partial<Song>): Promise<string | null> {
  const supabase = createClient();
  try {
    if (!newSong.title?.trim()) {
      return null;
    }

    // 중복 제목 확인
    const { data: existingSongs, error: checkError } = await supabase
      .from("song")
      .select("id")
      .eq("title", newSong.title.trim());

    if (checkError) throw checkError;

    if (existingSongs && existingSongs.length > 0) {
      return null;
    }

    const { data, error } = await supabase
      .from("song")
      .insert({
        title: newSong.title,
        title_korean: newSong.title_korean || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    return data?.id || null;
  } catch (error) {
    console.error("노래 추가 실패:", error);
    return null;
  }
}

export async function updateSong(editingSong: Song) {
  const supabase = createClient();
  try {
    if (!editingSong || !editingSong.title.trim()) {
      return { success: false, error: new Error("제목이 필요합니다"), songId: null };
    }

    // 중복 제목 확인 (자기 자신 제외)
    const { data: existingSongs, error: checkError } = await supabase
      .from("song")
      .select("id")
      .eq("title", editingSong.title.trim())
      .neq("id", editingSong.id);

    if (checkError) throw checkError;

    if (existingSongs && existingSongs.length > 0) {
      return { success: false, error: new Error("중복된 제목입니다"), songId: null };
    }

    const { error } = await supabase
      .from("song")
      .update({
        title: editingSong.title,
        title_korean: editingSong.title_korean || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingSong.id);

    if (error) throw error;

    return { success: true, songId: editingSong.id, error: null };
  } catch (error) {
    console.error("노래 수정 실패:", error);
    return { success: false, songId: null, error };
  }
}

export async function deleteSong(id: string) {
  const supabase = createClient();
  try {
    // 1. 이 노래의 문장들 ID 가져오기
    const { data: songSentences } = await supabase.from("sentence").select("id").eq("song_id", id);

    // 2. 이 노래의 단어들 ID 가져오기
    const { data: songWords } = await supabase.from("word").select("id").eq("song_id", id);

    if (songWords && songWords.length > 0) {
      const wordIds = songWords.map((word) => word.id);

      // 3. 이 단어들이 다른 노래의 문장들에서 사용되는지 확인
      const { data: wordUsageInOtherSongs } = await supabase
        .from("sentence_word")
        .select("word_id")
        .in("word_id", wordIds)
        .not("sentence_id", "in", songSentences?.map((s) => s.id) || []);

      // 4. 다른 문장에서 사용되지 않는 단어만 필터링
      const uniqueWordIds = wordIds.filter(
        (wordId) => !wordUsageInOtherSongs?.some((usage) => usage.word_id === wordId)
      );

      // 5. sentence_word 관계 삭제
      if (songSentences) {
        await supabase
          .from("sentence_word")
          .delete()
          .in(
            "sentence_id",
            songSentences.map((s) => s.id)
          );
      }

      // 6. 사용되지 않는 단어들 삭제
      if (uniqueWordIds.length > 0) {
        await supabase.from("word").delete().in("id", uniqueWordIds);
      }
    }

    // 7. 노래의 문장들 삭제
    await supabase.from("sentence").delete().eq("song_id", id);

    // 8. 노래 삭제
    const { error } = await supabase.from("song").delete().eq("id", id);

    if (error) throw error;

    return { success: true, songId: id, error: null };
  } catch (error) {
    console.error("노래 삭제 실패:", error);
    return { success: false, songId: null, error };
  }
}
