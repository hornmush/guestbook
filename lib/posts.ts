import type { Post, PostWithReplies } from "@/lib/types";

export function buildPostTree(posts: Post[]): PostWithReplies[] {
  const map = new Map<string, PostWithReplies>();

  for (const post of posts) {
    map.set(post.id, { ...post, replies: [] });
  }

  const roots: PostWithReplies[] = [];

  for (const post of posts) {
    const node = map.get(post.id)!;

    if (post.parent_id) {
      map.get(post.parent_id)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
