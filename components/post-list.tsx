"use client";

import { useState, useTransition } from "react";
import { deletePost } from "@/app/actions";
import { PostForm } from "@/components/post-form";
import type { PostWithReplies } from "@/lib/types";

type PostListProps = {
  posts: PostWithReplies[];
  roomId: string;
  slug?: string;
};

export function PostList({ posts, roomId, slug }: PostListProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [deletePasswordModalId, setDeletePasswordModalId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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
      }
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
        <div key={post.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
          {/* 게시글 상단 정보 */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-sm">{post.nickname}</span>
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

            <button
              onClick={() => {
                setDeletePasswordModalId(post.id);
                setPasswordInput("");
                setError("");
              }}
              className="text-xs text-zinc-400 hover:text-red-600 transition"
            >
              삭제
            </button>
          </div>

          {/* 내용 */}
          <p className="text-zinc-700 text-sm whitespace-pre-wrap leading-relaxed bg-zinc-50 p-3 rounded-xl">
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

          {/* 대댓글 영역 */}
          <div className="mt-4 pt-3 border-t border-zinc-100 space-y-3 pl-4 border-l-2 border-indigo-100">
            {post.replies && post.replies.length > 0 && (
              <div className="space-y-2">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="bg-zinc-50 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-900">{reply.nickname}</span>
                      <span className="text-zinc-400">
                        {new Date(reply.created_at).toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-700 text-xs whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 답글 작성 버튼 및 폼 */}
            {replyingToId === post.id ? (
              <div className="pt-2">
                <PostForm
                  roomId={roomId}
                  slug={slug}
                  parentId={post.id}
                  onCancel={() => setReplyingToId(null)}
                />
              </div>
            ) : (
              <button
                onClick={() => setReplyingToId(post.id)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                💬 답글 남기기
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
