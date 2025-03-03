"use client";

import { useState } from "react";
import { useAuth } from "@/app/_components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("로그인 성공", {
          description: "환영합니다!",
        });
        router.push("/");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success("회원가입 성공", {
          description: "이메일을 확인하여 계정을 활성화해주세요.",
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(mode === "signin" ? "로그인 실패" : "회원가입 실패", {
          description: error.message,
        });
      } else {
        toast.error(mode === "signin" ? "로그인 실패" : "회원가입 실패");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "signin" ? "로그인" : "회원가입"}</CardTitle>
        <CardDescription>
          {mode === "signin" ? "계정에 로그인하여 단어 학습을 시작하세요." : "새 계정을 만들어 단어 학습을 시작하세요."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={toggleMode}>
            {mode === "signin" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
