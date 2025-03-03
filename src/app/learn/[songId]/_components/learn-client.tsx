"use client";

import { useRouter } from "next/navigation";

import { Song, Word } from "@/types";

import { useLearnState } from "@/app/_hooks/use-learn-state";
import { LearnView } from "@/app/learn/[songId]/_components/learn-view";

interface LearnClientProps {
  initialWords: Word[];
  songs: Song[];
  currentSongId: string;
}

export default function LearnClient({ initialWords, songs, currentSongId }: LearnClientProps) {
  const router = useRouter();
  const { currentIndex, filteredWords, unknownWordMap, settings, handleNext, handlePrev, handleUnknownWordChange } =
    useLearnState({ initialWords, currentSongId });

  const handleShowUnknownWords = () => {
    router.push("/unknown-words");
  };

  const handleSongChange = (songId: string) => {
    router.push(`/learn/${songId}`);
  };

  return (
    <LearnView
      currentIndex={currentIndex}
      filteredWords={filteredWords}
      currentSongId={currentSongId}
      songs={songs}
      settings={settings}
      unknownWordMap={unknownWordMap}
      onNext={handleNext}
      onPrev={handlePrev}
      onUnknownChange={handleUnknownWordChange}
      onShowUnknownWords={handleShowUnknownWords}
      onSongChange={handleSongChange}
    />
  );
}
