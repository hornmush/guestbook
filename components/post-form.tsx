"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/app/actions";

type PostFormProps = {
  roomId: string;
  slug?: string;
  onCancel?: () => void;
};

export function PostForm({ roomId, slug, onCancel }: PostFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [promoPeriod, setPromoPeriod] = useState("");
  const [sizeQuantity, setSizeQuantity] = useState("");
  const [origin, setOrigin] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 🌟 필수 입력 조건: 신청업체명, 신청자, 연락처만 검사
    if (!companyName.trim() || !nickname.trim() || !phone.trim()) {
      setError("신청업체명, 신청자, 연락처는 필수 입력 항목입니다.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("room_id", roomId);
      formData.append("company_name", companyName);
      formData.append("nickname", nickname);
      formData.append("phone", phone);
      formData.append("product_name", productName);
      formData.append("barcode", barcode);
      formData.append("weight", weight);
      formData.append("regular_price", regularPrice);
      formData.append("sale_price", salePrice);
      formData.append("promo_period", promoPeriod);
      formData.append("size_quantity", sizeQuantity);
      formData.append("origin", origin);
      formData.append("content", content);
      if (slug) formData.append("slug", slug);

      const res = await createPost(formData);

      if (res && res.error) {
        setError(res.error);
      } else {
        setCompanyName("");
        setNickname("");
        setPhone("");
        setProductName("");
        setBarcode("");
        setWeight("");
        setRegularPrice("");
        setSalePrice("");
        setPromoPeriod("");
        setSizeQuantity("");
        setOrigin("");
        setContent("");
        if (onCancel) onCancel();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <h3 className="text-sm font-extrabold text-zinc-900 border-b pb-2">📋 신규 POP 제작 요청서 작성</h3>

      {/* 1단: 업체명 / 신청자 / 연락처 (필수) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">신청업체명 *</label>
          <input
            type="text"
            placeholder="예: (주)농산물유통"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">신청자 *</label>
          <input
            type="text"
            placeholder="예: 홍길동"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">연락처 *</label>
          <input
            type="text"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>
      </div>

      {/* 2단: 상품명 / 바코드 / 중량 (선택) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">상품명</label>
          <input
            type="text"
            placeholder="예: 성주 꿀참외"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">바코드</label>
          <input
            type="text"
            placeholder="바코드 번호"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">중량 / 규격</label>
          <input
            type="text"
            placeholder="예: 5kg / 1.5kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* 3단: 정상가 / 행사가 / 행사기간 (선택) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">정상가</label>
          <input
            type="text"
            placeholder="예: 15,000원"
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">행사가</label>
          <input
            type="text"
            placeholder="예: 12,900원"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">행사기간</label>
          <input
            type="text"
            placeholder="예: 3/1 ~ 3/7"
            value={promoPeriod}
            onChange={(e) => setPromoPeriod(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* 4단: 글자사이즈/수량 / 원산지 (선택) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">글자사이즈 / 수량</label>
          <input
            type="text"
            placeholder="예: A4 / 2장, 대형 / 1장"
            value={sizeQuantity}
            onChange={(e) => setSizeQuantity(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">원산지</label>
          <input
            type="text"
            placeholder="예: 경북 성주군"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* 5단: 비고 (기타요청사항) */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">비고 (기타요청사항)</label>
        <textarea
          placeholder="POP에 특별히 들어가야 할 문구나 요청사항을 적어주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
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
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          {isPending ? "등록 중..." : "POP 요청 등록하기"}
        </button>
      </div>
    </form>
  );
}
