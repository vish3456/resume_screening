
import styles from './Dashboard.module.css'
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Skeleton from '@mui/material/Skeleton';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState } from 'react';
import axios from '../../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../../utils/AuthContext';

const Dashboard = () => {
    const [uploadFiletext, setUploadFileText] = useState("Drop your resume or click to browse");
    const [loading, setLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDesc, setJobDesc] = useState("");
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const { userInfo } = useContext(AuthContext);

    const handleOnChangeFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setResumeFile(file);
        setUploadFileText(file.name);
        setError("");
    }

    const handleUpload = async () => {
        if (loading) return;

        if (!userInfo?.id) {
            setError("Please login before analyzing a resume.");
            return;
        }

        if (!resumeFile) {
            setError("Please upload a PDF resume.");
            return;
        }

        if (!jobDesc.trim()) {
            setError("Please paste a job description.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("job_desc", jobDesc);
        formData.append("user", userInfo.id);

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const response = await axios.post("/api/resume/addResume", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setResult(response.data.data);
        } catch (err) {
            console.error("Failed to analyze resume:", err);
            setError(err.response?.data?.message || err.response?.data?.error || "Unable to analyze this resume right now.");
        } finally {
            setLoading(false);
        }
    }

    const getScoreColor = (score) => {
        const num = parseInt(score);
        if (num >= 75) return '#22C55E';
        if (num >= 50) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>AI Resume Analyzer</h1>
                    <p className={styles.subtitle}>Match resumes to any job description with AI-powered analysis</p>
                </div>
                {userInfo && (
                    <div className={styles.userBadge}>
                        <img className={styles.userImg} src={userInfo.photoUrl} alt="" referrerPolicy="no-referrer" />
                        <span>{userInfo.name}</span>
                    </div>
                )}
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}

            <div className={styles.grid}>
                {/* Upload Section */}
                <div className={styles.card} style={{ animationDelay: '0ms' }}>
                    <div className={styles.cardHeader}>
                        <CloudUploadIcon sx={{ fontSize: 20, color: 'var(--accent-primary)' }} />
                        <h2 className={styles.cardTitle}>Upload Resume</h2>
                    </div>

                    <label className={styles.dropZone} htmlFor="resume-upload">
                        <div className={styles.dropIcon}>
                            <CreditScoreIcon sx={{ fontSize: 36, color: 'var(--accent-primary)' }} />
                        </div>
                        <p className={styles.dropText}>{uploadFiletext}</p>
                        <p className={styles.dropHint}>PDF files supported</p>
                    </label>
                    <input id="resume-upload" type="file" accept="application/pdf" onChange={handleOnChangeFile} />
                </div>

                {/* Job Description Section */}
                <div className={styles.card} style={{ animationDelay: '100ms' }}>
                    <div className={styles.cardHeader}>
                        <AutoAwesomeIcon sx={{ fontSize: 20, color: 'var(--accent-secondary)' }} />
                        <h2 className={styles.cardTitle}>Job Description</h2>
                    </div>

                    <textarea
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        className={styles.textarea}
                        placeholder="Paste the job description here..."
                        rows={8}
                    />

                    <button
                        className={styles.analyzeBtn}
                        onClick={handleUpload}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <TrendingUpIcon sx={{ fontSize: 20 }} />
                                Analyze Resume
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Results */}
            {(result || loading) && (
                <div className={styles.resultsSection}>
                    <h2 className={styles.resultsTitle}>Analysis Results</h2>
                    {loading ? (
                        <div className={styles.skeletonCard}>
                            <Skeleton variant="circular" width={80} height={80} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                            <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 2 }} />
                            <Skeleton variant="rectangular" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', mt: 1 }} />
                        </div>
                    ) : result && (
                        <div className={styles.resultCard}>
                            <div className={styles.scoreRing} style={{ '--score-color': getScoreColor(result.score) }}>
                                <span className={styles.scoreValue}>{result.score}%</span>
                                <span className={styles.scoreLabel}>Match</span>
                            </div>
                            <div className={styles.resultMeta}>
                                <h3 className={styles.resultName}>{result.resume_name}</h3>
                                <p className={styles.resultFeedback}>{result.feedback}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default WithAuthHOC(Dashboard)
