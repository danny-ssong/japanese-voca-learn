"use client";

import Link from "next/link";
import { useAuth } from "@/app/_components/auth-provider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { authUser, signOut, loading } = useAuth();

  return (
    <header className="py-4 mb-6 border-b">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          아이묭 노래 단어 학습
        </Link>
        <nav>
          {!loading &&
            (authUser ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{authUser.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm">로그인</Button>
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
