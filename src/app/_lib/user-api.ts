import { createClient } from "@/util/supabase/client";
import { User } from "@/types";

export async function getUser(userId: string): Promise<User | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from("user").select("*").eq("id", userId).single();

    if (error) {
      console.error("사용자 정보 조회 중 오류:", error);
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error("사용자 정보 조회 중 오류:", error);
    return null;
  }
}
