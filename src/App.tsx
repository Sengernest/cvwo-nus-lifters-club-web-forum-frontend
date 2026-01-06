import React, { useEffect } from "react";
import API from "./services/api";

const App: React.FC = () => {
  useEffect(() => {
    API.get("/")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }, []);

  return <div>Frontend connected to backend with TypeScript!</div>;
};

export default App;
