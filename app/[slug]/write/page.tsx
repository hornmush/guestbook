import { NavHeader } from "@/components/nav-header";
import { PostForm } from "@/components/post-form"; // <-- post-form으로 변경

export default async function WritePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <NavHeader slug={slug} activeCount={0} completedCount={0} />
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-800 text-base border-b pb-2">신규 POP 제작 요청서 작성</h3>
        <PostForm roomId="room_id_here" slug={slug} />
      </div>
    </main>
  );
}
