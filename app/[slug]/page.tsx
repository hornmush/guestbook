import { PostList } from "@/components/post-list"; // 기존 리스트 컴포넌트 재사용 (진행중인 것만 필터링하거나 그대로 전달)
import { NavHeader } from "@/components/nav-header";
import { supabase } from "@/lib/supabase"; // 서버용 혹은 클라이언트용 설정에 맞게 조절

// 데이터베이스에서 posts를 가져오는 로직 예시
async function getPosts(slug: string) {
  // roomId나 slug로 데이터 페치
  // const { data } = ...
  return []; 
}

export default async function ListPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // const posts = await getPosts(slug);
  
  // 임시 데이터 분류
  const allPosts: any[] = []; 
  const activePosts = allPosts.filter(p => !p.completed);
  const completedPosts = allPosts.filter(p => p.completed);

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <NavHeader slug={slug} activeCount={activePosts.length} completedCount={completedPosts.length} />
      <PostList posts={activePosts} roomId="room_id_here" slug={slug} emptyMessage="진행중인 POP 요청이 없습니다." />
    </main>
  );
}
