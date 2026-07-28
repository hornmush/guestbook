"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavHeader({ slug, activeCount, completedCount }: { slug: string; activeCount: number; completedCount: number }) {
  const pathname = usePathname();

  // 경로에 따른 활성화 체크
  const isWrite = pathname.includes("/write");
  const isCompleted = pathname.includes("/completed");
  const isList = !isWrite && !isCompleted;

  return (
    <div className="space-y-4 max-w-4xl mx-auto mb-6">
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">칠곡농협 POP 요청</h2>
          <p className="text-xs text-zinc-500 mt-0.5">매장 행사 및 상품 POP 제작 요청을 남기고 처리 상태를 관리하세요.</p>
        </div>

        {/* 페이지 이동 링크 버튼들 */}
        <div className="flex rounded-xl bg-zinc-100 p-1.5 border border-zinc-200 gap-1">
          <Link
            href={`/${slug}/write`}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition text-center ${
              isWrite ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            1. 요청 작성
          </Link>
          <Link
            href={`/${slug}`}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              isList ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            2. 요청 목록
            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px]">
              {activeCount}
            </span>
          </Link>
          <Link
            href={`/${slug}/completed`}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              isCompleted ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            3. 완료된 목록
            <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-[10px]">
              {completedCount}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
