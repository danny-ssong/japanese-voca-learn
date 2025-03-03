"use client";

import { Song, Word } from "@/types";
import { WordCard } from "@/app/learn/[songId]/_components/word-card";
import { WordSettings } from "@/app/_components/word-settings";
import { SongSelector } from "../_components/song-selector";
import { LearnHeader } from "../_components/learn-header";
import { EmptyWordState } from "../_components/empty-word-state";
import { WordSettingsProps } from "@/store/use-word-settings-store";

interface LearnViewProps {
  currentIndex: number;
  filteredWords: Word[];
  currentSongId: string;
  songs: Song[];
  settings: WordSettingsProps;
  unknownWordMap: Record<string, boolean>;
  onNext: () => void;
  onPrev: () => void;
  onUnknownChange: (wordId: string, checked: boolean) => void;
  onShowUnknownWords: () => void;
  onSongChange: (songId: string) => void;
}

export function LearnView({
  currentIndex,
  filteredWords,
  currentSongId,
  songs,
  settings,
  unknownWordMap,
  onNext,
  onPrev,
  onUnknownChange,
  onShowUnknownWords,
  onSongChange,
}: LearnViewProps) {
  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-10">
        <SongSelector currentSongId={currentSongId} songs={songs} onSongChange={onSongChange} />
        <WordSettings />
      </div>

      <LearnHeader
        currentIndex={currentIndex}
        totalWords={filteredWords.length}
        onShowUnknownWords={onShowUnknownWords}
      />

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mt-20">
        {filteredWords.length <= currentIndex ? (
          <EmptyWordState />
        ) : (
          <WordCard
            word={filteredWords[currentIndex]}
            onNext={onNext}
            onPrev={onPrev}
            isLast={currentIndex === filteredWords.length - 1}
            isFirst={currentIndex === 0}
            showPronunciation={settings.showPronunciation}
            showMeaning={settings.showMeaning}
            showHiragana={settings.showHiragana}
            isUnknown={unknownWordMap[filteredWords[currentIndex].id] || false}
            onUnknownChange={onUnknownChange}
          />
        )}
      </div>
    </div>
  );
}
