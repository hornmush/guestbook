import { supabase } from "@/lib/supabase";
import { ClientRoomContent } from "@/components/client-room-content"; // 아래에 만들거나 하나의 컴포넌트로 처리

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. slug로 방(room) 정보 가져오기
  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("slug", slug)
    .single();

  const roomId = room?.id || "";

  // 2. 해당 방의 전체 posts 가져오기
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. 메인 타이틀 */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">칠곡농협 POP 요청</h1>
            <p className="text-xs text-zinc-500 mt-0.5">POP 제작 요청을 남기고 처리 상태를 관리하세요.</p>
          </div>
        </div>

        {/* 2. 탭과 본문이 통합된 클라이언트 컴포넌트 호출 */}
        <ClientRoomContent initialPosts={posts || []} roomId={roomId} slug={slug} />

      </div>
    </main>
  );
}
