import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Post, Comment, Topic } from "../services/types";

const Posts: React.FC = () => {
  const { topicId } = useParams();

  // --- State ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showAddPostInput, setShowAddPostInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<
   "alphabetic" | "recent" | "liked"
  >("alphabetic");

 
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  // --- Comment state ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [showAddCommentInput, setShowAddCommentInput] = useState(false);

  const token = localStorage.getItem("token");
  const loggedInUser = token
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const loggedInUserId = loggedInUser ? loggedInUser.id : null;

  // --- Fetch posts ---
  const fetchPosts = useCallback(() => {
    if (!topicId) return;
    setLoading(true);
    API.get(`/topics/${topicId}/posts`)
      .then((res) => {
        const postsWithLikes = (res.data as Post[]).map((p) => ({
          ...p,
          likes: p.likes || 0,
          likedByUser: p.likedByUser || false,
        }));
        setPosts(postsWithLikes);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, [topicId]);

  // --- Fetch topic ---
  const fetchTopic = useCallback(() => {
    if (!topicId) return;
    API.get(`/topics/${topicId}`)
      .then((res) => setTopic(res.data as Topic))
      .catch((err) => console.error("Error fetching topic:", err));
  }, [topicId]);

  useEffect(() => {
    fetchPosts();
    fetchTopic();
  }, [fetchPosts, fetchTopic]);

  // --- Toggle post expand to show comments ---
  const toggleExpandPost = (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      setComments([]);
    } else {
      setExpandedPostId(postId);
      fetchComments(postId);
    }
  };

  // --- Comments CRUD ---
  const fetchComments = (postId: number) => {
    API.get(`/posts/${postId}/comments`)
      .then((res) => {
        const commentsWithLikes = (res.data as Comment[]).map((c) => ({
          ...c,
          likes: c.likes || 0,
          likedByUser: c.likedByUser || false,
        }));
        setComments(commentsWithLikes);
      })
      .catch((err) => console.error("Error fetching comments:", err));
  };

  const handleAddComment = (postId: number) => {
    if (!loggedInUserId || !newComment.trim()) return;
    API.post(
      `/posts/${postId}/comments`,
      { content: newComment },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setNewComment("");
        fetchComments(postId);
      })
      .catch((err) => console.error("Error adding comment:", err));
  };

  const handleDeleteComment = (commentId: number) => {
    API.delete(`/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    })
      .then(() => setComments(comments.filter((c) => c.id !== commentId)))
      .catch((err) => console.error("Error deleting comment:", err));
  };

  const handleEditComment = (commentId: number) => {
    if (!editingCommentContent.trim()) return;
    API.put(
      `/comments/${commentId}`,
      { content: editingCommentContent },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setEditingCommentId(null);
        setEditingCommentContent("");
        if (expandedPostId) fetchComments(expandedPostId);
      })
      .catch((err) => console.error("Error editing comment:", err));
  };

  const handleToggleLikeComment = (comment: Comment) => {
    if (!loggedInUserId) return;
    const endpoint = `/comments/${comment.id}/${
      comment.likedByUser ? "unlike" : "like"
    }`;
    API.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        if (expandedPostId) fetchComments(expandedPostId);
      })
      .catch((err) => console.error("Error toggling like:", err));
  };

  // --- Posts CRUD ---
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
        setShowAddPostInput(false);
        fetchPosts();
      })
      .catch((err) => console.error("Error adding post:", err));
  };

  const handleDeletePost = (id: number) => {
    API.delete(`/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    })
      .then(() => setPosts(posts.filter((p) => p.id !== id)))
      .catch((err) => console.error("Error deleting post:", err));
  };

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

  const handleToggleLikePost = (post: Post) => {
    if (!loggedInUserId) return;
    const endpoint = `/posts/${post.id}/${
      post.likedByUser ? "unlike" : "like"
    }`;
    API.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(fetchPosts)
      .catch((err) => console.error("Error toggling like:", err));
  };

const displayedPosts = posts
  .filter((p) =>
    searchTerm.trim() === ""
      ? true
      : p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    if (sortOption === "recent") {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOption === "liked") {
      return (b.likes || 0) - (a.likes || 0);
    } else {
        return a.title.localeCompare(b.title);
    }
  });

