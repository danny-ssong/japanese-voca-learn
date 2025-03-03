"use client";

import { Button } from "@/components/ui/button";

interface LearnHeaderProps {
  currentIndex: number;
  totalWords: number;
  onShowUnknownWords: () => void;
}

export function LearnHeader({ currentIndex, totalWords, onShowUnknownWords }: LearnHeaderProps) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-bold">단어</h1>
        <p className="text-sm text-muted-foreground">
          ({currentIndex + 1} / {totalWords})
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onShowUnknownWords}>
          모르는 단어 보기
        </Button>
      </div>
    </div>
  );
}
