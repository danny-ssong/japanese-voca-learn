import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 인증된 사용자 정보 가져오기
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    redirect("/auth");
  }

  // 사용자 정보 가져오기
  const { data: userData } = await supabase.from("user").select("is_admin").eq("id", user.id).single();
  // 관리자가 아닌 경우 홈페이지로 리다이렉트
  if (!userData?.is_admin) {
    redirect("/");
  }

  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-8">관리자 페이지</h1>
      {children}
    </div>
  );
}

export const dynamic = "force-dynamic";
