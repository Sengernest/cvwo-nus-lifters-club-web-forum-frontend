import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { Post, Comment, Topic } from "../services/types";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import PageContainer from "../components/PageContainer";
import ConfirmDialog from "../components/ConfirmDialog";

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

  const [confirm, setConfirm] = useState<{
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });

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
      setShowAddCommentInput(false);
      setNewComment("");
    } else {
      setExpandedPostId(postId);
      fetchComments(postId);
      setShowAddCommentInput(false);
      setNewComment("");
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
    <PageContainer maxWidth="md">
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5">
          Posts {topic ? `— ${topic.title}` : ""}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts"
          />

          <Select
            size="small"
            value={postSortOption}
            onChange={(e) =>
              setPostSortOption(
                e.target.value as "alphabetic" | "recent" | "liked"
              )
            }
          >
            <MenuItem value="alphabetic">Alphabetical</MenuItem>
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="liked">Most Liked</MenuItem>
          </Select>

          {loggedInUserId && !showAddPostInput && (
            <IconButton
              onClick={() => setShowAddPostInput(true)}
              aria-label="add post"
            >
              <AddIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {/* Add post */}
      {showAddPostInput && loggedInUserId && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Post title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                fullWidth
              />
              <TextField
                label="Post content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={() =>
                    setConfirm({
                      open: true,
                      title: "Add Post",
                      message: "Add this new post?",
                      onConfirm: handleAddPost,
                    })
                  }
                >
                  Add Post
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddPostInput(false);
                    setNewTitle("");
                    setNewContent("");
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Posts list */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : displayedPosts.length === 0 ? (
        <Typography>No posts yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {displayedPosts.map((post) => {
            const isOwner = loggedInUserId === post.user_id;
            const isExpanded = expandedPostId === post.id;

            return (
              <Card key={post.id}>
                <CardContent>
                  {editingPostId === post.id ? (
                    <Stack spacing={2}>
                      <TextField
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        label="Edit title"
                        fullWidth
                      />
                      <TextField
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        label="Edit content"
                        fullWidth
                        multiline
                        minRows={3}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          startIcon={<SaveIcon />}
                          variant="contained"
                          onClick={() =>
                            setConfirm({
                              open: true,
                              title: "Save Post",
                              message: "Save changes to this post?",
                              onConfirm: () => handleEditPost(post.id),
                            })
                          }
                        >
                          Save
                        </Button>
                        <Button
                          startIcon={<CloseIcon />}
                          variant="outlined"
                          onClick={() => setEditingPostId(null)}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <>
                      {/* Post Title row */}
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        sx={{ mb: 1, gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ wordBreak: "break-word", flex: 1 }}
                        >
                          {post.title}
                        </Typography>

                        {isOwner && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ flexShrink: 0 }}
                          >
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingPostId(post.id);
                                setEditingTitle(post.title);
                                setEditingContent(post.content);
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() =>
                                setConfirm({
                                  open: true,
                                  title: "Delete Post",
                                  message:
                                    "Are you sure you want to delete this post?",
                                  onConfirm: () => handleDeletePost(post.id),
                                })
                              }
                            >
                              Delete
                            </Button>
                          </Stack>
                        )}
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {post.content}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        By {isOwner ? "You" : post.username || "Unknown"} •{" "}
                        {timeAgo(post.created_at)}
                      </Typography>
                    </>
                  )}
                </CardContent>

                {/* Toggle Like and Comments */}
                {editingPostId !== post.id && (
                  <>
                    <Divider />
                    <CardActions sx={{ justifyContent: "space-between" }}>
                      <Button
                        startIcon={<FavoriteIcon />}
                        onClick={() => handleToggleLikePost(post)}
                        sx={{
                          color: "error.main"
                        }}
                      >
                        {post.likes || 0}
                      </Button>

                      <Button
                        endIcon={
                          isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                        }
                        onClick={() => toggleExpandPost(post.id)}
                      >
                        {isExpanded ? "Hide Comments" : "View Comments"}
                      </Button>
                    </CardActions>
                  </>
                )}

                {/* Comments */}
                {isExpanded && editingPostId !== post.id && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 1, mb: 1 }}
                    >
                      <Typography variant="subtitle1">Comments</Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Select
                          size="small"
                          value={commentSortOption}
                          onChange={(e) =>
                            setCommentSortOption(
                              e.target.value as "recent" | "liked"
                            )
                          }
                        >
                          <MenuItem value="recent">Most Recent</MenuItem>
                          <MenuItem value="liked">Most Liked</MenuItem>
                        </Select>

                        {loggedInUserId && !showAddCommentInput && (
                          <IconButton
                            onClick={() => setShowAddCommentInput(true)}
                            aria-label="add comment"
                          >
                            <AddIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>

                    {showAddCommentInput && (
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <TextField
                              label="New comment"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              fullWidth
                              multiline
                              minRows={2}
                            />
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="contained"
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    title: "Add Comment",
                                    message: "Add this new comment?",
                                    onConfirm: () => {
                                      handleAddComment(post.id);
                                      setShowAddCommentInput(false);
                                    },
                                  })
                                }
                              >
                                Add Comment
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setShowAddCommentInput(false);
                                  setNewComment("");
                                }}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {comments.length === 0 ? (
                      <Typography variant="body2">No comments yet.</Typography>
                    ) : (
                      <Stack spacing={1}>
                        {comments
                          .slice()
                          .sort((a, b) =>
                            commentSortOption === "liked"
                              ? (b.likes || 0) - (a.likes || 0)
                              : new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                          )
                          .map((comment) => {
                            const isCommentOwner =
                              loggedInUserId === comment.user_id;

                            return (
                              <Card key={comment.id} variant="outlined">
                                <CardContent>
                                  {editingCommentId === comment.id ? (
                                    <Stack spacing={2}>
                                      <TextField
                                        value={editingCommentContent}
                                        onChange={(e) =>
                                          setEditingCommentContent(
                                            e.target.value
                                          )
                                        }
                                        label="Edit comment"
                                        fullWidth
                                        multiline
                                        minRows={2}
                                      />
                                      <Stack direction="row" spacing={1}>
                                        <Button
                                          variant="contained"
                                          startIcon={<SaveIcon />}
                                          onClick={() =>
                                            setConfirm({
                                              open: true,
                                              title: "Save Comment",
                                              message:
                                                "Save changes to this comment?",
                                              onConfirm: () =>
                                                handleEditComment(comment.id),
                                            })
                                          }
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          startIcon={<CloseIcon />}
                                          onClick={() =>
                                            setEditingCommentId(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  ) : (
                                    <>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          whiteSpace: "pre-wrap",
                                          overflowWrap: "break-word",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {comment.content}
                                      </Typography>

                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ mt: 1 }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          By{" "}
                                          {isCommentOwner
                                            ? "You"
                                            : comment.username ||
                                              "Unknown"}{" "}
                                          • {timeAgo(comment.created_at)}
                                        </Typography>

                                        {isCommentOwner && (
                                          <Stack direction="row" spacing={1}>
                                            <Button
                                              size="small"
                                              startIcon={<EditIcon />}
                                              onClick={() => {
                                                setEditingCommentId(comment.id);
                                                setEditingCommentContent(
                                                  comment.content
                                                );
                                              }}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              size="small"
                                              color="error"
                                              startIcon={<DeleteIcon />}
                                              onClick={() =>
                                                setConfirm({
                                                  open: true,
                                                  title: "Delete Comment",
                                                  message:
                                                    "Are you sure you want to delete this comment?",
                                                  onConfirm: () =>
                                                    handleDeleteComment(
                                                      comment.id
                                                    ),
                                                })
                                              }
                                            >
                                              Delete
                                            </Button>
                                          </Stack>
                                        )}
                                      </Stack>
                                    </>
                                  )}
                                </CardContent>

                                {editingCommentId !== comment.id && (
                                  <CardActions
                                    sx={{ justifyContent: "space-between" }}
                                  >
                                    <Button
                                      startIcon={<FavoriteIcon />}
                                      onClick={() =>
                                        handleToggleLikeComment(comment)
                                      }
                                      sx={{
                                        color: "error.main"
                                      }}
                                    >
                                      {comment.likes || 0}
                                    </Button>

                                    {comment.likedByUser && (
                                      <Chip
                                        size="small"
                                        label="Liked"
                                        color="error"
                                        variant="outlined"
                                      />
                                    )}
                                  </CardActions>
                                )}
                              </Card>
                            );
                          })}
                      </Stack>
                    )}
                  </Box>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title || "Confirm"}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </PageContainer>
  );
};

export default Posts;
