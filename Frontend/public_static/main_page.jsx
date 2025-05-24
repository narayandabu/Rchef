import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to LabCohort</h1>
        <p>Your Assistant For Simplifying Your Research.</p>
        <div className="home-buttons">
          <button onClick={() => navigate("/main/chat")}>Start a Chat</button>
          <button onClick={() => navigate("/main/analyze")}>Analyze a Document</button>
          <button onClick={() => navigate("/main/papers")}>Explore Papers</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
