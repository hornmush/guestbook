"use client";

import { useState, useTransition, useEffect } from "react";
import { deletePost, toggleComplete } from "@/app/actions";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/post-form";

type Post = {
  id: string;
  room_id: string;
  company_name?: string | null;
  nickname: string;
  phone?: string | null;
  product_name?: string | null;
  barcode?: string | null;
  weight?: string | null;
  regular_price?: string | null;
  sale_price?: string | null;
  promo_period?: string | null;
  size_quantity?: string | null;
  origin?: string | null;
  content?: string | null;
  completed: boolean;
  created_at: string;
};

// 1. 요청 목록용 오름차순 정렬 (오래된 순)
const sortPostsAscending = (postsArray: Post[]) => {
  return [...postsArray].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    
    const validTimeA = isNaN(timeA) ? 0 : timeA;
    const validTimeB = isNaN(timeB) ? 0 : timeB;

    if (validTimeA !== validTimeB) {
      return validTimeA - validTimeB;
    }
    return (a.id || "").localeCompare(b.id || "");
  });
};

// 2. 완료된 목록용 내림차순 정렬 (최신 순)
const sortPostsDescending = (postsArray: Post[]) => {
  return [...postsArray].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    
    const validTimeA = isNaN(timeA) ? 0 : timeA;
    const validTimeB = isNaN(timeB) ? 0 : timeB;

    if (validTimeB !== validTimeA) {
      return validTimeB - validTimeA;
    }
    return (b.id || "").localeCompare(a.id || "");
  });
};

