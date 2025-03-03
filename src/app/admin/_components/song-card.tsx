"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type { Song } from "@/types";

interface SongCardProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
}

export function SongCard({ song, onEdit, onDelete }: SongCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="text-lg font-bold">{song.title}</h4>
        {song.title_korean && <p className="text-sm text-muted-foreground">{song.title_korean}</p>}
        <p className="text-xs text-muted-foreground mt-2">
          수정된 날짜: {song.updated_at ? new Date(song.updated_at).toLocaleDateString() : "날짜 없음"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(song)}>
            수정
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(song.id)}>
            삭제
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/words/${song.id}`)}>
          단어 관리
        </Button>
      </CardFooter>
    </Card>
  );
}
