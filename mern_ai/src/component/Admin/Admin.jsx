import React, { useState, useEffect } from 'react'
import styles from './Admin.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import axios from '../../utils/axios';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../utils/AuthContext';

const getScoreColor = (score) => {
  const num = parseInt(score);
  if (num >= 75) return 'var(--color-success)';
  if (num >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
};

const Admin = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(true);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) return;

    const fetchAllData = async () => {
      try {
        setLoader(true);
        const response = await axios.get('/api/resume/get', {
          headers: {
            'x-user-id': userInfo.id,
          },
        });
        setData(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/screen');
        }
      } finally {
        setLoader(false);
      }
    };

    fetchAllData();
  }, [navigate, userInfo]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Panel</h1>
      <p className={styles.subtitle}>View all resume analyses across users</p>

      <div className={styles.grid}>
        {loader ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
              />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className={styles.emptyState}>
            <SearchOffIcon sx={{ fontSize: 56, color: 'var(--text-muted)' }} />
            <h3 className={styles.emptyTitle}>No data yet</h3>
            <p className={styles.emptyText}>Resume analyses will appear here once users start submitting</p>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className={styles.card}>
              {item.user && (
                <div className={styles.cardUser}>
                  <img
                    className={styles.cardUserAvatar}
                    src={item.user.photoUrl}
                    alt={item.user.name}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className={styles.cardUserName}>{item.user.name}</div>
                    <div className={styles.cardUserEmail}>{item.user.email}</div>
                  </div>
                </div>
              )}
              <div className={styles.cardScore} style={{ color: getScoreColor(item.score) }}>
                {item.score}%
              </div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default WithAuthHOC(Admin);
