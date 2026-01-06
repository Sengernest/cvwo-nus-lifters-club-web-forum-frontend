export interface User {
  id: number;
  username: string;
}

export interface Topic {
  id: number;
  title: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  user_id: number;
  likes: number;
}

export interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  likes: number;
}
export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  comment_id: number;
}
