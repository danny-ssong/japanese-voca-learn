"use client";

import { useCallback, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Song, Word } from "@/types";
import { WordForm } from "@/app/admin/_components/word-form";
import { WordCard } from "@/app/admin/_components/word-card";
import { WordJsonImport } from "@/app/admin/_components/word-json-import";
import { fetchSongs } from "@/app/admin/_lib/song-service";
import { fetchWords, deleteWord, moveWord, fetchAllWords } from "@/app/admin/_lib/word-service";

export function AdminWordList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchSongs();
    setSongs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const loadWords = useCallback(async (songId: string) => {
    if (!songId) return;

    setLoading(true);
    const { data } = songId === "all" ? await fetchAllWords() : await fetchWords(songId);
    setWords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedSongId) {
      loadWords(selectedSongId);
    } else {
      setWords([]);
    }
  }, [selectedSongId, loadWords]);

  async function handleDeleteWord(id: string) {
    if (!confirm("정말로 이 단어를 삭제하시겠습니까?")) {
      return;
    }

    const { success } = await deleteWord(id);
    if (success && selectedSongId) {
      loadWords(selectedSongId);
    }
  }

  async function handleMoveWord(id: string, direction: "up" | "down") {
    const { success } = await moveWord(words, id, direction);
    if (success && selectedSongId) {
      loadWords(selectedSongId);
    }
  }

  if (loading && !selectedSongId) {
    return <div className="flex justify-center p-8">노래 목록을 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <label htmlFor="song-select" className="text-sm font-medium block mb-2">
          노래 선택
        </label>
        <Select value={selectedSongId} onValueChange={setSelectedSongId}>
          <SelectTrigger id="song-select" className="w-full">
            <SelectValue placeholder="노래를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {songs.map((song) => (
              <SelectItem key={song.id} value={song.id}>
                {song.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSongId && (
        <>
          <WordForm songId={selectedSongId} mode="add" onSuccess={() => loadWords(selectedSongId)} />

          {words.length > 0 && (
            <WordJsonImport
              songId={selectedSongId}
              currentMaxOrder={Math.max(...words.map((w) => w.order))}
              onSuccess={() => loadWords(selectedSongId)}
            />
          )}

          <h3 className="text-lg font-bold mt-8 mb-4">단어 목록</h3>
          {loading ? (
            <div className="flex justify-center p-8">단어 목록을 불러오는 중...</div>
          ) : words.length === 0 ? (
            <p className="text-center py-4">등록된 단어가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {words.map((word, index) =>
                editingWord && editingWord.id === word.id ? (
                  <WordForm
                    key={word.id}
                    songId={selectedSongId}
                    initialWord={editingWord}
                    mode="edit"
                    onSuccess={() => {
                      setEditingWord(null);
                      loadWords(selectedSongId);
                    }}
                    onCancel={() => setEditingWord(null)}
                  />
                ) : (
                  <WordCard
                    key={word.id}
                    word={word}
                    onEdit={setEditingWord}
                    onDelete={handleDeleteWord}
                    onMove={handleMoveWord}
                    isFirst={index === 0}
                    isLast={index === words.length - 1}
                  />
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
