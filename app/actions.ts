"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

// 새로운 방 생성 (자동 생성 방식)
export async function createRoom() {
  const slug = nanoid(8);

  const { error } = await supabase.from("rooms").insert({ slug });

  if (error) {
    throw new Error("방 생성에 실패했습니다.");
  }

  redirect(`/room/${slug}`);
}

// 게시글 작성
export async function createPost(formData: FormData) {
  const room_id = formData.get("room_id") as string;
  const parent_id = formData.get("parent_id") as string | null;
  const nickname = formData.get("nickname") as string;
  const product_name = formData.get("product_name") as string;
  const barcode = formData.get("barcode") as string | null;
  const content = formData.get("content") as string;
  const slug = formData.get("slug") as string;

  await supabase.from("posts").insert([
    {
      room_id,
      parent_id: parent_id || null,
      nickname,
      product_name: product_name || "",
      barcode: barcode || null,
      content,
      completed: false,
    },
  ]);

  if (slug) {
    revalidatePath(`/${slug}`);
  } else {
    revalidatePath("/");
  }
}

// 완료 상태 변경
export async function toggleComplete(formData: FormData) {
  const postId = formData.get("postId") as string;
  const completed = formData.get("completed") === "true";
  const slug = formData.get("slug") as string;

  await supabase.from("posts").update({ completed }).eq("id", postId);

  if (slug) {
    revalidatePath(`/${slug}`);
  } else {
    revalidatePath("/");
  }
}

// 게시글 삭제 (관리자 비밀번호 0371 검증)
export async function deletePost(formData: FormData) {
  const postId = formData.get("postId") as string;
  const password = formData.get("password") as string;
  const slug = formData.get("slug") as string;

  if (password !== "0371") {
    return { error: "관리자 비밀번호가 일치하지 않습니다." };
  }

  // 해당 글과 그에 달린 답글까지 모두 삭제
  await supabase.from("posts").delete().eq("parent_id", postId);
  await supabase.from("posts").delete().eq("id", postId);

  if (slug) {
    revalidatePath(`/${slug}`);
  } else {
    revalidatePath("/");
  }
  return { success: true };
}
