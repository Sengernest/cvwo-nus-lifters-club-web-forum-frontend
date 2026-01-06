import React, { useState } from "react";
import { Post } from "../services/types";
import API from "../services/api";

interface PostCardProps {
  post: Post;
  refreshPosts: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, refreshPosts }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const userId = Number(localStorage.getItem("userId")); // store userId on login

  const handleEdit = async () => {
    try {
      await API.put(`/posts/${post.id}`, { title, content });
      setEditing(false);
      refreshPosts();
    } catch (err) {
      alert("Failed to edit post");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${post.id}`);
      refreshPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleLike = async () => {
    try {
      await API.post(`/posts/${post.id}/like`);
      refreshPosts();
    } catch (err) {
      alert("Failed to like post");
    }
  };

  return (
    <div
      style={{ border: "1px solid gray", padding: "8px", marginBottom: "8px" }}
    >
      {editing ? (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={handleEdit}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h4>{post.title}</h4>
          <p>{post.content}</p>
          <p>Likes: {post.likes}</p>
          <button onClick={handleLike}>Like</button>
          {post.user_id === userId && (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PostCard;
