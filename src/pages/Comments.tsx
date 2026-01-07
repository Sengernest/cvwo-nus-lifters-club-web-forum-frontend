import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Comment } from "../services/types";

const Comments: React.FC = () => {
  const { topicId, postId } = useParams();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const loggedInUser = token
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const loggedInUserId = loggedInUser ? loggedInUser.id : null;

  const fetchComments = useCallback(() => {
    setLoading(true);
    API.get(`/posts/${postId}/comments`)
      .then((res) => {
        setComments(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching comments:", err))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add comment
  const handleAddComment = () => {
    if (!loggedInUserId || !newContent.trim()) return;

    API.post(
      `/posts/${postId}/comments`,
      { content: newContent },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setNewContent("");
        fetchComments();
      })
      .catch((err) => console.error("Error adding comment:", err));
  };

  // Delete comment
  const handleDeleteComment = (id: number) => {
    API.delete(`/comments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    })
      .then(() => fetchComments())
      .catch((err) => console.error("Error deleting comment:", err));
  };

  // Edit comment
  const handleEditComment = (id: number) => {
    if (!editingContent.trim()) return;

    API.put(
      `/comments/${id}`,
      { content: editingContent },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setEditingCommentId(null);
        setEditingContent("");
        fetchComments();
      })
      .catch((err) => console.error("Error editing comment:", err));
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Comments</h2>

      {loggedInUserId && (
        <div style={{ marginBottom: "16px" }}>
          <textarea
            value={newContent}
            placeholder="Write a comment..."
            onChange={(e) => setNewContent(e.target.value)}
            style={{ width: "100%", minHeight: "60px" }}
          />
          <br />
          <button onClick={handleAddComment} style={{ marginTop: "4px" }}>
            Add Comment
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              marginBottom: "8px",
            }}
          >
            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  style={{ width: "100%", minHeight: "60px" }}
                />
                <button onClick={() => handleEditComment(comment.id)}>
                  Save
                </button>
                <button onClick={() => setEditingCommentId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <p>{comment.content}</p>
            )}

            {loggedInUserId === comment.user_id &&
              editingCommentId !== comment.id && (
                <>
                  <button onClick={() => handleDeleteComment(comment.id)}>
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditingContent(comment.content);
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

export default Comments;
