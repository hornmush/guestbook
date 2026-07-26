"use client";

import { useState, useTransition, useEffect } from "react";
import { deletePost, toggleComplete } from "@/app/actions";
import type { PostWithReplies } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type PostListProps = {
  posts: PostWithReplies[];
  roomId: string;
  slug?: string;
};

export function PostList({ posts: initialPosts, roomId, slug }: PostListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithReplies[]>(initialPosts);
  const [deletePasswordModalId, setDeletePasswordModalId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 🌟 실시간 데이터 자동 반영 (Realtime)
  useEffect(() => {
    const channel = supabase
      .channel(`room-posts-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, router]);

  const handleDelete = (postId: string) => {
    setError("");
    if (passwordInput !== "0371") {
      setError("관리자 비밀번호가 틀렸습니다. (비밀번호: 0371)");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("password", passwordInput);
      if (slug) formData.append("slug", slug);

      const res = await deletePost(formData);
      if (res && res.error) {
        setError(res.error);
      } else {
        setDeletePasswordModalId(null);
        setPasswordInput("");
        router.refresh();
      }
    });
  };

  const handleToggleComplete = (postId: string, currentCompleted: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("completed", String(!currentCompleted));
      if (slug) formData.append("slug", slug);

      await toggleComplete(formData);
      router.refresh();
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-sm">
        아직 등록된 요청이 없습니다. 첫 요청을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`p-5 rounded-2xl border shadow-sm space-y-3 transition ${
            post.completed ? "bg-zinc-50 border-zinc-300 opacity-80" : "bg-white border-zinc-200"
          }`}
        >
          {/* 게시글 상단 정보 */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${post.completed ? "text-zinc-500 line-through" : "text-zinc-900"}`}>
                  {post.nickname}
                </span>
                {post.completed && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    처리완료
                  </span>
                )}
                <span className="text-xs text-zinc-400">
                  {new Date(post.created_at).toLocaleString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {post.product_name && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                    {post.product_name}
                  </span>
                  {post.barcode && <span className="text-zinc-400">바코드: {post.barcode}</span>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 처리완료 버튼 */}
              <button
                onClick={() => handleToggleComplete(post.id, post.completed)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                  post.completed
                    ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                }`}
              >
                {post.completed ? "완료취소" : "처리완료"}
              </button>

              <button
                onClick={() => {
                  setDeletePasswordModalId(post.id);
                  setPasswordInput("");
                  setError("");
                }}
                className="text-xs text-zinc-400 hover:text-red-600 transition px-1"
              >
                삭제
              </button>
            </div>
          </div>

          {/* 내용 */}
          <p
            className={`text-sm whitespace-pre-wrap leading-relaxed p-3 rounded-xl ${
              post.completed ? "bg-zinc-100 text-zinc-500 line-through" : "bg-zinc-50 text-zinc-700"
            }`}
          >
            {post.content}
          </p>

          {/* 삭제 비밀번호 모달/입력창 */}
          {deletePasswordModalId === post.id && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
              <p className="text-xs font-bold text-red-700">관리자 비밀번호를 입력하세요 (0371)</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm bg-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={isPending}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition"
                >
                  삭제확인
                </button>
                <button
                  onClick={() => setDeletePasswordModalId(null)}
                  className="bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-300 transition"
                >
                  취소
                </button>
              </div>
              {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
