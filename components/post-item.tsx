"use client";

import { useState } from "react";
import type { PostWithReplies } from "@/lib/types";
import { PostForm } from "./post-form";
import { deletePost, toggleComplete } from "@/app/actions";

type PostItemProps = {
  post: PostWithReplies;
  roomId: string;
  slug?: string;
};

export function PostItem({ post, roomId, slug }: PostItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 완료 상태 토글 핸들러
  const handleToggleComplete = async () => {
    const formData = new FormData();
    formData.append("postId", post.id);
    formData.append("completed", (!post.completed).toString());
    if (slug) formData.append("slug", slug);

    await toggleComplete(formData);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetId) return;
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("postId", deleteTargetId);
    formData.append("password", password);
    if (slug) formData.append("slug", slug);

    const res = await deletePost(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setDeleteTargetId(null);
      setPassword("");
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-colors ${
        post.completed
          ? "bg-emerald-50/50 border-emerald-300"
          : "bg-white border-zinc-200"
      }`}
    >
      {/* 메인 게시글 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 text-base">{post.nickname}</span>
            {post.completed && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                ✔ 작업 완료
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
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md">
              상품명: {post.product_name}
            </span>
            {post.barcode && (
              <span className="bg-zinc-100 text-zinc-600 text-xs px-2.5 py-1 rounded-md font-mono">
                바코드: {post.barcode}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 관리자 완료 체크 버튼 */}
          <button
            onClick={handleToggleComplete}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              post.completed
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {post.completed ? "완료 취소" : "완료 체크"}
          </button>

          <button
            onClick={() => setDeleteTargetId(post.id)}
            className="text-xs text-zinc-400 hover:text-red-600 px-2 py-1 rounded transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 상세 요청사항 */}
      <div
        className={`text-sm whitespace-pre-wrap p-4 rounded-xl border ${
          post.completed
            ? "bg-emerald-50/80 border-emerald-200 text-zinc-700 line-through decoration-zinc-400"
            : "bg-zinc-50 border-zinc-100 text-zinc-800"
        }`}
      >
        {post.content}
      </div>

      {/* 답글 목록 */}
      {post.replies && post.replies.length > 0 && (
        <div className="space-y-3 pl-4 border-l-2 border-indigo-100 mt-4 pt-2">
          {post.replies.map((reply) => (
            <div key={reply.id} className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">{reply.nickname}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">
                    {new Date(reply.created_at).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => setDeleteTargetId(reply.id)}
                    className="text-[10px] text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-700 whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 답글 달기 버튼 및 폼 */}
      <div className="pt-2 flex flex-col items-end">
        {!showReplyForm ? (
          <button
            onClick={() => setShowReplyForm(true)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            💬 댓글 달기
          </button>
        ) : (
          <div className="w-full mt-2">
            <PostForm
              roomId={roomId}
              slug={slug}
              parentId={post.id}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* 삭제 비밀번호 입력 모달 */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900">
              {deleteTargetId === post.id ? "게시글 삭제" : "댓글 삭제"}
            </h3>
            <p className="text-xs text-zinc-500">글 작성 시 설정했던 비밀번호를 입력해주세요.</p>
            <form onSubmit={handleDelete} className="space-y-3">
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                autoFocus
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetId(null);
                    setPassword("");
                    setError("");
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "삭제 중..." : "삭제하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
