import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Topic } from "../services/types";

const Topics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const [showAddInput, setShowAddInput] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
        <h2 style={{ margin: 0 }}>Gym Topics</h2>

        {/* Search bar */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search topics"
          style={{ padding: "4px 8px", marginTop: "5px", width: "110px" }}
        />

        {/* Big + button */}
        {loggedInUserId && !showAddInput && (
          <button
            onClick={() => setShowAddInput(true)}
            style={{
              fontSize: "20px",
              padding: "0px 8px",
              marginTop: "5px",
            }}
            title="Add New Topic"
          >
            +
          </button>
        )}
      </div>

      {/* Add topic input */}
      {showAddInput && loggedInUserId && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            value={newTopic}
            placeholder="Enter Topic Title"
            onChange={(e) => setNewTopic(e.target.value)}
            style={{ marginRight: "8px", width: "60%" }}
          />
          <button onClick={handleAddTopic} style={{ marginRight: "4px" }}>
            Add New Topic
          </button>
          <button
            onClick={() => {
              setShowAddInput(false);
              setNewTopic("");
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading topics...</p>
      ) : displayedTopics.length === 0 ? (
        <p>No topics found.</p>
      ) : (
        displayedTopics.map((topic) => (
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

export default Topics;
