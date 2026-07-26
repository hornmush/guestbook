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
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🟢 FormData 대신 deletePost가 받는 형식에 맞게 직접 전달합니다.
    const res = await deletePost(post.id, password, roomId, slug);
    if (res?.error) {
      setDeleteError(res.error);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-zinc-900">{post.nickname}</span>
        <span className="text-xs text-zinc-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-zinc-700 whitespace-pre-wrap mb-3">{post.content}</p>

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-indigo-600 font-medium hover:underline"
        >
          답글
        </button>
        <button
          onClick={() => setShowDelete(!showDelete)}
          className="text-zinc-400 hover:text-zinc-600"
        >
          삭제
        </button>
      </div>

      {showDelete && (
        <form onSubmit={handleDelete} className="mt-3 flex items-center gap-2">
          <input
            type="password"
            name="password"
            placeholder="비밀번호 4자리"
            maxLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-28 rounded border border-zinc-300 px-2 py-1 text-xs"
            required
          />
          <button type="submit" className="rounded bg-red-600 px-3 py-1 text-xs text-white">
            삭제 확인
          </button>
          {deleteError && <span className="text-xs text-red-600">{deleteError}</span>}
        </form>
      )}

      {showReplyForm && (
        <PostForm
          roomId={roomId}
          slug={slug}
          parentId={post.id}
          onCancel={() => setShowReplyForm(false)}
          compact={true}
        />
      )}

      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-zinc-100 space-y-3">
          {post.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-zinc-800">{reply.nickname}</span>
                <span className="text-xs text-zinc-400">
                  {new Date(reply.createdAt).toLocaleDateString()}
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