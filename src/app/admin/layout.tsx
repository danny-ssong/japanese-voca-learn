export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-8">관리자 페이지</h1>
      {children}
    </div>
  );
}

export const dynamic = "force-dynamic";
