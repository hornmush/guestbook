"use client";

import { useState } from "react";
import type { PostWithReplies } from "@/lib/types";
import { PostForm } from "./post-form";
import { deletePost } from "@/app/actions";

type PostItemProps = {
  post: PostWithReplies;
  roomId: string;
  slug?: string;
};

export function PostItem({ post, roomId, slug }: PostItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append("postId", post.id);
    if (slug) formData.append("slug", slug);

    const res = await deletePost(formData);
    if (res?.error) {
      setDeleteError(res.error);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
      {/* 상단: 요청자 및 작성일 */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-zinc-500">요청자:</span>
          <span className="font-bold text-zinc-900">{post.nickname}</span>
        </div>
        <span className="text-xs text-zinc-400">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* 상품 정보 (상품명 & 바코드) */}
      <div className="bg-zinc-50 rounded-xl p-3 space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">상품명</span>
          <span className="font-bold text-zinc-900">{post.product_name}</span>
        </div>
        {post.barcode && (
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="text-zinc-400 font-medium">바코드:</span>
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200">{post.barcode}</span>
          </div>
        )}
      </div>

      {/* 상세 요청사항 */}
      <div>
        <span className="block text-xs font-semibold text-zinc-400 mb-1">상세 요청사항</span>
        <p className="text-sm text-zinc-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-indigo-600 font-medium hover:underline"
        >
          답글
        </button>
        <button
          onClick={handleDelete}
          className="text-zinc-400 hover:text-red-600"
        >
          삭제
        </button>
      </div>

      {deleteError && <p className="text-xs text-red-600 mt-2">{deleteError}</p>}

      {showReplyForm && (
        <div className="mt-3 pt-3 border-t border-zinc-100">
          <PostForm
            roomId={roomId}
            slug={slug}
            parentId={post.id}
            onCancel={() => setShowReplyForm(false)}
            compact={true}
          />
        </div>
      )}

      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-zinc-100 space-y-3">
          {post.replies.map((reply) => (
            <div key={reply.id} className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-zinc-500">요청자:</span>
                  <span className="font-bold text-zinc-800">{reply.nickname}</span>
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(reply.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-zinc-600">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
