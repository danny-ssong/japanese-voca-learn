import { createClient } from "@/util/supabase/client";
import { Song } from "@/types";
import { toast } from "sonner";

export async function fetchSongs() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from("song").select("*").order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("노래 목록 불러오기 실패:", error);
    toast.error("노래 목록 불러오기 실패", {
      description: "노래 목록을 불러오는 중 오류가 발생했습니다.",
    });
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
    toast.error("노래 정보 불러오기 실패", {
      description: "노래 정보를 불러오는 중 오류가 발생했습니다.",
    });
    return { data: null, error };
  }
}

export async function addSong(newSong: Partial<Song>) {
  const supabase = createClient();
  try {
    if (!newSong.title?.trim()) {
      toast.error("제목 필수", {
        description: "노래 제목을 입력해주세요.",
      });
      return { success: false, error: new Error("제목이 필요합니다"), songId: null };
    }

    // 중복 제목 확인
    const { data: existingSongs, error: checkError } = await supabase
      .from("song")
      .select("id")
      .eq("title", newSong.title.trim());

    if (checkError) throw checkError;

    if (existingSongs && existingSongs.length > 0) {
      toast.error("중복된 제목", {
        description: "이미 동일한 제목의 노래가 존재합니다.",
      });
      return { success: false, error: new Error("중복된 제목입니다"), songId: null };
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

    toast.success("노래 추가 성공", {
      description: "새 노래가 추가되었습니다.",
    });

    return { success: true, songId: data?.id, error: null };
  } catch (error) {
    console.error("노래 추가 실패:", error);
    toast.error("노래 추가 실패", {
      description: "노래를 추가하는 중 오류가 발생했습니다.",
    });
    return { success: false, songId: null, error };
  }
}

export async function updateSong(editingSong: Song) {
  const supabase = createClient();
  try {
    if (!editingSong || !editingSong.title.trim()) {
      toast.error("제목 필수", {
        description: "노래 제목을 입력해주세요.",
      });
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
      toast.error("중복된 제목", {
        description: "이미 동일한 제목의 노래가 존재합니다.",
      });
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

    toast.success("노래 수정 성공", {
      description: "노래 정보가 수정되었습니다.",
    });

    return { success: true, songId: editingSong.id, error: null };
  } catch (error) {
    console.error("노래 수정 실패:", error);
    toast.error("노래 수정 실패", {
      description: "노래를 수정하는 중 오류가 발생했습니다.",
    });
    return { success: false, songId: null, error };
  }
}

export async function deleteSong(id: string) {
  const supabase = createClient();
  try {
    // 먼저 관련된 단어들 삭제
    await supabase.from("word").delete().eq("song_id", id);

    // 그 다음 노래 삭제
    const { error } = await supabase.from("song").delete().eq("id", id);

    if (error) throw error;

    toast.success("노래 삭제 성공", {
      description: "노래와 관련 단어가 삭제되었습니다.",
    });

    return { success: true, songId: id, error: null };
  } catch (error) {
    console.error("노래 삭제 실패:", error);
    toast.error("노래 삭제 실패", {
      description: "노래를 삭제하는 중 오류가 발생했습니다.",
    });
    return { success: false, songId: null, error };
  }
}
