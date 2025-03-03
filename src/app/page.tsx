import { SongCardList } from "@/app/_components/song-card-list";
import { Header } from "@/app/_components/header";
import { fetchSongs } from "@/app/_lib/song-api";

export default async function HomePage() {
  const { data: songsData, error } = await fetchSongs();

  const songs = songsData?.sort((a, b) => a.title_korean.localeCompare(b.title_korean, "ko")) || [];

  if (error) {
    console.error("Error fetching songs:", error);
    return <div className="flex justify-center p-8">데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="mx-auto px-4 py-6 ">
      <Header />
      <SongCardList songs={songs} />
    </div>
  );
}
