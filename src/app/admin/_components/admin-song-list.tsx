"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Song } from "@/types";
import { fetchSongs, addSong, updateSong, deleteSong } from "@/app/admin/_lib/song-service";

export function AdminSongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSong, setNewSong] = useState<Partial<Song>>({ title: "", title_korean: "" });
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchSongs();
    setSongs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  async function handleAddSong() {
    const { success } = await addSong(newSong);
    if (success) {
      setNewSong({ title: "", title_korean: "" });
      loadSongs();
    }
  }

  async function handleUpdateSong() {
    if (!editingSong) return;

    const { success } = await updateSong(editingSong);
    if (success) {
      setEditingSong(null);
      loadSongs();
    }
  }

  async function handleDeleteSong(id: string) {
    if (!confirm("정말로 이 노래를 삭제하시겠습니까? 관련된 모든 단어도 함께 삭제됩니다.")) {
      return;
    }

    const { success } = await deleteSong(id);
    if (success) {
      loadSongs();
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">노래 목록을 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-4">새 노래 추가</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                제목(일본어)
              </label>
              <Input
                id="title"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                placeholder="노래 제목"
              />
            </div>
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                제목(한국어)
              </label>
              <Input
                id="title"
                value={newSong.title_korean || ""}
                onChange={(e) => setNewSong({ ...newSong, title_korean: e.target.value })}
                placeholder="노래 제목"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddSong}>노래 추가</Button>
        </CardFooter>
      </Card>

      <h3 className="text-lg font-bold mt-8 mb-4">노래 목록</h3>
      {songs.length === 0 ? (
        <p className="text-center py-4">등록된 노래가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {songs.map((song) =>
            editingSong && editingSong.id === song.id ? (
              <Card key={song.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={`edit-title-${song.id}`} className="text-sm font-medium block mb-1">
                        제목(일본어)
                      </label>
                      <Input
                        id={`edit-title-${song.id}`}
                        value={editingSong.title}
                        onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="title" className="text-sm font-medium block mb-1">
                        제목(한국어)
                      </label>
                      <Input
                        id="title"
                        value={editingSong.title_korean || ""}
                        onChange={(e) => setEditingSong({ ...editingSong, title_korean: e.target.value })}
                        placeholder="노래 제목"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleUpdateSong}>저장</Button>
                  <Button variant="outline" onClick={() => setEditingSong(null)}>
                    취소
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card key={song.id}>
                <CardContent className="pt-6">
                  <h4 className="text-lg font-bold">{song.title}</h4>
                  {song.title_korean && <p className="text-sm text-muted-foreground">{song.title_korean}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    수정된 날짜: {song.updated_at ? new Date(song.updated_at).toLocaleDateString() : "날짜 없음"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingSong(song)}>
                      수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSong(song.id)}>
                      삭제
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => (window.location.href = `/admin/words/${song.id}`)}
                  >
                    단어 관리
                  </Button>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
