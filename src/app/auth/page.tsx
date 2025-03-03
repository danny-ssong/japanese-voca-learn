import { AuthForm } from "@/app/auth/_components/auth-form";

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-8">아이묭 노래 단어 학습</h1>
      <AuthForm />
    </div>
  );
}
