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
  content: string;
  created_at: string;
};

export type PostWithReplies = Post & {
  replies: PostWithReplies[];
};
