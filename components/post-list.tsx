import type { PostWithReplies } from "@/lib/types";
import { PostItem } from "@/components/post-item";

type PostListProps = {
  posts: PostWithReplies[];
  roomId: string;
  slug: string;
};

export function PostList({ posts, roomId, slug }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">아직 남겨진 글이 없습니다. 첫 번째 방명록을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} roomId={roomId} slug={slug} />
      ))}
    </div>
  );
}
