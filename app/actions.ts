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
  const slug = formData.get("slug") as string;

  if (!roomId || !nickname || !content) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  const { error } = await supabase.from("posts").insert({
    room_id: roomId,
    parent_id: parentId || null,
    nickname,
    content,
    password: "0000", // 비밀번호 입력란을 없앴으므로 기본값 자동 입력
  });

  if (error) {
    return { error: "글 저장에 실패했습니다." };
  }

  if (slug) {
    revalidatePath(`/room/${slug}`);
  }
  revalidatePath("/");
  return { success: true };
}

export async function deletePost(formData: FormData) {
  const id = formData.get("postId") as string;
  const slug = formData.get("slug") as string;

  if (!id) {
    return { error: "필수 정보가 누락되었습니다." };
  }

  // 비밀번호 입력란이 사라졌으므로 바로 삭제 실행
  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: "삭제 중 오류가 발생했습니다." };
  }

  if (slug) {
    revalidatePath(`/room/${slug}`);
  }
  revalidatePath("/");
  return { success: true };
}
