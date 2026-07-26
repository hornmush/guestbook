import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { PostList } from "@/components/post-list";
import { buildPostTree } from "@/lib/posts";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";

type RoomPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, slug, created_at")
    .eq("slug", slug)
    .single();

  if (roomError || !room) {
    notFound();
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, room_id, parent_id, nickname, content, created_at")
    .eq("room_id", room.id)
    .order("created_at", { ascending: true });

  if (postsError) {
    throw new Error("게시글을 불러오지 못했습니다.");
  }

  const postTree = buildPostTree((posts ?? []) as Post[]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          ← 홈으로
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          방명록
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          이 페이지 링크를 공유하면 누구나 글을 남길 수 있습니다.
        </p>
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            공유 링크
          </p>
          <p className="mt-1 break-all font-mono text-sm text-zinc-800">
            /room/{room.slug}
          </p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">글 남기기</h2>
        <PostForm roomId={room.id} slug={room.slug} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          방명록 ({posts?.length ?? 0})
        </h2>
        <PostList posts={postTree} roomId={room.id} slug={room.slug} />
      </section>
    </div>
  );
}
