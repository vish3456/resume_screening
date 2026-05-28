
import styles from './Dashboard.module.css'
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import Skeleton from '@mui/material/Skeleton';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState } from 'react';
import axios from '../../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../../utils/AuthContext';

const Dashboard = () => {
    const [uploadFiletext, setUploadFileText] = useState("Upload your resume");
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

    return (
        <div className={styles.Dashboard}>
            <div className={styles.DashboardLeft}>
                <div className={styles.DashboardHeader}>
                    <div className={styles.DashboardHeaderTitle}>AI Resume Analyzer</div>
                    <div className={styles.DashboardHeaderLargeTitle}>Match resumes to any job description.</div>

                </div>

                <div className={styles.alertInfo}>
                    Upload a PDF resume, paste the job description, and get a match score with feedback.
                    {error && <div className={styles.errorText}>{error}</div>}

                </div>

                <div className={styles.DashboardUploadResume}>
                    <div className={styles.DashboardResumeBlock}>
                        <div className={styles.DashboardInputField}>
                            <CreditScoreIcon sx={{ fontSize: 32, marginRight: 2 }} />
                            <span>{uploadFiletext}</span>
                        </div>
                    </div>

                    <label className={styles.analyzeAIBtn} htmlFor="resume-upload">
                        Choose PDF
                    </label>
                    <input id="resume-upload" type="file" accept="application/pdf" onChange={handleOnChangeFile} />
                </div>

                <div className={styles.jobDesc}>
                    <textarea value={jobDesc} onChange={(e) => { setJobDesc(e.target.value) }} className={styles.textArea} placeholder='Paste Your Job Description' rows={10} cols={50} />
                    <button className={styles.AnalyzeBtn} onClick={handleUpload} disabled={loading}>
                        {loading ? "Analyzing..." : "Analyze"}
                    </button>
                </div>
            </div>

            <div className={styles.DashboardRight}>
                <div className={styles.DashboardRightTopCard}>
                    <div>Analyze With AI</div>

                    <img className={styles.profileImg} src={userInfo?.photoUrl} />

                    <h2>{userInfo?.name}</h2>
                </div>


                {
                    result && <div className={styles.DashboardRightTopCard}>
                        <div>Result</div>

                        <div className={styles.resultScore}>{result.score}%</div>
                        <p className={styles.resultName}>{result.resume_name}</p>
                        <p className={styles.resultFeedback}>{result.feedback}</p>
                        
                    </div>
                }

                {
                    loading && <Skeleton variant="rectangular" sx={{ borderRadius: "20px" }} width={280} height={280} />
                }


            </div>

        </div>


    )
}

export default WithAuthHOC(Dashboard)
