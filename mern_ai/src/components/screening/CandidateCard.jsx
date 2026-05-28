import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ScoreRing from "./ScoreRing";
import styles from "./CandidateCard.module.css";

const getRankClass = (rank) => {
  if (rank === 1) return styles.rankGold;
  if (rank === 2) return styles.rankSilver;
  if (rank === 3) return styles.rankBronze;
  return styles.rankDefault;
};

const CandidateCard = ({ candidate, index }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    rank,
    extractedName,
    matchScore,
    originalName,
    summary,
    matchingSkills = [],
    missingSkills = [],
    educationAlignment,
    experienceRelevance,
  } = candidate;

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardHeader}>
        <div className={[styles.rankBadge, getRankClass(rank)].join(" ")}>
          #{rank}
        </div>
        <div className={styles.candidateInfo}>
          <div className={styles.candidateName}>{extractedName || "Unknown Candidate"}</div>
          {originalName && (
            <div className={styles.candidateFile}>{originalName}</div>
          )}
        </div>
        <div className={styles.scoreWrapper}>
          <ScoreRing score={matchScore} size={64} />
        </div>
      </div>

      {summary && <div className={styles.summary}>{summary}</div>}

      {matchingSkills.length > 0 && (
        <div className={styles.skillsSection}>
          <div className={styles.skillsLabel}>Matching Skills</div>
          <div className={styles.skillPills}>
            {matchingSkills.map((skill, i) => (
              <span
                key={`match-${i}`}
                className={[styles.skillPill, styles.skillMatch].join(" ")}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingSkills.length > 0 && (
        <div className={styles.skillsSection}>
          <div className={styles.skillsLabel}>Missing Skills</div>
          <div className={styles.skillPills}>
            {missingSkills.map((skill, i) => (
              <span
                key={`miss-${i}`}
                className={[styles.skillPill, styles.skillMissing].join(" ")}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className={styles.detailsSection}>
          {educationAlignment && (
            <div className={styles.detailBlock}>
              <div className={styles.detailTitle}>Education Alignment</div>
              <div className={styles.detailText}>{educationAlignment}</div>
            </div>
          )}
          {experienceRelevance && (
            <div className={styles.detailBlock}>
              <div className={styles.detailTitle}>Experience Relevance</div>
              <div className={styles.detailText}>{experienceRelevance}</div>
            </div>
          )}
        </div>
      )}

      {(educationAlignment || experienceRelevance) && (
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ExpandLessIcon sx={{ fontSize: 18 }} /> Show Less
            </>
          ) : (
            <>
              <ExpandMoreIcon sx={{ fontSize: 18 }} /> Show Details
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CandidateCard;

