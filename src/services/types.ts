export interface User {
  id: number;
  username: string;
}

export interface Topic {
  id: number;
  title: string;
  user_id: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  user_id: number;
  username: string;
  likes: number;
  likedByUser?: boolean;
  created_at: string;
  
}

export interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  username: string;
  likes: number;
  likedByUser?: boolean;
  created_at: string;
}
export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  comment_id: number;
}
