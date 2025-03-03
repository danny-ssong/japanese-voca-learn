import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Song } from "@/types";

export async function SongCardList({ songs }: { songs: Song[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link href={`/learn/all`} key="all-songs">
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-2">모든 노래</h3>
          <p className="text-lg text-muted-foreground">&nbsp;</p>
        </Card>
      </Link>

      {songs.map((song) => (
        <Link href={`/learn/${song.id}`} key={song.id}>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <h3 className="text-lg font-bold mb-2 truncate">{song.title_korean}</h3>
            <p className="text-lg text-muted-foreground truncate">{song.title}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
