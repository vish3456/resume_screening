import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import WithAuthHOC from "../../utils/HOC/withAuthHOC";
import { Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ScreeningToolbar from "../../components/screening/ScreeningToolbar";
import CandidateCard from "../../components/screening/CandidateCard";
import { getSession, exportCSV, exportExcel } from "../../services/screeningService";
import styles from "./ScreeningResultsPage.module.css";

const ScreeningResultsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rank");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await getSession(sessionId);
        setSession(response.data);
      } catch (err) {
        setError("Failed to load screening results.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const filteredCandidates = useMemo(() => {
    if (!session?.candidates) return [];
    let list = [...session.candidates];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          (c.extractedName || "").toLowerCase().includes(q) ||
          (c.originalName || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "score") {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.extractedName || "").localeCompare(b.extractedName || ""));
    } else {
      list.sort((a, b) => a.rank - b.rank);
    }

    return list;
  }, [session, searchTerm, sortBy]);

  const handleExportCSV = () => exportCSV(sessionId);
  const handleExportExcel = () => exportExcel(sessionId);

  return (
    <div className={styles.resultsPage}>
      <div className={styles.breadcrumb}>
        <Link to="/screen/history" className={styles.breadcrumbLink}>
          History
        </Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <span>Session Results</span>
      </div>

      <button
        className={styles.backBtn}
        onClick={() => navigate("/screen/history")}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        Back to History
      </button>

      {error && (
        <div className={styles.errorAlert}>
          <ErrorOutlineIcon sx={{ fontSize: 20 }} />
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={220}
              sx={{ borderRadius: "20px" }}
            />
          ))}
        </div>
      ) : (
        session && (
          <>
            <div className={styles.pageTitle}>Session Results</div>
            <div className={styles.pageMeta}>
              {session.candidates?.length || 0} candidates •{" "}
              {new Date(
                session.createdAt || Date.now()
              ).toLocaleDateString()}
            </div>

            <ScreeningToolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
            />

            <div className={styles.resultsGrid}>
              {filteredCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.rank || index}
                  candidate={candidate}
                  index={index}
                />
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default WithAuthHOC(ScreeningResultsPage);

