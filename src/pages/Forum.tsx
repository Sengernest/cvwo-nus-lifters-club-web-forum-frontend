import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Topic } from "../services/types";

const Forum: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch topics from backend
  const fetchTopics = () => {
    setLoading(true);
    API.get("/topics")
      .then((res) => {
        // Ensure it's always an array
        const data = Array.isArray(res.data) ? res.data : [];
        setTopics(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Create a new topic
  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    API.post("/topics", { title: newTopic })
      .then(() => {
        setNewTopic("");
        fetchTopics();
      })
      .catch((err) => console.error(err));
  };

  // Delete a topic
  const handleDeleteTopic = (id: number) => {
    API.delete(`/topics/${id}`)
      .then(() => fetchTopics())
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Forum Topics</h2>

      {/* Add Topic Form */}
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
            <span>{topic.title}</span>
            <button onClick={() => handleDeleteTopic(topic.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Forum;
