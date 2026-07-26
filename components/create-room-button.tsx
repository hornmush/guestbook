"use client";

import { useTransition } from "react";
import { createRoom } from "@/app/actions";

export function CreateRoomButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => createRoom())}
      className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "만드는 중..." : "내 방명록 만들기"}
    </button>
  );
}