export default function MainPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  
  const [currentView, setCurrentView] = useState<"write" | "list">("write"); 
  const [activeTab, setActiveTab] = useState<"list" | "completed">("list");

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [deletePasswordModalId, setDeletePasswordModalId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchRoomAndPosts() {
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id")
        .limit(1);

      if (rooms && rooms.length > 0) {
        const targetRoomId = rooms[0].id;
        setRoomId(targetRoomId);

        const { data: initialPosts } = await supabase
          .from("posts")
          .select("*")
          .eq("room_id", targetRoomId);

        if (initialPosts) {
          setPosts(initialPosts);
        }
      }
    }
    fetchRoomAndPosts();
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-posts-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const rawPost = payload.new as Post;
          const newPost: Post = {
            ...rawPost,
            created_at: rawPost.created_at || new Date().toISOString(),
          };
          
          setPosts((prev) => [...prev, newPost]);
          setHighlightedId(newPost.id);
          setTimeout(() => setHighlightedId(null), 3000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as Post;
          setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setPosts((prev) => prev.filter((p) => p.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleDelete = (postId: string) => {
    setError("");
    if (passwordInput !== "0371") {
      setError("관리자 비밀번호가 틀렸습니다.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("password", passwordInput);

      const res = await deletePost(formData);
      if (res && res.error) {
        setError(res.error);
      } else {
        setDeletePasswordModalId(null);
        setPasswordInput("");
        router.refresh();
      }
    });
  };

  const handleToggleComplete = (postId: string, currentCompleted: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("completed", String(!currentCompleted));

      await toggleComplete(formData);
    });
  };

  // 요청 목록은 오름차순(옛날 순), 완료된 목록은 내림차순(최신 순) 적용
  const activePosts = sortPostsAscending(posts.filter((p) => !p.completed));
  const completedPosts = sortPostsDescending(posts.filter((p) => p.completed));
  const filteredPosts = activeTab === "list" ? activePosts : completedPosts;

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h1 className="text-lg font-extrabold text-zinc-900">칠곡농협 POP 요청</h1>
            <p className="text-xs text-zinc-500">매장 행사 및 상품 POP 제작 관리 시스템</p>
          </div>
          
          <div className="flex rounded-xl bg-zinc-100 p-1 w-full sm:w-auto">
            <button
              onClick={() => setCurrentView("write")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                currentView === "write" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              ✍️ POP 작성하기
            </button>
            <button
              onClick={() => setCurrentView("list")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                currentView === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              📋 신청 목록 보기
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${currentView === "list" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                {activePosts.length}
              </span>
            </button>
          </div>
        </div>

        {currentView === "write" && roomId && (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="font-bold text-zinc-800 text-base border-b pb-2">신규 POP 제작 요청서 작성</h2>
            <PostForm roomId={roomId} />
          </div>
        )}

        {currentView === "list" && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex rounded-xl bg-zinc-100 p-1.5 border border-zinc-200">
                <button
                  onClick={() => setActiveTab("list")}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  1. 요청 목록
                  <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px]">
                    {activePosts.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === "completed" ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  2. 완료된 목록
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-[10px]">
                    {completedPosts.length}
                  </span>
                </button>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-sm">
                {activeTab === "list" ? "진행중인 POP 요청이 없습니다." : "완료된 POP 요청이 없습니다."}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const isHighlighted = highlightedId === post.id;

                  return (
                    <div
                      key={post.id}
                      className={`p-5 rounded-2xl border shadow-sm space-y-3 transition-all duration-700 ${
                        isHighlighted
                          ? "bg-amber-100 border-amber-400 scale-[1.01] shadow-md ring-2 ring-amber-300"
                          : post.completed
                          ? "bg-zinc-50 border-zinc-300 opacity-80"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <div className="flex justify-between items-start border-b pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                              {post.company_name || "업체명 미입력"}
                            </span>
                            <span className={`font-bold text-sm ${post.completed ? "text-zinc-500 line-through" : "text-zinc-900"}`}>
                              신청자: {post.nickname} {post.phone && `(${post.phone})`}
                            </span>
                            {isHighlighted && (
                              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                                NEW!
                              </span>
                            )}
                            {post.completed && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                처리완료
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">
                            신청일시: {new Date(post.created_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleComplete(post.id, post.completed)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                              post.completed ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            }`}
                          >
                            {post.completed ? "완료취소" : "처리완료"}
                          </button>
                          <button
                            onClick={() => {
                              setDeletePasswordModalId(post.id);
                              setPasswordInput("");
                              setError("");
                            }}
                            className="text-xs text-zinc-400 hover:text-red-600 transition px-1"
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-xl text-xs">
                        <div>
                          <span className="text-zinc-400 block">상품명</span>
                          <span className="font-bold text-zinc-800 text-sm">{post.product_name || "-"}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">규격 / 중량</span>
                          <span className="font-semibold text-zinc-700">{post.weight || "-"}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">정상가 / 행사가</span>
                          <span className="font-semibold text-zinc-700">
                            {post.regular_price || "-"} / <strong className="text-red-600">{post.sale_price || "-"}</strong>
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">행사기간</span>
                          <span className="font-semibold text-zinc-700">{post.promo_period || "-"}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">사이즈 (종이/방향)</span>
                          <span className="font-semibold text-indigo-600">{post.size_quantity || "-"}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">원산지</span>
                          <span className="font-semibold text-zinc-700">{post.origin || "-"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-zinc-400 block">바코드</span>
                          <span className="font-mono text-zinc-600">{post.barcode || "-"}</span>
                        </div>
                      </div>

                      {post.content && (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                          <span className="font-bold text-amber-800">비고 및 요청사항:</span>
                          <p className="text-zinc-700 whitespace-pre-wrap">{post.content}</p>
                        </div>
                      )}

                      {deletePasswordModalId === post.id && (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                          <p className="text-xs font-bold text-red-700">관리자 비밀번호를 입력하세요</p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="비밀번호"
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm bg-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={isPending}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition"
                            >
                              삭제확인
                            </button>
                            <button
                              onClick={() => setDeletePasswordModalId(null)}
                              className="bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-300 transition"
                            >
                              취소
                            </button>
                          </div>
                          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
