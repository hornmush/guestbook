"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/app/actions";

type PostFormProps = {
  roomId: string;
  slug?: string;
  parentId?: string | null;
  onCancel?: () => void;
};

export function PostForm({ roomId, slug, parentId, onCancel }: PostFormProps) {
  const [nickname, setNickname] = useState("");
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim() || !content.trim()) {
      setError("작성자와 내용은 필수 입력 항목입니다.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("room_id", roomId);
      if (parentId) formData.append("parent_id", parentId);
      formData.append("nickname", nickname);
      formData.append("product_name", productName);
      formData.append("barcode", barcode);
      formData.append("content", content);
      if (slug) formData.append("slug", slug);

      const res = await createPost(formData);

      if (res && res.error) {
        setError(res.error);
      } else {
        setNickname("");
        setProductName("");
        setBarcode("");
        setContent("");
        if (onCancel) onCancel();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">작성자 / 부서</label>
          <input
            type="text"
            placeholder="예: 홍길동 (식품팀)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">상품명</label>
          <input
            type="text"
            placeholder="예: 한라봉 1.5kg"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">바코드 (선택)</label>
          <input
            type="text"
            placeholder="바코드 번호"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">요청 내용 / POP 문구</label>
        <textarea
          placeholder="만들어야 할 POP 내용을 상세히 적어주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          required
        />
      </div>

      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          {isPending ? "등록 중..." : "POP 요청 등록하기"}
        </button>
      </div>
    </form>
  );
}
