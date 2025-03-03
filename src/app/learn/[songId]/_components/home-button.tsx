"use client";

import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function HomeButton() {
  const router = useRouter();

  return (
    <div className="fixed left-4 bottom-4 z-50">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-md hover:shadow-lg transition-all"
        onClick={() => router.push("/")}
        aria-label="홈으로 이동"
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
}
