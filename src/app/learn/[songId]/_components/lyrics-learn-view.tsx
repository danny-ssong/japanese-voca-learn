"use client";

import { Song } from "@/types";
import { WordCard } from "@/app/learn/[songId]/_components/word-card";
import { WordSettings } from "@/app/_components/word-settings";
import { SongSelector } from "./song-selector";
import { LearnHeader } from "./learn-header";
import { EmptyWordState } from "./empty-word-state";
import { WordSettingsProps } from "@/store/use-word-settings-store";
import { SentenceCard } from "./sentence-card";
import { useSongLyricsState } from "@/app/_hooks/use-song-lyrics-state";

interface LyricsLearnViewProps {
  currentSongId: string;
  songs: Song[];
  settings: WordSettingsProps;
  unknownWordMap: Record<string, boolean>;
  onUnknownChange: (wordId: string, checked: boolean) => void;
  onShowUnknownWords: () => void;
  onSongChange: (songId: string) => void;
}

export function LyricsLearnView({
  currentSongId,
  songs,
  settings,
  unknownWordMap,
  onUnknownChange,
  onShowUnknownWords,
  onSongChange,
}: LyricsLearnViewProps) {
  const {
    isLoading,
    error,
    songLyrics,
    currentSentenceIndex,
    currentWordIndex,
    currentSentence,
    filteredWords,
    handleNextWord,
    handlePrevWord,
    handleNextSentence,
    handlePrevSentence,
  } = useSongLyricsState({ songId: currentSongId });

  const currentWord = filteredWords[currentWordIndex]?.word;
  const totalSentences = songLyrics.sentences.length;
  const totalWords = filteredWords.length;

  if (isLoading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">오류: {error.message}</div>;
  }

  if (songLyrics.sentences.length === 0) {
    return <EmptyWordState />;
  }

  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-10">
        <SongSelector currentSongId={currentSongId} songs={songs} onSongChange={onSongChange} />
        <WordSettings />
      </div>

      <LearnHeader currentIndex={currentWordIndex} totalWords={totalWords} onShowUnknownWords={onShowUnknownWords} />

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mt-10">
        {/* 문장 카드 */}
        {currentSentence && (
          <SentenceCard
            sentence={currentSentence.sentence}
            currentIndex={currentSentenceIndex}
            totalSentences={totalSentences}
            onNext={handleNextSentence}
            onPrev={handlePrevSentence}
            isFirst={currentSentenceIndex === 0}
            isLast={currentSentenceIndex === totalSentences - 1}
            showMeaning={settings.showMeaning}
            showPronunciation={settings.showPronunciation}
          />
        )}

        {/* 단어 카드 */}
        <div className="mt-10">
          {filteredWords.length === 0 ? (
            <div className="text-center py-5">이 문장에는 표시할 단어가 없습니다.</div>
          ) : currentWord ? (
            <WordCard
              word={currentWord}
              onNext={handleNextWord}
              onPrev={handlePrevWord}
              isLast={currentWordIndex === filteredWords.length - 1}
              isFirst={currentWordIndex === 0}
              showPronunciation={settings.showPronunciation}
              showMeaning={settings.showMeaning}
              showHiragana={settings.showHiragana}
              isUnknown={unknownWordMap[currentWord.id] || false}
              onUnknownChange={onUnknownChange}
            />
          ) : (
            <EmptyWordState />
          )}
        </div>
      </div>
    </div>
  );
}
