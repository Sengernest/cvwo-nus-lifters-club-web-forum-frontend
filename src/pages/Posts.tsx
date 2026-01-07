import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Post, Comment, Topic } from "../services/types";

const Posts: React.FC = () => {
  const { topicId } = useParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showAddPostInput, setShowAddPostInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [postSortOption, setPostSortOption] = useState<
    "alphabetic" | "recent" | "liked"
  >("alphabetic");

  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [showAddCommentInput, setShowAddCommentInput] = useState(false);
  const [commentSortOption, setCommentSortOption] = useState<
    "recent" | "liked"
  >("recent");

  const token = localStorage.getItem("token");
  const loggedInUser = token
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const loggedInUserId = loggedInUser ? loggedInUser.id : null;

  const fetchPosts = useCallback(() => {
    if (!topicId) return;
    setLoading(true);
    API.get(`/topics/${topicId}/posts`)
      .then((res) => {
        const postsWithLikes = (res.data as Post[]).map((p) => ({
          ...p,
          likes: p.likes || 0,
          likedByUser: p.likedByUser || false,
          createdAt: p.created_at,
        }));
        setPosts(postsWithLikes);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, [topicId]);

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

  const toggleExpandPost = (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      setComments([]);
    } else {
      setExpandedPostId(postId);
      fetchComments(postId);
    }
  };

  const fetchComments = (postId: number) => {
    API.get(`/posts/${postId}/comments`)
      .then((res) => {
        const commentsWithLikes = (res.data as Comment[]).map((c) => ({
          ...c,
          likes: c.likes || 0,
          likedByUser: c.likedByUser || false,
          createdAt: c.created_at,
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
      if (postSortOption === "recent")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (postSortOption === "liked") return (b.likes || 0) - (a.likes || 0);
      return a.title.localeCompare(b.title);
    });

  const timeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString.replace(" ", "T"));
    if (isNaN(date.getTime())) return "";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
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
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search posts"
          style={{ padding: "4px 8px", marginTop: "5px", width: "110px" }}
        />
        <select
          value={postSortOption}
          onChange={(e) =>
            setPostSortOption(
              e.target.value as "alphabetic" | "recent" | "liked"
            )
          }
          style={{ padding: "4px 8px", marginTop: "5px" }}
        >
          <option value="alphabetic">Alphabetical</option>
          <option value="recent">Most Recent</option>
          <option value="liked">Most Liked</option>
        </select>
        {loggedInUserId && !showAddPostInput && (
          <button
            onClick={() => setShowAddPostInput(true)}
            style={{ fontSize: "20px", padding: "0px 8px", marginTop: "5px" }}
            title="Add New Post"
          >
            +
          </button>
        )}
      </div>

      {/* Add post */}
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
          <button
            onClick={() => {
              if (window.confirm("Add this new post?")) {
                handleAddPost();
              }
            }}
            style={{ marginRight: "4px" }}
          >
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

      {/* Posts list */}
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
              padding: "12px",
              marginBottom: "12px",
              width: "100%",
              boxSizing: "border-box",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {editingPostId === post.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ width: "100%", marginBottom: "4px" }}
                />
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  style={{ width: "100%", minHeight: "60px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      if (window.confirm("Save changes to this post?")) {
                        handleEditPost(post.id);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingPostId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h4 style={{ margin: "0 0 8px 0" }}>{post.title}</h4>
                <p
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {post.content}
                </p>

                {/* By / Date / Delete/Edit */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "4px",
                  }}
                >
                  <div style={{ color: "gray", fontSize: "14px" }}>
                    By{" "}
                    {loggedInUserId === post.user_id
                      ? "You"
                      : post.username || "Unknown"}{" "}
                    • {timeAgo(post.created_at)}
                  </div>
                  {loggedInUserId === post.user_id && (
                    <div>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this post?"
                            )
                          ) {
                            handleDeletePost(post.id);
                          }
                        }}
                        style={{ marginRight: "4px", fontSize: "12px" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditingTitle(post.title);
                          setEditingContent(post.content);
                        }}
                        style={{ fontSize: "12px" }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Like + View Comments */}
                <div style={{ marginTop: "8px", gap: "12px" }}>
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
                  <button
                    onClick={() => toggleExpandPost(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "blue",
                      cursor: "pointer",
                    }}
                  >
                    {expandedPostId === post.id
                      ? "Hide Comments ▲"
                      : "View Comments ▼"}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPostId === post.id && (
                  <div style={{ marginTop: "16px" }}>
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span>Comments:</span>
                      <select
                        value={commentSortOption}
                        onChange={(e) =>
                          setCommentSortOption(
                            e.target.value as "recent" | "liked"
                          )
                        }
                        style={{
                          padding: "2px 6px",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        <option value="recent">Most Recent</option>
                        <option value="liked">Most Liked</option>
                      </select>
                      {loggedInUserId && !showAddCommentInput && (
                        <button
                          onClick={() => setShowAddCommentInput(true)}
                          style={{
                            fontSize: "15px",
                            padding: "0 6px",
                            marginTop: "3px",
                          }}
                          title="Add Comment"
                        >
                          +
                        </button>
                      )}
                    </h4>

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
                            if (window.confirm("Add this new comment?")) {
                              handleAddComment(post.id);
                              setShowAddCommentInput(false);
                            }
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
                      comments
                        .slice()
                        .sort((a, b) =>
                          commentSortOption === "liked"
                            ? (b.likes || 0) - (a.likes || 0)
                            : new Date(b.created_at).getTime() -
                              new Date(a.created_at).getTime()
                        )
                        .map((comment) => (
                          <div
                            key={comment.id}
                            style={{
                              border: "1px solid #0c20d6ff",
                              padding: "10px",
                              marginTop: "8px",
                              width: "100%",
                              boxSizing: "border-box",
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              whiteSpace: "normal",
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
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Save changes to this comment?"
                                        )
                                      ) {
                                        handleEditComment(comment.id);
                                      }
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p
                                  style={{
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "break-word",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {comment.content}
                                </p>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: "4px",
                                  }}
                                >
                                  <div
                                    style={{ color: "gray", fontSize: "12px" }}
                                  >
                                    By{" "}
                                    {loggedInUserId === comment.user_id
                                      ? "You"
                                      : comment.username || "Unknown"}{" "}
                                    • {timeAgo(comment.created_at)}
                                  </div>
                                  {loggedInUserId === comment.user_id && (
                                    <div>
                                      <button
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              "Are you sure you want to delete this comment?"
                                            )
                                          ) {
                                            handleDeleteComment(comment.id);
                                          }
                                        }}
                                        style={{
                                          marginRight: "4px",
                                          fontSize: "12px",
                                        }}
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditingCommentContent(
                                            comment.content
                                          );
                                        }}
                                        style={{ fontSize: "12px" }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleLikeComment(comment)
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: comment.likedByUser ? "red" : "gray",
                                    marginTop: "4px",
                                  }}
                                >
                                  ❤️ {comment.likes || 0}
                                </button>
                              </>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Posts;
