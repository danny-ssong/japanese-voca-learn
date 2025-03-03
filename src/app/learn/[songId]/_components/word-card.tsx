"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Word } from "@/types";

interface WordCardProps {
  word: Word;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  showPronunciation: boolean;
  showMeaning: boolean;
  showHiragana: boolean;
  isUnknown: boolean;
  onUnknownChange: (wordId: string, checked: boolean) => void;
}

export function WordCard({
  word,
  onNext,
  onPrev,
  isFirst,
  isLast,
  showPronunciation,
  showMeaning,
  showHiragana,
  isUnknown,
  onUnknownChange,
}: WordCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-end gap-2">
            <label htmlFor="unknown" className="text-sm">
              모르는 단어
            </label>
            <Checkbox
              id="unknown"
              checked={isUnknown}
              onCheckedChange={(checked) => onUnknownChange(word.id, checked as boolean)}
              className="h-5 w-5 rounded-full border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
            />
          </div>
          <div className="flex items-center">
            <p className="text-5xl font-bold tracking-wide">{word.original}</p>
            {word.hiragana && showHiragana && <p className="text-lg text-muted-foreground mt-2">({word.hiragana})</p>}
          </div>
          {<p className="text-xl">{showPronunciation ? `[${word.pronunciation}]` : "\u00A0"}</p>}
          {<p className="text-xl">{showMeaning ? word.meaning : " \u00A0"}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 p-6 justify-center items-center">
        <Button
          onClick={onPrev}
          disabled={isFirst}
          variant="outline"
          className="w-full rounded-xl hover:bg-primary/10 hover:text-primary"
        >
          이전
        </Button>
        <Button onClick={onNext} className="w-full rounded-xl bg-primary hover:bg-primary/90">
          {isLast ? "완료" : "다음"}
        </Button>
      </CardFooter>
    </Card>
  );
}
