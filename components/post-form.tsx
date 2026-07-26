"use client";

import { useState } from "react";
import { createPost } from "@/app/actions";

type PostFormProps = {
  roomId: string;
  slug?: string;
  parentId?: string;
  onCancel?: () => void;
  compact?: boolean;
};

export function PostForm({ roomId, slug, parentId, onCancel, compact }: PostFormProps) {
  const [nickname, setNickname] = useState("");
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("roomId", roomId);
    if (slug) formData.append("slug", slug);
    if (parentId) formData.append("parentId", parentId);
    formData.append("nickname", nickname);
    if (!parentId) {
      formData.append("productName", productName);
      formData.append("barcode", barcode);
      formData.append("password", password);
    }
    formData.append("content", content);

    const res = await createPost(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setNickname("");
      setProductName("");
      setBarcode("");
      setContent("");
      setPassword("");
      if (onCancel) onCancel();
    }
  };

  // 답글 작성 폼 (작성자 / 댓글만 표시)
  if (parentId) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="작성자"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <textarea
            placeholder="댓글을 남겨주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "댓글 달기"}
          </button>
        </div>
      </form>
    );
  }

  // 일반 글 작성 폼
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">요청자</label>
          <input
            type="text"
            placeholder="이름"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">삭제 비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 설정"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">상품명</label>
          <input
            type="text"
            placeholder="상품명을 입력하세요"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">바코드</label>
          <input
            type="text"
            placeholder="바코드 번호 (선택)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1">상세 요청사항</label>
        <textarea
          placeholder="상세 요청사항을 남겨주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "등록 중..." : "글 남기기"}
        </button>
      </div>
    </form>
  );
}
