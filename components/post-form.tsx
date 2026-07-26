"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPost } from "@/app/actions";

type PostFormProps = {
  roomId: string;
  slug: string;
  parentId?: string;
  onCancel?: () => void;
  compact?: boolean;
};

type FormState = {
  error?: string;
  success?: boolean;
};

const initialState: FormState = {};

export function PostForm({
  roomId,
  slug,
  parentId,
  onCancel,
  compact = false,
}: PostFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      return createPost(formData);
    },
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onCancel?.();
    }
  }, [state.success, onCancel]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ${compact ? "mt-3" : ""}`}
    >
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div>
            <label htmlFor={`nickname-${parentId ?? "root"}`} className="mb-1.5 block text-sm font-medium text-zinc-700">
              닉네임
            </label>
            <input
              id={`nickname-${parentId ?? "root"}`}
              name="nickname"
              required
              maxLength={20}
              placeholder="이름"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label htmlFor={`password-${parentId ?? "root"}`} className="mb-1.5 block text-sm font-medium text-zinc-700">
              비밀번호 (4자리)
            </label>
            <input
              id={`password-${parentId ?? "root"}`}
              name="password"
              required
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="0000"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`content-${parentId ?? "root"}`} className="mb-1.5 block text-sm font-medium text-zinc-700">
            {compact ? "답글" : "내용"}
          </label>
          <textarea
            id={`content-${parentId ?? "root"}`}
            name="content"
            required
            rows={compact ? 3 : 4}
            placeholder={compact ? "답글을 입력하세요" : "방명록을 남겨보세요"}
            className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "저장 중..." : compact ? "답글 등록" : "글 남기기"}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
            >
              취소
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
