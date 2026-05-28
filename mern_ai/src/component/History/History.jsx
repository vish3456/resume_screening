
import styles from './History.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState, useEffect, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Link } from 'react-router-dom';

const getScoreColor = (score) => {
  const num = parseInt(score);
  if (num >= 75) return 'var(--color-success)';
  if (num >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
};

const History = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(true);

  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoader(true);
        if (!userInfo?.id) return;
        const response = await axios.get(`/api/resume/get/${userInfo.id}`);
        setData(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoader(false);
      }
    };

    fetchUserData();
  }, [userInfo]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Resume History</h1>
      <p className={styles.subtitle}>Your past resume analyses and scores</p>

      <div className={styles.grid}>
        {loader ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton
                variant="rectangular"
                height={180}
                sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
              />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className={styles.emptyState}>
            <SearchOffIcon sx={{ fontSize: 56, color: 'var(--text-muted)' }} />
            <h3 className={styles.emptyTitle}>No analyses yet</h3>
            <p className={styles.emptyText}>Upload a resume on the Dashboard to get started</p>
            <Link to="/dashboard" className={styles.emptyLink}>
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardScore} style={{ color: getScoreColor(item.score) }}>
                {item.score}%
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{item.resume_name}</h3>
                <p className={styles.cardFeedback}>{item.feedback}</p>
                <div className={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WithAuthHOC(History);
