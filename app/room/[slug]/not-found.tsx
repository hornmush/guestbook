import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-zinc-900">방명록을 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          링크가 잘못되었거나 삭제된 방명록일 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          새 방명록 만들기
        </Link>
      </div>
    </div>
  );
}