return (
  <div style={{ padding: "16px" }}>
    {/* Title + Search + Big Add button */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
        gap: "8px",
      }}
    >
      <h2 style={{ margin: 0 }}>
        Showing Posts {topic && `from Topic: ${topic.title}`}
      </h2>

      {/* Search bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="🔍 Search posts"
        style={{ padding: "4px 8px", marginTop: "5px", width: "110px" }}
      />

      {/* Sort dropdown */}
      <select
        value={sortOption}
        onChange={(e) =>
          setSortOption(e.target.value as "alphabetic" | "recent" | "liked")
        }
        style={{ padding: "4px 8px", marginTop: "5px" }}
      >
        <option value="alphabetic">Alphabetical</option>
        <option value="recent">Most Recent</option>
        <option value="liked">Most Liked</option>
      </select>

      {/* Big + button */}
      {loggedInUserId && !showAddPostInput && (
        <button
          onClick={() => setShowAddPostInput(true)}
          style={{
            fontSize: "20px",
            padding: "0px 8px",
            marginTop: "5px",
          }}
          title="Add New Post"
        >
          +
        </button>
      )}
    </div>

    {/* Add post input */}
    {showAddPostInput && loggedInUserId && (
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          value={newTitle}
          placeholder="Enter Post title"
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ width: "100%", marginBottom: "4px" }}
        />
        <textarea
          value={newContent}
          placeholder="Enter Post Content"
          onChange={(e) => setNewContent(e.target.value)}
          style={{ width: "100%", minHeight: "60px" }}
        />
        <button onClick={handleAddPost} style={{ marginRight: "4px" }}>
          Add New Post
        </button>
        <button
          onClick={() => {
            setShowAddPostInput(false);
            setNewTitle("");
            setNewContent("");
          }}
        >
          Cancel
        </button>
      </div>
    )}

    {/* --- Posts list --- */}
    {loading ? (
      <p>Loading posts...</p>
    ) : displayedPosts.length === 0 ? (
      <p>No posts yet.</p>
    ) : (
      displayedPosts.map((post) => (
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
              <h4
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => toggleExpandPost(post.id)}
              >
                {post.title}
              </h4>
              <p>{post.content}</p>
              <button
                onClick={() => handleToggleLikePost(post)}
                style={{
                  background: "none",
                  border: "none",
                  color: post.likedByUser ? "red" : "gray",
                }}
              >
                ❤️ {post.likes || 0}
              </button>
            </>
          )}

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

          {/* Comments */}
          {expandedPostId === post.id && (
            <div style={{ marginTop: "16px" }}>
              <h4
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                Comments:
                {/* Big + button for adding a comment */}
                {loggedInUserId && !showAddCommentInput && (
                  <button
                    onClick={() => setShowAddCommentInput(true)}
                    style={{
                      marginTop: "1px",
                      fontSize: "15px",
                      padding: "0 6px",
                    }}
                    title="Add Comment"
                  >
                    +
                  </button>
                )}
              </h4>

              {/* Add comment input */}
              {showAddCommentInput && (
                <div style={{ marginBottom: "16px" }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter Comment Content"
                    style={{ width: "100%", minHeight: "50px" }}
                  />
                  <button
                    onClick={() => {
                      handleAddComment(post.id);
                      setShowAddCommentInput(false);
                    }}
                    style={{ marginRight: "4px" }}
                  >
                    Add New Comment
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCommentInput(false);
                      setNewComment("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      border: "1px solid #eee",
                      padding: "4px",
                      marginTop: "8px",
                    }}
                  >
                    {editingCommentId === comment.id ? (
                      <>
                        <textarea
                          value={editingCommentContent}
                          onChange={(e) =>
                            setEditingCommentContent(e.target.value)
                          }
                          style={{ width: "100%", minHeight: "40px" }}
                        />
                        <button onClick={() => handleEditComment(comment.id)}>
                          Save
                        </button>
                        <button onClick={() => setEditingCommentId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{comment.content}</p>
                        <button
                          onClick={() => handleToggleLikeComment(comment)}
                          style={{
                            background: "none",
                            border: "none",
                            color: comment.likedByUser ? "red" : "gray",
                          }}
                        >
                          ❤️ {comment.likes || 0}
                        </button>

                        {loggedInUserId === comment.user_id && (
                          <>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              style={{ marginLeft: "4px" }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentContent(comment.content);
                              }}
                              style={{ marginLeft: "4px" }}
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))
    )}
  </div>
);
}

export default Posts;