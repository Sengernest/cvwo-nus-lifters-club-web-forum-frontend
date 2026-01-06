import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Post } from "../services/types";

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    API.get("/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((p) => (
          <div
            key={p.id}
            style={{ border: "1px solid #ccc", margin: "8px", padding: "8px" }}
          >
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <small>Topic ID: {p.topic_id}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default Forum;
