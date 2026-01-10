import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import API from "../services/api";
import { Topic } from "../services/types";
import PageContainer from "../components/PageContainer";
import ConfirmDialog from "../components/ConfirmDialog";

const Topics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const [showAddInput, setShowAddInput] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [confirm, setConfirm] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const loggedInUser = token
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const loggedInUserId = loggedInUser ? loggedInUser.id : null;

  const fetchTopics = () => {
    setLoading(true);
    API.get("/topics")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setTopics(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleAddTopic = () => {
    if (!loggedInUserId) return;
    if (!newTopic.trim()) return;

    API.post("/topics", { title: newTopic })
      .then(() => {
        setNewTopic("");
        setShowAddInput(false);
        fetchTopics();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteTopic = (id: number) => {
    if (!loggedInUserId) return;

    API.delete(`/topics/${id}`)
      .then(() => fetchTopics())
      .catch((err) => console.error(err));
  };

  const handleEditTopic = (id: number) => {
    if (!editingTitle.trim()) return;

    API.put(
      `/topics/${id}`,
      { title: editingTitle },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setEditingTopicId(null);
        setEditingTitle("");
        fetchTopics();
      })
      .catch((err) => console.error(err));
  };

  const displayedTopics =
    searchTerm.trim() === ""
      ? topics
      : topics.filter((t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <PageContainer maxWidth="md">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Gym Topics</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics"
          />

          {loggedInUserId && !showAddInput && (
            <IconButton
              onClick={() => setShowAddInput(true)}
              aria-label="add topic"
            >
              <AddIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {showAddInput && loggedInUserId && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="New topic title"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={() =>
                    setConfirm({
                      open: true,
                      message: "Are you sure you want to add this new topic?",
                      onConfirm: handleAddTopic,
                    })
                  }
                >
                  Add Topic
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddInput(false);
                    setNewTopic("");
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : displayedTopics.length === 0 ? (
        <Typography>No topics found.</Typography>
      ) : (
        <Stack spacing={2}>
          {displayedTopics.map((topic) => {
            const isOwner = loggedInUserId && topic.user_id === loggedInUserId;

            return (
              <Card key={topic.id}>
                <CardContent>
                  {editingTopicId === topic.id ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        fullWidth
                      />
                      <IconButton
                        onClick={() =>
                          setConfirm({
                            open: true,
                            message: "Save changes to this topic?",
                            onConfirm: () => handleEditTopic(topic.id),
                          })
                        }
                        aria-label="save"
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setEditingTopicId(null)}
                        aria-label="cancel"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Typography
                      variant="h6"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/forum/${topic.id}`)}
                    >
                      {topic.title}
                    </Typography>
                  )}
                </CardContent>

                {isOwner && editingTopicId !== topic.id && (
                  <CardActions>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setEditingTopicId(topic.id);
                        setEditingTitle(topic.title);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() =>
                        setConfirm({
                          open: true,
                          message:
                            "Are you sure you want to delete this topic?",
                          onConfirm: () => handleDeleteTopic(topic.id),
                        })
                      }
                    >
                      Delete
                    </Button>
                  </CardActions>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Confirm"
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </PageContainer>
  );
};

export default Topics;
