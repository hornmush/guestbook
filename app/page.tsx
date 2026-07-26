import { createClient } from "@supabase/supabase-js";
import { PostForm } from "@/components/post-form";
import { PostList } from "@/components/post-list";

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 새로고침 없이 최신 데이터를 불러오기 위한 설정
export const revalidate = 0;

export default async function HomePage() {
  // 메인 방(main)의 게시글 전체 가져오기
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8">
      <header className="text-center space-y-2 py-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">📖 모두의 방명록</h1>
        <p className="text-gray-500 text-sm">
          자유롭게 방명록을 남기고 이웃들과 소통해 보세요!
        </p>
      </header>

      {/* 글 작성 폼 (메인 방 ID: main) */}
      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">새 방명록 쓰기</h2>
        <PostForm roomId="main" />
      </section>

      {/* 게시글 목록 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">전체 방명록 ({posts?.length || 0})</h2>
        <PostList posts={posts || []} roomId="main" />
      </section>
    </main>
  );
}
