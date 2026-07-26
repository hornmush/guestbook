import { supabase } from "@/lib/supabase";
import { PostList } from "@/components/post-list";
import { PostForm } from "@/components/post-form";
import type { PostWithReplies } from "@/lib/types";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoomPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. 방 정보 조회
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!room) {
    notFound();
  }

  // 2. 해당 방의 모든 글(부모글 + 답글) 가져오기
  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("room_id", room.id)
    .order("created_at", { ascending: false });

  // 3. 부모글과 답글을 분리한 뒤, 부모글의 replies에 답글 연결
  const parentPosts = rawPosts?.filter((p) => !p.parent_id) || [];
  const allReplies = rawPosts?.filter((p) => p.parent_id) || [];

  const posts: PostWithReplies[] = parentPosts.map((post) => ({
    ...post,
    replies: allReplies
      .filter((r) => r.parent_id === post.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  }));

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">🛒 POP 요청 시스템</h1>
          <p className="text-xs text-zinc-500 mt-1">
            빈칸에 요청사항 기재해주시고 처리완료되면 사무실로 받으러 오시면 됩니다
          </p>
        </div>
        <PostForm roomId={room.id} slug={slug} />
      </div>

      <PostList posts={posts} roomId={room.id} slug={slug} />
    </main>
  );
}
