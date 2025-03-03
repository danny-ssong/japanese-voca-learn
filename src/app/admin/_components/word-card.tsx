"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Word } from "@/types";

interface WordCardProps {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}

export function WordCard({ word, onEdit, onDelete, onMove, isFirst, isLast }: WordCardProps) {
  const wordTypeLabel =
    word.word_type === "noun"
      ? "명사"
      : word.word_type === "verb"
      ? "동사"
      : word.word_type === "adjective"
      ? "형용사"
      : "조사";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="text-lg font-bold">{word.original}</h4>
            {word.hiragana && <p className="text-sm text-muted-foreground">{word.hiragana}</p>}
          </div>
          <span className="px-2 py-1 bg-secondary rounded-md text-xs">{wordTypeLabel}</span>
        </div>
        <p className="mb-1">
          <span className="text-sm font-medium">발음:</span> {word.pronunciation}
        </p>
        <p>
          <span className="text-sm font-medium">뜻:</span> {word.meaning}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(word)}>
            수정
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(word.id)}>
            삭제
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onMove(word.id, "up")} disabled={isFirst}>
            ↑
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onMove(word.id, "down")} disabled={isLast}>
            ↓
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
