import { PostForm } from "@/components/post-form";
import { PostList } from "@/components/post-list";
import { getPosts } from "@/lib/posts";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-zinc-800 mb-2">존재하지 않는 방입니다.</h1>
        <Link href="/" className="text-indigo-600 hover:underline text-sm">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const posts = await getPosts(room.id);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
          ← 홈으로
        </Link>
        <span className="text-xs text-zinc-400">방 주소: {slug}</span>
      </div>

      <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">POP 요청 쓰기</h2>
        <PostForm roomId={room.id} slug={slug} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900">
          전체 POP 요청 ({posts.length})
        </h2>
        <PostList posts={posts} roomId={room.id} slug={slug} />
      </section>
    </main>
  );
}
