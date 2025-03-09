"use client";

import { Sentence } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SentenceCardProps {
  sentence: Sentence;
  currentIndex: number;
  totalSentences: number;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  showMeaning: boolean;
  showPronunciation: boolean;
}

export function SentenceCard({
  sentence,
  currentIndex,
  totalSentences,
  onNext,
  onPrev,
  isFirst,
  isLast,
  showMeaning,
  showPronunciation,
}: SentenceCardProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <div className="text-sm text-muted-foreground">
          문장 {currentIndex + 1} / {totalSentences}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">{sentence.original}</div>

          {showPronunciation && <div className="text-lg text-muted-foreground mb-4">{sentence.pronunciation}</div>}

          {showMeaning && <div className="text-xl">{sentence.meaning}</div>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="icon" onClick={onPrev} disabled={isFirst}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={onNext} disabled={isLast}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
