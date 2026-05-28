import React, { useState, useEffect } from "react";
import styles from "./LoadingOverlay.module.css";

const STATUS_MESSAGES = [
  "Extracting resume content...",
  "Analyzing against job description...",
  "Scoring candidates...",
  "Ranking results...",
  "Almost done...",
];

const LoadingOverlay = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <div className={styles.statusText}>{STATUS_MESSAGES[messageIndex]}</div>
      <div className={styles.dots}>● ● ●</div>
    </div>
  );
};

export default LoadingOverlay;

