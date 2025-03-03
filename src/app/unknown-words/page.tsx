"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUnknownWords } from "@/app/_hooks/use-unknown-words";

export default function UnknownWordsPage() {
  const { unknownWords, loading, handleUnknownWordChange } = useUnknownWords();
  if (loading) {
    return <div className="flex justify-center p-8">모르는 단어를 불러오는 중...</div>;
  }
  const handleRemoveWord = (wordId: string) => {
    handleUnknownWordChange(wordId, false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">모르는 단어 목록</h1>

      {unknownWords.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-4">모르는 단어가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {unknownWords.map((word) => (
            <Card key={word.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold">{word.original}</h3>
                    {word.hiragana && <p className="text-sm text-muted-foreground">{word.hiragana}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveWord(word.id)}>
                    제거
                  </Button>
                </div>
                <p className="mb-2">{word.pronunciation}</p>
                <p className="text-muted-foreground">{word.meaning}</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-secondary rounded-md text-xs">
                    {word.word_type === "noun"
                      ? "명사"
                      : word.word_type === "verb"
                      ? "동사"
                      : word.word_type === "adjective"
                      ? "형용사"
                      : word.word_type === "particle"
                      ? "조사 "
                      : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
