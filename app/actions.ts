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
  const productName = (formData.get("productName") as string)?.trim();
  const barcode = (formData.get("barcode") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const slug = formData.get("slug") as string;

  if (!roomId || !nickname || !content) {
    return { error: "필수 항목을 입력해 주세요." };
  }

  const { error } = await supabase.from("posts").insert({
    room_id: roomId,
    parent_id: parentId || null,
    nickname,
    product_name: parentId ? "답글" : productName,
    barcode: barcode || null,
    content,
    password: parentId ? "0000" : password,
  });

  if (error) {
    console.error("Supabase Insert Error:", error);
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
  const password = formData.get("password") as string;
  const slug = formData.get("slug") as string;

  if (!id || !password) {
    return { error: "비밀번호를 입력해 주세요." };
  }

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("password")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { error: "게시글을 찾을 수 없습니다." };
  }

  if (post.password !== password) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

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
