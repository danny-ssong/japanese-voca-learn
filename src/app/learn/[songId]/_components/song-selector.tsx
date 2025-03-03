"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Song } from "@/types";

interface SongSelectorProps {
  currentSongId: string;
  songs: Song[];
  onSongChange: (songId: string) => void;
}

export function SongSelector({ currentSongId, songs, onSongChange }: SongSelectorProps) {
  const getSelectedSongTitle = () => {
    if (currentSongId === "all") return "모든 노래";
    const selectedSong = songs.find((song) => song.id === currentSongId);
    return selectedSong ? selectedSong.title_korean : "노래 선택";
  };
  return (
    <Select value={currentSongId} onValueChange={onSongChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="노래 선택">{getSelectedSongTitle()}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">모든 노래</SelectItem>
        {songs.map((song) => (
          <SelectItem key={song.id} value={song.id}>
            <div className="flex flex-col">
              <p className="text-sm w-full">{song.title_korean}</p>
              <p className="text-sm text-muted-foreground w-full">{song.title}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
