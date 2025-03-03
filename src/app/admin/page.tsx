"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_components/auth-provider";
import { AdminSongList } from "@/app/admin/_components/admin-song-list";
import { toast } from "sonner";
import { getUser } from "../_lib/user-api";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { authUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function verifyAdminAccess() {
      if (authLoading) return;

      if (!authUser) {
        router.push("/auth");
        return;
      }

      try {
        const user = await getUser(authUser?.id);

        if (!user?.is_admin) {
          toast.error("접근 권한 없음", {
            description: "관리자만 접근할 수 있는 페이지입니다.",
          });
          router.push("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("관리자 상태 확인 중 오류:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    verifyAdminAccess();
  }, [authUser, authLoading, router]);

  if (authLoading || (loading && authUser)) {
    return <div className="flex justify-center p-8">권한을 확인하는 중...</div>;
  }

  if (!isAdmin) {
    return null; // 이미 리다이렉트 처리됨
  }

  return <AdminSongList />;
}
