"use server";

import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// 1. 새로운 방(페이지) 만들기
export async function createRoom(formData?: FormData) {
  const title = formData ? (formData.get("title") as string) : "농산팀 POP 요청실";
  const slug = nanoid(6);

  const { error } = await supabase.from("rooms").insert([
    {
      title: title || "농산팀 POP 요청실",
      slug,
    },
  ]);

  if (error) {
    console.error("Room creation error:", error.message);
    return { error: "방 생성 중 오류가 발생했습니다." };
  }

  revalidatePath("/");
  return { success: true, slug };
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getKoreaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function setMakerAttendance(formData: FormData) {
  const password = (formData.get("password") as string) || "";
  const status = formData.get("status") as string;

  if (!process.env.MAKER_PASSWORD || password !== process.env.MAKER_PASSWORD) {
    return { error: "제작자 비밀번호가 틀렸습니다." };
  }
  if (status !== "OPEN" && status !== "CLOSED") {
    return { error: "잘못된 상태입니다." };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { error: "서버 설정이 완료되지 않았습니다." };
  }

  const now = new Date().toISOString();
  const { error } = await admin.from("daily_reception").upsert({
    work_date: getKoreaDate(),
    status,
    started_at: status === "OPEN" ? now : null,
    closed_at: status === "CLOSED" ? now : null,
    updated_at: now,
  }, { onConflict: "work_date" });

  if (error) return { error: "출퇴근 상태 변경 중 오류가 발생했습니다." };
  revalidatePath("/");
  return { success: true, status };
}

// 2. 신규 POP 요청 생성 (필수 3개 외 나머지는 빈칸 허용)
export async function createPost(formData: FormData) {
  const room_id = formData.get("room_id") as string;
  const company_name = (formData.get("company_name") as string)?.trim();
  const nickname = (formData.get("nickname") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  
  const product_name = (formData.get("product_name") as string)?.trim() || null;
  const barcode = (formData.get("barcode") as string)?.trim() || null;
  const weight = (formData.get("weight") as string)?.trim() || null;
  const regular_price = (formData.get("regular_price") as string)?.trim() || null;
  const sale_price = (formData.get("sale_price") as string)?.trim() || null;
  const promo_period = (formData.get("promo_period") as string)?.trim() || null;
  const size_quantity = (formData.get("size_quantity") as string)?.trim() || null;
  const origin = (formData.get("origin") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() || null;
  const slug = formData.get("slug") as string;

  const admin = getSupabaseAdmin();
  const receptionClient = admin ?? supabase;
  const { data: reception } = await receptionClient
    .from("daily_reception")
    .select("status")
    .eq("work_date", getKoreaDate())
    .maybeSingle();

  if (reception?.status !== "OPEN") {
    return { error: "제작자가 출근해야 POP 작업을 신청할 수 있습니다." };
  }

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
      product_name,
      barcode,
      weight,
      regular_price,
      sale_price,
      promo_period,
      size_quantity,
      origin,
      content,
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

// 3. 게시글 삭제 (관리자 비밀번호 검증)
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

// 4. 처리완료 상태 토글
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
