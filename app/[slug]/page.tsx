import { PostList } from "@/components/post-list";
import { PostForm } from "@/components/post-form";
import { supabase } from "@/lib/supabase";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. slug로 현재 방(room)의 정보를 가져옵니다.
  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("slug", slug)
    .single();

  const roomId = room?.id || "";

  // 2. 해당 방의 post 목록을 가져옵니다.
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      {/* 
        [핵심] 
        바깥쪽에 따로 나와 있던 <PostForm />은 지우고, 
        아래처럼 PostList 안의 writeFormNode 속성으로 넣어주어야 
        '1. 요청 작성' 탭을 눌렀을 때만 폼이 쏙 들어와서 표시됩니다!
      */}
      <PostList 
        posts={posts || []} 
        roomId={roomId} 
        slug={slug}
        writeFormNode={<PostForm roomId={roomId} slug={slug} />}
      />
    </main>
  );
}
