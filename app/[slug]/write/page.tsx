import { NavHeader } from "@/components/nav-header";
import { PostWriteForm } from "@/components/post-write-form";

export default async function WritePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // 전체 개수 산출을 위한 데이터 패치 로직 필요시 추가
  const activeCount = 0;
  const completedCount = 0;

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <NavHeader slug={slug} activeCount={activeCount} completedCount={completedCount} />
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 text-base border-b pb-2">신규 POP 제작 요청서 작성</h3>
        <PostWriteForm roomId="room_id_here" slug={slug} />
      </div>
    </main>
  );
}
