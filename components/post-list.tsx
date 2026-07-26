"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // 서버에서 데이터가 갱신될 때 상태 동기화
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 새 글이 등록되면 브라우저 탭 제목을 번갈아 깜빡이게 하는 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (newAlert) {
      let toggle = false;
      const originalTitle = document.title;
      interval = setInterval(() => {
        document.title = toggle ? "🚨 [새 요청 도착!] - POP 시스템" : "🛒 [확인해주세요!] - POP 시스템";
        toggle = !toggle;
      }, 1000); // 1초마다 번갈아 변경
    } else {
      document.title = "POP 요청 시스템";
    }

    return () => {
      if (interval) clearInterval(interval);
      document.title = "POP 요청 시스템";
    };
  }, [newAlert]);

  // Supabase 실시간(Realtime) 구독 설정
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
        () => {
          setNewAlert(true); // 탭 깜빡임 및 상단 배너 활성화
          router.refresh(); // 최신 데이터로 화면 새로고침
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, router]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm bg-white rounded-2xl border border-zinc-200 shadow-sm">
        아직 등록된 POP 요청이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* 새 글 등록 시 나타나는 눈에 띄는 상단 알림 배너 */}
      {newAlert && (
        <div className="sticky top-4 z-50 bg-indigo-600 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-2xl flex items-center justify-between border-2 border-white animate-pulse">
          <span>🚨 새로운 POP 요청이 도착했습니다! 확인해주세요! 🛒</span>
          <button
            onClick={() => setNewAlert(false)}
            className="text-xs bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-400"
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
