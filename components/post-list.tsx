"use client";

import { useState, useTransition, useEffect } from "react";
import { deletePost, toggleComplete } from "@/app/actions";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  room_id: string;
  company_name?: string;
  nickname: string;
  phone?: string;
  product_name?: string;
  barcode?: string;
  weight?: string;
  regular_price?: string;
  sale_price?: string;
  promo_period?: string;
  size_quantity?: string;
  origin?: string;
  content?: string;
  completed: boolean;
  created_at: string;
};

type PostListProps = {
  posts: Post[];
  roomId: string;
  slug?: string;
};

export function PostList({ posts: initialPosts, roomId, slug }: PostListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [deletePasswordModalId, setDeletePasswordModalId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    const channel = supabase
      .channel(`room-posts-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const newPost = payload.new as Post;
          setPosts((prev) => [newPost, ...prev]);
          setHighlightedId(newPost.id);
          setTimeout(() => setHighlightedId(null), 3000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as Post;
          setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setPosts((prev) => prev.filter((p) => p.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleDelete = (postId: string) => {
    setError("");
    if (passwordInput !== "0371") {
      setError("관리자 비밀번호가 틀렸습니다.");
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
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-sm">
        아직 등록된 POP 요청이 없습니다. 첫 요청을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isHighlighted = highlightedId === post.id;

        return (
          <div
            key={post.id}
            className={`p-5 rounded-2xl border shadow-sm space-y-3 transition-all duration-700 ${
              isHighlighted
                ? "bg-amber-100 border-amber-400 scale-[1.01] shadow-md ring-2 ring-amber-300"
                : post.completed
                ? "bg-zinc-50 border-zinc-300 opacity-80"
                : "bg-white border-zinc-200"
            }`}
          >
            {/* 상단: 업체명, 신청자, 연락처, 완료/삭제 버튼 */}
            <div className="flex justify-between items-start border-b pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                    {post.company_name || "업체명 미입력"}
                  </span>
                  <span className={`font-bold text-sm ${post.completed ? "text-zinc-500 line-through" : "text-zinc-900"}`}>
                    신청자: {post.nickname} {post.phone && `(${post.phone})`}
                  </span>
                  {isHighlighted && (
                    <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                      NEW!
                    </span>
                  )}
                  {post.completed && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      처리완료
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400">
                  신청일시: {new Date(post.created_at).toLocaleString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
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

            {/* 중단: 상품 상세 정보 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-zinc-400 block">상품명</span>
                <span className="font-bold text-zinc-800 text-sm">{post.product_name || "-"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">규격 / 중량</span>
                <span className="font-semibold text-zinc-700">{post.weight || "-"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">정상가 / 행사가</span>
                <span className="font-semibold text-zinc-700">
                  {post.regular_price || "-"} / <strong className="text-red-600">{post.sale_price || "-"}</strong>
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">행사기간</span>
                <span className="font-semibold text-zinc-700">{post.promo_period || "-"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">사이즈 (종이/방향)</span>
                <span className="font-semibold text-indigo-600">{post.size_quantity || "-"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">원산지</span>
                <span className="font-semibold text-zinc-700">{post.origin || "-"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-400 block">바코드</span>
                <span className="font-mono text-zinc-600">{post.barcode || "-"}</span>
              </div>
            </div>

            {/* 하단: 비고 (기타요청사항) */}
            {post.content && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                <span className="font-bold text-amber-800">비고 및 요청사항:</span>
                <p className="text-zinc-700 whitespace-pre-wrap">{post.content}</p>
              </div>
            )}

            {/* 삭제 비밀번호 모달 */}
            {deletePasswordModalId === post.id && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                <p className="text-xs font-bold text-red-700">관리자 비밀번호를 입력하세요</p>
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
        );
      })}
    </div>
  );
}
