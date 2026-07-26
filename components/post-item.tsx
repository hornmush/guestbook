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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-zinc-500">요청자:</span>
          <span className="font-bold text-zinc-900">{post.nickname}</span>
        </div>
        <span className="text-xs text-zinc-400">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-zinc-700 whitespace-pre-wrap mb-3">{post.content}</p>

      <div className="flex items-center justify-between text-xs">
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
        <div className="mt-3">
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
            <div key={reply.id} className="text-sm">
              <div className="flex items-center justify-between mb-1">
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
