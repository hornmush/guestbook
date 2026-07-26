"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PostWithReplies } from "@/lib/types";
import { PostItem } from "./post-item";

type PostListProps = {
  posts: PostWithReplies[];
  roomId: string;
  slug?: string;
};

export function PostList({ posts: initialPosts, roomId, slug }: PostListProps) {
  const [posts, setPosts] = useState<PostWithReplies[]>(initialPosts);
  const [newAlert, setNewAlert] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 브라우저 탭 깜빡임 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (newAlert) {
      let toggle = false;
      interval = setInterval(() => {
        document.title = toggle ? "🚨 [새 요청 도착!] - POP 시스템" : "🛒 [확인해주세요!] - POP 시스템";
        toggle = !toggle;
      }, 1000);
    } else {
      document.title = "POP 요청 시스템";
    }

    return () => {
      if (interval) clearInterval(interval);
      document.title = "POP 요청 시스템";
    };
  }, [newAlert]);

  // Supabase 실시간 감지 (새 글 등록 및 삭제 즉시 반영)
  useEffect(() => {
    const channel = supabase
      .channel(`room-realtime-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newPost = payload.new as PostWithReplies;

          setPosts((prevPosts) => {
            if (!newPost.parent_id) {
              return [{ ...newPost, replies: [] }, ...prevPosts];
            } else {
              return prevPosts.map((post) => {
                if (post.id === newPost.parent_id) {
                  return {
                    ...post,
                    replies: [...(post.replies || []), newPost],
                  };
                }
                return post;
              });
            }
          });

          setNewAlert(true); // 알림 배너 및 탭 깜빡임 시작
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const deletedId = payload.old.id;

          setPosts((prevPosts) => {
            const filtered = prevPosts.filter((p) => p.id !== deletedId);
            return filtered.map((post) => ({
              ...post,
              replies: (post.replies || []).filter((r) => r.id !== deletedId),
            }));
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm bg-white rounded-2xl border border-zinc-200 shadow-sm">
        아직 등록된 POP 요청이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* 새 글 등록 시 나타나는 강력한 반짝임 알림 배너 */}
      {newAlert && (
        <div className="sticky top-4 z-50 bg-red-600 text-white text-base font-extrabold py-4 px-5 rounded-xl shadow-2xl flex items-center justify-between border-4 border-yellow-300 animate-bounce">
          <span>🚨 새로운 POP 요청이 등록되었습니다! 확인해주세요! 🛒</span>
          <button
            onClick={() => setNewAlert(false)}
            className="text-xs bg-yellow-400 text-red-900 font-bold hover:bg-yellow-300 px-3 py-1.5 rounded-lg shadow"
          >
            확인함 (끄기)
          </button>
        </div>
      )}

      {posts.map((post) => (
        <PostItem key={post.id} post={post} roomId={roomId} slug={slug} />
      ))}
    </div>
  );
}
