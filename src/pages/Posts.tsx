import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Post } from "../services/types";

const Posts: React.FC = () => {
  const { topicId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const loggedInUser = token
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const loggedInUserId = loggedInUser ? loggedInUser.id : null;

  const fetchPosts = React.useCallback(() => {
    console.log("Fetching posts for topic", topicId);
    setLoading(true);
    API.get(`/topics/${topicId}/posts`)
      .then((res) => {
        console.log("Fetched posts:", res.data);
        setPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, [topicId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Add post
  const handleAddPost = () => {
    console.log("Adding post:", newTitle, newContent);
    if (!loggedInUserId || !newTitle.trim() || !newContent.trim()) return;

    API.post(
      `/topics/${topicId}/posts`,
      { title: newTitle, content: newContent, topic_id: parseInt(topicId!) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => {
        console.log("Post added:", res.data);
        setNewTitle("");
        setNewContent("");
        fetchPosts();
      })
      .catch((err) => console.error("Error adding post:", err));
  };

  // Delete post
  const handleDeletePost = (id: number) => {
    console.log("Deleting post ID:", id);
    API.delete(`/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {}, // Axios requires data for headers on DELETE
    })
      .then((res) => {
        console.log("Post deleted:", res.status);
        fetchPosts();
      })
      .catch((err) => console.error("Error deleting post:", err));
  };

  // Edit post
  const handleEditPost = (id: number) => {
    console.log("Editing post ID:", id, editingTitle, editingContent);
    if (!editingTitle.trim() || !editingContent.trim()) return;

    API.put(
      `/posts/${id}`,
      { title: editingTitle, content: editingContent },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => {
        console.log("Post edited:", res.data);
        setEditingPostId(null);
        setEditingTitle("");
        setEditingContent("");
        fetchPosts();
      })
      .catch((err) => console.error("Error editing post:", err));
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Posts</h2>

      {loggedInUserId && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            value={newTitle}
            placeholder="Post title"
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ marginBottom: "4px", width: "100%" }}
          />
          <textarea
            value={newContent}
            placeholder="Write your post..."
            onChange={(e) => setNewContent(e.target.value)}
            style={{ width: "100%", minHeight: "60px" }}
          />
          <br />
          <button onClick={handleAddPost} style={{ marginTop: "4px" }}>
            Add Post
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              marginBottom: "8px",
            }}
          >
            {editingPostId === post.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ width: "100%" }}
                />
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  style={{ width: "100%", minHeight: "60px" }}
                />
                <button onClick={() => handleEditPost(post.id)}>Save</button>
                <button onClick={() => setEditingPostId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <h4>{post.title}</h4>
                <p>{post.content}</p>
              </>
            )}

            {loggedInUserId === post.user_id && editingPostId !== post.id && (
              <>
                <button onClick={() => handleDeletePost(post.id)}>
                  Delete
                </button>
                <button
                  onClick={() => {
                    console.log("Editing post ID:", post.id);
                    setEditingPostId(post.id);
                    setEditingTitle(post.title);
                    setEditingContent(post.content);
                  }}
                  style={{ marginLeft: "4px" }}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Posts;
