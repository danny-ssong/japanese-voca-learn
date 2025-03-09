"use client";

import { useRouter } from "next/navigation";
import { Song, Word } from "@/types";
import { useWordSettingsStore } from "@/store/use-word-settings-store";
import { useUnknownWords } from "@/app/_hooks/use-unknown-words";
import { LyricsLearnView } from "./lyrics-learn-view";

interface LyricsLearnClientProps {
  initialWords: Word[];
  songs: Song[];
  currentSongId: string;
}

export default function LyricsLearnClient({ initialWords, songs, currentSongId }: LyricsLearnClientProps) {
  const router = useRouter();
  const { settings } = useWordSettingsStore();
  const { unknownWordMap, handleUnknownWordChange } = useUnknownWords({
    songId: currentSongId,
    initialWords,
  });

  const handleShowUnknownWords = () => {
    router.push("/unknown-words");
  };

  const handleSongChange = (songId: string) => {
    router.push(`/learn/${songId}`);
  };

  return (
    <LyricsLearnView
      currentSongId={currentSongId}
      songs={songs}
      settings={settings}
      unknownWordMap={unknownWordMap}
      onUnknownChange={handleUnknownWordChange}
      onShowUnknownWords={handleShowUnknownWords}
      onSongChange={handleSongChange}
    />
  );
}
