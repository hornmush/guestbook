export type Post = {
  id: string;
  room_id: string;
  parent_id: string | null;
  nickname: string;
  product_name: string;
  barcode: string | null;
  content: string;
  password?: string;
  completed: boolean; // 이 부분이 추가되었습니다!
  created_at: string;
};

export type PostWithReplies = Post & {
  replies?: PostWithReplies[];
};
