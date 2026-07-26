"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

export async function createRoom() {
  const slug = nanoid(8);

  const { error } = await supabase.from("rooms").insert({ slug });

  if (error) {
    throw new Error("방명록 생성에 실패했습니다.");
  }

  redirect(`/room/${slug}`);
}

export async function createPost(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const parentId = formData.get("parentId") as string | null;
  const nickname = (formData.get("nickname") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const password = formData.get("password") as string;
  const slug = formData.get("slug") as string;

  if (!roomId || !nickname || !content || !password) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  if (password.length !== 4 || !/^\d{4}$/.test(password)) {
    return { error: "비밀번호는 4자리 숫자여야 합니다." };
  }

  const { error } = await supabase.from("posts").insert({
    room_id: roomId,
    parent_id: parentId || null,
    nickname,
    content,
    password,
  });

  if (error) {
    return { error: "글 저장에 실패했습니다." };
  }

  revalidatePath(`/room/${slug}`);
  return { success: true };
}
// app/actions.ts 맨 아래에 추가

export async function deletePost(id: string, inputPassword: string) {
  // 1. 해당 게시글 정보 조회 (비밀번호 확인용)
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("password")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  // 2. 관리자 마스터 비밀번호 설정 (원하시는 비밀번호로 자유롭게 변경하세요!)
  const ADMIN_PASSWORD = "admin1234";

  // 작성자 비밀번호 또는 마스터 비밀번호와 일치하는지 검사
  if (inputPassword !== post.password && inputPassword !== ADMIN_PASSWORD) {
    return { success: false, message: "비밀번호가 일치하지 않습니다." };
  }

  // 3. 삭제 실행 (데이터베이스 설정으로 답글도 자동 삭제됩니다)
  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { success: false, message: "삭제 중 오류가 발생했습니다." };
  }

  revalidatePath("/");
  return { success: true };
}