"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// 1. 신규 POP 요청 생성 (모든 항목 데이터베이스 저장 검증 완료)
export async function createPost(formData: FormData) {
  const room_id = formData.get("room_id") as string;
  const company_name = formData.get("company_name") as string;
  const nickname = formData.get("nickname") as string;
  const phone = formData.get("phone") as string;
  const product_name = formData.get("product_name") as string;
  const barcode = formData.get("barcode") as string;
  const weight = formData.get("weight") as string;
  const regular_price = formData.get("regular_price") as string;
  const sale_price = formData.get("sale_price") as string;
  const promo_period = formData.get("promo_period") as string;
  const size_quantity = formData.get("size_quantity") as string;
  const origin = formData.get("origin") as string;
  const content = formData.get("content") as string;
  const slug = formData.get("slug") as string;

  // 필수 기재 항목 검증 (업체명, 신청자, 연락처)
  if (!company_name || !nickname || !phone) {
    return { error: "신청업체명, 신청자, 연락처는 필수 입력 항목입니다." };
  }

  const { error } = await supabase.from("posts").insert([
    {
      room_id,
      company_name,
      nickname,
      phone,
      product_name: product_name || null,
      barcode: barcode || null,
      weight: weight || null,
      regular_price: regular_price || null,
      sale_price: sale_price || null,
      promo_period: promo_period || null,
      size_quantity: size_quantity || null,
      origin: origin || null,
      content: content || null,
      completed: false,
    },
  ]);

  if (error) {
    console.error("Insert error:", error.message);
    return { error: "게시글 작성 중 오류가 발생했습니다." };
  }

  if (slug) {
    revalidatePath(`/room/${slug}`);
  }
  revalidatePath("/");
  return { success: true };
}

// 2. 게시글 삭제 (관리자 비밀번호 검증)
export async function deletePost(formData: FormData) {
  const postId = formData.get("postId") as string;
  const password = formData.get("password") as string;
  const slug = formData.get("slug") as string;

  if (password !== "0371") {
    return { error: "관리자 비밀번호가 틀렸습니다." };
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: "삭제 중 오류가 발생했습니다." };
  }

  if (slug) {
    revalidatePath(`/room/${slug}`);
  }
  revalidatePath("/");
  return { success: true };
}

// 3. 처리완료 상태 토글
export async function toggleComplete(formData: FormData) {
  const postId = formData.get("postId") as string;
  const completedStr = formData.get("completed") as string;
  const slug = formData.get("slug") as string;
  const completed = completedStr === "true";

  const { error } = await supabase
    .from("posts")
    .update({ completed })
    .eq("id", postId);

  if (error) {
    console.error("Toggle error:", error.message);
    return;
  }

  if (slug) {
    revalidatePath(`/room/${slug}`);
  }
  revalidatePath("/");
}
