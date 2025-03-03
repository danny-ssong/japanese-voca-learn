import LearnClient from "./_components/learn-client";
import { HomeButton } from "./_components/home-button";
import { fetchSongs } from "@/app/_lib/song-api";
import { fetchWords } from "@/app/_lib/word-api";

export const revalidate = 3600; // 1시간마다 재검증

export async function generateStaticParams() {
  const { data: songs } = await fetchSongs();
  return [{ songId: "all" }, ...(songs?.map((song) => ({ songId: song.id })) || [])];
}
type tParams = Promise<{ songId: string }>;

export default async function LearnPage({ params }: { params: tParams }) {
  const songId = (await params).songId;

  const { data: songsData } = await fetchSongs();
  const songs = songsData?.sort((a, b) => a.title_korean.localeCompare(b.title_korean, "ko")) || [];
  const { data: words } = await fetchWords(songId);

  return (
    <div className="container mx-auto px-4 py-8">
      <HomeButton />
      <LearnClient initialWords={words || []} songs={songs || []} currentSongId={songId} />
    </div>
  );
}
