"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/util/supabase/client";
import type { Word } from "@/types";

interface WordFormProps {
  songId: string;
  initialWord?: Partial<Word>;
  onSuccess: () => void;
  onCancel?: () => void;
  mode: "add" | "edit";
}

export function WordForm({ songId, initialWord, onSuccess, onCancel, mode }: WordFormProps) {
  const [word, setWord] = useState<Partial<Word>>(
    initialWord || {
      original: "",
      hiragana: "",
      pronunciation: "",
      meaning: "",
      word_type: "noun",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function handleSubmit() {
    if (!word.original || !word.pronunciation || !word.meaning) {
      toast.error("필수 정보 누락", {
        description: "원어, 발음, 뜻은 필수 입력 항목입니다.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        const { error } = await supabase.from("word").insert({
          song_id: songId,
          original: word.original,
          hiragana: word.hiragana || null,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          word_type: word.word_type || "noun",
        });

        if (error) throw error;

        toast.success("단어 추가 성공", {
          description: "새 단어가 추가되었습니다.",
        });
      } else if (mode === "edit" && word.id) {
        const { error } = await supabase
          .from("word")
          .update({
            original: word.original,
            hiragana: word.hiragana || null,
            pronunciation: word.pronunciation,
            meaning: word.meaning,
            word_type: word.word_type,
          })
          .eq("id", word.id);

        if (error) throw error;

        toast.success("단어 수정 성공", {
          description: "단어 정보가 수정되었습니다.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error(mode === "add" ? "단어 추가 실패:" : "단어 수정 실패:", error);
      toast.error(mode === "add" ? "단어 추가 실패" : "단어 수정 실패", {
        description:
          mode === "add" ? "단어를 추가하는 중 오류가 발생했습니다." : "단어를 수정하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold mb-4">{mode === "add" ? "새 단어 추가" : "단어 수정"}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="original" className="text-sm font-medium block mb-1">
              원어 *
            </label>
            <Input
              id="original"
              value={word.original}
              onChange={(e) => setWord({ ...word, original: e.target.value })}
              placeholder="원어"
            />
          </div>
          <div>
            <label htmlFor="hiragana" className="text-sm font-medium block mb-1">
              히라가나 (선택사항)
            </label>
            <Input
              id="hiragana"
              value={word.hiragana || ""}
              onChange={(e) => setWord({ ...word, hiragana: e.target.value })}
              placeholder="히라가나"
            />
          </div>
          <div>
            <label htmlFor="pronunciation" className="text-sm font-medium block mb-1">
              발음 *
            </label>
            <Input
              id="pronunciation"
              value={word.pronunciation || ""}
              onChange={(e) => setWord({ ...word, pronunciation: e.target.value })}
              placeholder="발음"
            />
          </div>
          <div>
            <label htmlFor="meaning" className="text-sm font-medium block mb-1">
              뜻 *
            </label>
            <Input
              id="meaning"
              value={word.meaning}
              onChange={(e) => setWord({ ...word, meaning: e.target.value })}
              placeholder="뜻"
            />
          </div>
          <div>
            <label htmlFor="wordType" className="text-sm font-medium block mb-1">
              품사
            </label>
            <Select
              value={word.word_type}
              onValueChange={(value) => setWord({ ...word, word_type: value as Word["word_type"] })}
            >
              <SelectTrigger id="wordType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="noun">명사</SelectItem>
                <SelectItem value="verb">동사</SelectItem>
                <SelectItem value="adjective">형용사</SelectItem>
                <SelectItem value="particle">조사</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {mode === "add" ? "단어 추가" : "저장"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
