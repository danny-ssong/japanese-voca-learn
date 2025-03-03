"use client";

import { useRouter } from "next/navigation";
import { Song, Word } from "@/types";
import { useLearnState } from "@/app/_hooks/use-learn-state";
import { LearnView } from "@/app/learn/[songId]/_components/learn-view";

interface LearnContainerProps {
  initialWords: Word[];
  songs: Song[];
  currentSongId: string;
}

export default function LearnContainer({ initialWords, songs, currentSongId }: LearnContainerProps) {
  // ... 기존 코드 유지
}
