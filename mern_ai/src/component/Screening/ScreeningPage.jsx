import React, { useState, useMemo } from "react";
import WithAuthHOC from "../../utils/HOC/withAuthHOC";
import WorkIcon from "@mui/icons-material/Work";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DropzoneUploader from "../../components/screening/DropzoneUploader";
import LoadingOverlay from "../../components/screening/LoadingOverlay";
import ScreeningToolbar from "../../components/screening/ScreeningToolbar";
import CandidateCard from "../../components/screening/CandidateCard";
import { screenResumes, exportCSV, exportExcel } from "../../services/screeningService";
import styles from "./ScreeningPage.module.css";

const RESUME_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const JD_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

const ScreeningPage = () => {
  const [jdTab, setJdTab] = useState("type");
  const [jdText, setJdText] = useState("");
  const [jdFiles, setJdFiles] = useState([]);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rank");

  const hasJD = jdTab === "type" ? jdText.trim().length > 0 : jdFiles.length > 0;
  const hasResumes = resumeFiles.length > 0;
  const canSubmit = hasJD && hasResumes && !loading;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      if (jdTab === "type") {
        formData.append("jobDescription", jdText);
      } else {
        formData.append("jdFile", jdFiles[0]);
      }
      resumeFiles.forEach((file) => {
        formData.append("resumes", file);
      });
      const response = await screenResumes(formData);
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJdText("");
    setJdFiles([]);
    setResumeFiles([]);
    setResult(null);
    setError("");
    setSearchTerm("");
    setSortBy("rank");
  };

  const filteredCandidates = useMemo(() => {
    if (!result?.candidates) return [];
    let list = [...result.candidates];

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
  }, [result, searchTerm, sortBy]);

  const handleExportCSV = () => {
    if (result?.id) exportCSV(result.id);
  };

  const handleExportExcel = () => {
    if (result?.id) exportExcel(result.id);
  };

  return (
    <div className={styles.screeningPage}>
      {loading && <LoadingOverlay />}

      <div className={styles.pageTitle}>Resume Screener</div>
      <div className={styles.pageSubtitle}>
        Upload resumes and a job description to AI-rank your candidates instantly.
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <ErrorOutlineIcon sx={{ fontSize: 20 }} />
          {error}
        </div>
      )}

      {!result && (
        <>
          <div className={styles.inputGrid}>
            {/* Left Card - Job Description */}
            <div className={styles.inputCard}>
              <div className={styles.cardTitle}>
                <WorkIcon className={styles.cardTitleIcon} sx={{ fontSize: 24 }} />
                Job Description
              </div>

              <div className={styles.tabs}>
                <button
                  className={[
                    styles.tab,
                    jdTab === "type" ? styles.tabActive : "",
                  ].join(" ")}
                  onClick={() => setJdTab("type")}
                >
                  Type JD
                </button>
                <button
                  className={[
                    styles.tab,
                    jdTab === "upload" ? styles.tabActive : "",
                  ].join(" ")}
                  onClick={() => setJdTab("upload")}
                >
                  Upload JD File
                </button>
              </div>

              {jdTab === "type" ? (
                <>
                  <textarea
                    className={styles.jdTextarea}
                    placeholder="Paste or type the job description here..."
                    rows={8}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                  <div className={styles.charCount}>
                    {jdText.length} characters
                  </div>
                </>
              ) : (
                <DropzoneUploader
                  files={jdFiles}
                  setFiles={setJdFiles}
                  accept={JD_ACCEPT}
                  maxFiles={1}
                  multiple={false}
                  label="Drop your JD file here"
                  sublabel="PDF, DOC, DOCX, or TXT"
                />
              )}
            </div>

            {/* Right Card - Upload Resumes */}
            <div className={styles.inputCard}>
              <div className={styles.cardTitle}>
                <UploadFileIcon
                  className={styles.cardTitleIcon}
                  sx={{ fontSize: 24 }}
                />
                Upload Resumes
              </div>
              <DropzoneUploader
                files={resumeFiles}
                setFiles={setResumeFiles}
                accept={RESUME_ACCEPT}
                maxFiles={10}
                multiple={true}
                label="Drop resume files here"
                sublabel="Up to 10 files — PDF, DOC, DOCX"
              />
            </div>
          </div>

          <div className={styles.submitBtnWrapper}>
            <button
              className={styles.submitBtn}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              🔍 Screen Resumes
            </button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className={styles.resultsHeader}>
            <div>
              <div className={styles.resultsTitle}>Screening Results</div>
              <div className={styles.resultsMeta}>
                {result.candidates?.length || 0} candidates •{" "}
                {new Date(result.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
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

          <button className={styles.newScreeningBtn} onClick={handleReset}>
            <RefreshIcon sx={{ fontSize: 20 }} />
            New Screening
          </button>
        </>
      )}
    </div>
  );
};

export default WithAuthHOC(ScreeningPage);

