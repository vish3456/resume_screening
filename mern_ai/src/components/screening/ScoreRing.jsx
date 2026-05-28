import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const getScoreColor = (score) => {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

const ScoreRing = ({ score, size = 80 }) => {
  const color = getScoreColor(score);

  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbar
        value={score}
        text={`${score}`}
        styles={buildStyles({
          textSize: "28px",
          textColor: color,
          pathColor: color,
          trailColor: "#e5e7eb",
          pathTransitionDuration: 1.2,
        })}
      />
    </div>
  );
};

export default ScoreRing;

