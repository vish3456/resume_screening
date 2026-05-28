import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WithAuthHOC from "../../utils/HOC/withAuthHOC";
import { Skeleton } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { getHistory, exportCSV, exportExcel } from "../../services/screeningService";
import styles from "./ScreeningHistoryPage.module.css";

const getScoreClass = (score) => {
  if (score >= 75) return styles.scoreGreen;
  if (score >= 50) return styles.scoreAmber;
  return styles.scoreRed;
};

const ScreeningHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setSessions(response.data || []);
      } catch (err) {
        console.error("Failed to fetch screening history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className={styles.historyPage}>
      <div className={styles.pageTitle}>Screening History</div>

      {loading ? (
        <div className={styles.tableCard}>
          <div className={styles.skeletonBlock}>
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={48}
                sx={{ borderRadius: "12px" }}
              />
            ))}
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <SearchOffIcon
            className={styles.emptyIcon}
            sx={{ fontSize: 72 }}
          />
          <div className={styles.emptyTitle}>
            No screenings yet. Start your first one!
          </div>
          <Link to="/screen" className={styles.emptyLink}>
            Go to Resume Screener →
          </Link>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>JD Preview</th>
                <th>Candidates</th>
                <th>Top Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => {
                const topScore =
                  session.topScore ||
                  (session.candidates && session.candidates.length > 0
                    ? Math.max(...session.candidates.map((c) => c.matchScore))
                    : 0);
                return (
                  <tr key={session.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.jdPreview}>
                        {(session.jobDescription || "").slice(0, 120) ||
                          "Uploaded JD file"}
                      </div>
                    </td>
                    <td>
                      {session.candidateCount ||
                        session.candidates?.length ||
                        0}
                    </td>
                    <td>
                      <span
                        className={[
                          styles.topScore,
                          getScoreClass(topScore),
                        ].join(" ")}
                      >
                        {topScore}%
                      </span>
                    </td>
                    <td>
                      {new Date(
                        session.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={[
                            styles.actionBtn,
                            styles.actionBtnPrimary,
                          ].join(" ")}
                          onClick={() =>
                            navigate(
                              `/screen/results/${session.id}`
                            )
                          }
                        >
                          View
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() =>
                            exportCSV(session.id)
                          }
                        >
                          CSV
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() =>
                            exportExcel(session.id)
                          }
                        >
                          Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithAuthHOC(ScreeningHistoryPage);

