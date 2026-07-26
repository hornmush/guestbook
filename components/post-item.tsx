"use client";

import { useState } from "react";
import { PostForm } from "./post-form";
import { deletePost } from "@/app/actions";

export interface Post {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
  replies?: Post[];
}

interface PostItemProps {
  post: Post;
  roomId: string;
}

export function PostItem({ post, roomId }: PostItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 글 삭제 함수
  const handleDelete = async () => {
    if (!passwordInput.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    setIsDeleting(true);
    const res = await deletePost(post.id, passwordInput);
    setIsDeleting(false);

    if (res.success) {
      alert("게시글이 삭제되었습니다.");
      setShowDeleteInput(false);
      setPasswordInput("");
    } else {
      alert(res.message || "삭제에 실패했습니다.");
    }
  };

  return (
    <article className="p-4 rounded-lg border bg-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">{post.nickname}</span>
        <span className="text-xs text-gray-400">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

      {/* 답글 달기 및 삭제 버튼 */}
      <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t">
        <button
          onClick={() => {
            setShowReplyForm(!showReplyForm);
            setShowDeleteInput(false);
          }}
          className="text-blue-500 hover:underline"
        >
          {showReplyForm ? "답글 취소" : "답글 달기"}
        </button>

        <button
          onClick={() => {
            setShowDeleteInput(!showDeleteInput);
            setShowReplyForm(false);
          }}
          className="text-red-400 hover:text-red-600 hover:underline"
        >
          {showDeleteInput ? "삭제 취소" : "삭제"}
        </button>
      </div>

      {/* 삭제 비밀번호 입력란 */}
      {showDeleteInput && (
        <div className="pt-2 flex items-center gap-2 bg-gray-50 p-2 rounded">
          <input
            type="password"
            placeholder="글 비밀번호 또는 관리자 비번"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border rounded px-2 py-1 text-xs flex-1 bg-white"
          />
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? "삭제 중..." : "확인"}
          </button>
        </div>
      )}

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="pt-2 border-t mt-2">
          <PostForm
            roomId={roomId}
            parentId={post.id}
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* 답글 목록 */}
      {post.replies && post.replies.length > 0 ? (
        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
          {post.replies.map((reply) => (
            <PostItem key={reply.id} post={reply} roomId={roomId} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default PostItem;