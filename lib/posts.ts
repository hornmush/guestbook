import { supabase } from "@/lib/supabase";
import type { Post, PostWithReplies } from "@/lib/types";

export async function getPosts(roomId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  const posts = data as Post[];
  const map = new Map<string, PostWithReplies>();
  const roots: PostWithReplies[] = [];

  posts.forEach((post) => {
    const node: PostWithReplies = { ...post, replies: [] };
    map.set(post.id, node);
  });

  posts.forEach((post) => {
    const node = map.get(post.id);
    if (!node) return;

    if (post.parent_id) {
      const parent = map.get(post.parent_id);
      if (parent) {
        if (!parent.replies) {
          parent.replies = [];
        }
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
