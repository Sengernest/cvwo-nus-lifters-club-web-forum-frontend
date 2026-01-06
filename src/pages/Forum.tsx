import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Topic } from "../services/types";

const Forum: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const loggedInUser = token
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const loggedInUserId = loggedInUser ? loggedInUser.id : null;

  // Fetch topics from backend
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

  // Create a new topic (only if logged in)
  const handleAddTopic = () => {
    if (!loggedInUserId) return; // block public
    if (!newTopic.trim()) return;

    API.post("/topics", { title: newTopic })
      .then(() => {
        setNewTopic("");
        fetchTopics();
      })
      .catch((err) => console.error(err));
  };

  // Delete a topic (only if logged in & owner)
  const handleDeleteTopic = (id: number) => {
    if (!loggedInUserId) return; // block public

    API.delete(`/topics/${id}`)
      .then(() => fetchTopics())
      .catch((err) => console.error(err));
  };

  // Edit a topic (only if logged in & owner)
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

  return (
    <div style={{ padding: "16px" }}>
      <h2>Forum Topics</h2>

      {/* Only logged-in users can see Add Topic form */}
      {loggedInUserId && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            value={newTopic}
            placeholder="Enter topic title"
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <button onClick={handleAddTopic} style={{ marginLeft: "8px" }}>
            +
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading topics...</p>
      ) : topics.length === 0 ? (
        <p>No topics created.</p>
      ) : (
        topics.map((topic) => (
          <div
            key={topic.id}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Topic title or edit input */}
            {editingTopicId === topic.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <button
                  onClick={() => handleEditTopic(topic.id)}
                  style={{ marginLeft: "4px" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTopicId(null)}
                  style={{ marginLeft: "4px" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => navigate(`/forum/${topic.id}`)}
              >
                {topic.title}
              </span>
            )}

            {/* Owner controls: Delete & Edit */}
            {loggedInUserId && topic.user_id === loggedInUserId && (
              <div>
                <button onClick={() => handleDeleteTopic(topic.id)}>
                  Delete
                </button>
                {editingTopicId !== topic.id && (
                  <button
                    onClick={() => {
                      setEditingTopicId(topic.id);
                      setEditingTitle(topic.title);
                    }}
                    style={{ marginLeft: "4px" }}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Forum;
