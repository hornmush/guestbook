"use client";

import { useTransition } from "react";
import { createRoom } from "@/app/actions";
import { useRouter } from "next/navigation";

export function CreateRoomButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createRoom();
      if (res && res.success && res.slug) {
        router.push(`/room/${res.slug}`);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleCreate}
      className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {isPending ? "만드는 중..." : "내 방명록 만들기"}
    </button>
  );
}
