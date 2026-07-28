import { PostList } from "@/components/post-list";
import { NavHeader } from "@/components/nav-header";

export default async function CompletedPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  const allPosts: any[] = [];
  const activePosts = allPosts.filter(p => !p.completed);
  const completedPosts = allPosts.filter(p => p.completed);

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <NavHeader slug={slug} activeCount={activePosts.length} completedCount={completedPosts.length} />
      <PostList posts={completedPosts} roomId="room_id_here" slug={slug} emptyMessage="완료된 POP 요청이 없습니다." />
    </main>
  );
}
