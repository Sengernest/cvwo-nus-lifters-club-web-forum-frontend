import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Post, Topic } from "../services/types";

const Posts: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);

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

  // Fetch posts
  const fetchPosts = React.useCallback(() => {
    console.log("Fetching posts for topic", topicId);
    setLoading(true);
    API.get(`/topics/${topicId}/posts`)
      .then((res) => {
        console.log("Fetched posts:", res.data);
        // Ensure likes is always defined
        const postsWithLikes = (res.data as Post[]).map((post) => ({
          ...post,
          likes: post.likes || 0,
          likedByUser: post.likedByUser || false, // optional: track if user liked it
        }));
        setPosts(postsWithLikes);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, [topicId]);

  // Fetch topic
  const fetchTopic = React.useCallback(() => {
    if (!topicId) return;
    API.get(`/topics/${topicId}`)
      .then((res) => {
        console.log("Fetched topic:", res.data);
        setTopic(res.data as Topic);
      })
      .catch((err) => console.error("Error fetching topic:", err));
  }, [topicId]);

  useEffect(() => {
    fetchPosts();
    fetchTopic();
  }, [fetchPosts, fetchTopic]);

  // Add post
  const handleAddPost = () => {
    if (!loggedInUserId || !newTitle.trim() || !newContent.trim()) return;

    API.post(
      `/topics/${topicId}/posts`,
      { title: newTitle, content: newContent, topic_id: parseInt(topicId!) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setNewTitle("");
        setNewContent("");
        fetchPosts();
      })
      .catch((err) => console.error("Error adding post:", err));
  };

  // Delete post
  const handleDeletePost = (id: number) => {
    API.delete(`/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    })
      .then(() => fetchPosts())
      .catch((err) => console.error("Error deleting post:", err));
  };

  // Edit post
  const handleEditPost = (id: number) => {
    if (!editingTitle.trim() || !editingContent.trim()) return;

    API.put(
      `/posts/${id}`,
      { title: editingTitle, content: editingContent },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setEditingPostId(null);
        setEditingTitle("");
        setEditingContent("");
        fetchPosts();
      })
      .catch((err) => console.error("Error editing post:", err));
  };

  // Toggle like
  const handleToggleLike = (post: Post) => {
    if (!loggedInUserId) return;

    const alreadyLiked = post.likedByUser || false;
    const endpoint = `/posts/${post.id}/${alreadyLiked ? "unlike" : "like"}`;

    API.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchPosts())
      .catch((err) => console.error("Error toggling like:", err));
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Posts {topic && ` from ${topic.title}`}</h2>

      {/* Add new post */}
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

      {/* Posts */}
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
            {/* Edit mode */}
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
                <h4
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() => navigate(`/forum/${topicId}/${post.id}`)}
                >
                  {post.title}
                </h4>
                <p>{post.content}</p>

                {/* Likes */}
                <button
                  onClick={() => handleToggleLike(post)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: loggedInUserId ? "pointer" : "default",
                    color: post.likedByUser ? "red" : "gray",
                    fontSize: "16px",
                  }}
                  title={
                    loggedInUserId
                      ? post.likedByUser
                        ? "Unlike"
                        : "Like"
                      : "Login to like"
                  }
                >
                  ❤️ {post.likes || 0}
                </button>
              </>
            )}

            {/* Edit/Delete buttons */}
            {loggedInUserId === post.user_id && editingPostId !== post.id && (
              <>
                <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                <button
                  onClick={() => {
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
