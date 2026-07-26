"use client";

import { useState, useTransition } from "react";
import type { PostWithReplies } from "@/lib/types";
import { createPost, deletePost, toggleComplete } from "@/app/actions";

type PostItemProps = {
  post: PostWithReplies;
  roomId: string;
  slug?: string;
};

export function PostItem({ post, roomId, slug }: PostItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyNickname, setReplyNickname] = useState("");
  const [replyContent, setReplyContent] = useState("");
  
  // 삭제 모달 상태
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [isPending, startTransition] = useTransition();

  // 완료 상태 토글
  const handleToggleComplete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", post.id);
      formData.append("completed", (!post.completed).toString());
      if (slug) formData.append("slug", slug);

      await toggleComplete(formData);
    });
  };

  // 삭제 제출 처리
  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetId) return;
    setDeleteError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", deleteTargetId);
      formData.append("password", adminPassword);
      if (slug) formData.append("slug", slug);

      const res = await deletePost(formData);
      if (res && res.error) {
        setDeleteError(res.error);
      } else {
        setDeleteTargetId(null);
        setAdminPassword("");
      }
    });
  };

  // 답글 작성 제출
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyNickname.trim() || !replyContent.trim()) {
      alert("작성자와 내용을 모두 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("room_id", roomId);
      formData.append("parent_id", post.id);
      formData.append("nickname", replyNickname);
      formData.append("product_name", "");
      formData.append("content", replyContent);
      if (slug) formData.append("slug", slug);

      await createPost(formData);
      setReplyContent("");
      setIsReplying(false);
    });
  };

  return (
    <div
      className={`rounded-2xl border transition-all shadow-sm p-5 ${
        post.completed
          ? "bg-zinc-100 border-zinc-200 opacity-60"
          : "bg-white border-zinc-200 hover:border-zinc-300"
      }`}
    >
      {/* 상단 정보 및 버튼 */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-zinc-900 text-base">{post.nickname}</span>
            <span className="text-xs text-zinc-400">
              {new Date(post.created_at).toLocaleString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {post.completed && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                처리완료
              </span>
            )}
          </div>

          {post.product_name && (
            <div className="inline-block bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-lg border border-blue-100">
              🛒 상품: {post.product_name}
              {post.barcode && <span className="text-xs font-normal text-blue-500 ml-2">({post.barcode})</span>}
            </div>
          )}
        </div>

        {/* 우측 관리 버튼들 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleComplete}
            disabled={isPending}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shadow-sm ${
              post.completed
                ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {post.completed ? "미완료로 변경" : "처리 완료"}
          </button>

          <button
            onClick={() => {
              setDeleteTargetId(post.id);
              setAdminPassword("");
              setDeleteError("");
            }}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="mt-3 text-zinc-800 text-base whitespace-pre-wrap leading-relaxed bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-100">
        {post.content}
      </div>

      {/* 답글(진행 상황 메모) 목록 */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-zinc-200 space-y-3">
          {post.replies.map((reply) => (
            <div key={reply.id} className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span className="font-bold text-zinc-700">{reply.nickname}</span>
                  <span>
                    {new Date(reply.created_at).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-800 whitespace-pre-wrap">{reply.content}</p>
              </div>
              <button
                onClick={() => {
                  setDeleteTargetId(reply.id);
                  setAdminPassword("");
                  setDeleteError("");
                }}
                className="text-[10px] text-zinc-400 hover:text-red-600 px-1 py-0.5 shrink-0"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 답글 작성 버튼 및 입력폼 */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center">
        {!isReplying ? (
          <button
            onClick={() => setIsReplying(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            💬 진행 상황 메모 남기기
          </button>
        ) : (
          <div className="w-full bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-700">메모 작성</span>
              <button
                onClick={() => setIsReplying(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 font-bold"
              >
                닫기 ✕
              </button>
            </div>
            <form onSubmit={handleReplySubmit} className="space-y-2.5">
              <input
                type="text"
                placeholder="작성자 이름 (예: 담당자)"
                value={replyNickname}
                onChange={(e) => setReplyNickname(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
              <textarea
                placeholder="내용을 입력하세요..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow"
                >
                  메모 등록
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 관리자 비밀번호 입력 모달 */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900">관리자 삭제 확인</h3>
            <p className="text-xs text-zinc-500">삭제하려면 관리자 비밀번호를 입력해주세요.</p>
            <form onSubmit={handleDeleteSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="관리자 비밀번호"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                autoFocus
              />
              {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetId(null);
                    setAdminPassword("");
                    setDeleteError("");
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "삭제 중..." : "삭제하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
