"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/util/supabase/client";
import type { Song } from "@/types";

interface SongFormProps {
  initialSong?: Partial<Song>;
  onSuccess: () => void;
  onCancel?: () => void;
  mode: "add" | "edit";
}

export function SongForm({ initialSong, onSuccess, onCancel, mode }: SongFormProps) {
  const [song, setSong] = useState<Partial<Song>>(
    initialSong || {
      title: "",
      title_korean: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function handleSubmit() {
    if (!song.title?.trim()) {
      toast.error("제목 필수", {
        description: "노래 제목을 입력해주세요.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        const { error } = await supabase.from("song").insert({
          title: song.title,
          title_korean: song.title_korean || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast.success("노래 추가 성공", {
          description: "새 노래가 추가되었습니다.",
        });
      } else if (mode === "edit" && song.id) {
        const { error } = await supabase
          .from("song")
          .update({
            title: song.title,
            title_korean: song.title_korean || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", song.id);

        if (error) throw error;

        toast.success("노래 수정 성공", {
          description: "노래 정보가 수정되었습니다.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error(mode === "add" ? "노래 추가 실패:" : "노래 수정 실패:", error);
      toast.error(mode === "add" ? "노래 추가 실패" : "노래 수정 실패", {
        description:
          mode === "add" ? "노래를 추가하는 중 오류가 발생했습니다." : "노래를 수정하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold mb-4">{mode === "add" ? "새 노래 추가" : "노래 수정"}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium block mb-1">
              제목(일본어)
            </label>
            <Input
              id="title"
              value={song.title}
              onChange={(e) => setSong({ ...song, title: e.target.value })}
              placeholder="노래 제목"
            />
          </div>
          <div>
            <label htmlFor="title_korean" className="text-sm font-medium block mb-1">
              제목(한국어)
            </label>
            <Input
              id="title_korean"
              value={song.title_korean || ""}
              onChange={(e) => setSong({ ...song, title_korean: e.target.value })}
              placeholder="노래 제목(한국어)"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {mode === "add" ? "노래 추가" : "저장"}
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
