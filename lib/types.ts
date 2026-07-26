export type Room = {
  id: string;
  slug: string;
  created_at: string;
};

export type Post = {
  id: string;
  room_id: string;
  parent_id: string | null;
  nickname: string;
  product_name: string;
  barcode?: string | null;
  content: string;
  created_at: string;
};

export type PostWithReplies = Post & {
  replies?: PostWithReplies[];
};export type Room = {
  id: string;
  slug: string;
  created_at: string;
};

export type Post = {
  id: string;
  room_id: string;
  parent_id: string | null;
  nickname: string;
  product_name: string;
  barcode?: string | null;
  content: string;
  created_at: string;
};

export type PostWithReplies = Post & {
  replies?: PostWithReplies[];
};
