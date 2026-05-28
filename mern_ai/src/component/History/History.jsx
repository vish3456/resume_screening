
import styles from './History.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState, useEffect, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';

const History = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState('');

  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchUserData = async () => {
      setLoader(true);
      setError('');

      try {
        const response = await axios.get(`/api/resume/get/${userInfo.id}`);
        setData(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch resume history:', err);
        setError('Unable to load resume history right now.');
      } finally {
        setLoader(false);
      }
    }

    fetchUserData()
  }, [userInfo?.id])

  return (
    <div className={styles.History}>
      <div className={styles.HistoryCardBlock}>

        {
          loader && <>

            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              width={266}
              height={200}
              sx={{ borderRadius: "20px" }}
            />

          </>
        }

        {
          !loader && error && <p className={styles.HistoryMessage}>{error}</p>
        }

        {
          !loader && !error && data.length === 0 && (
            <p className={styles.HistoryMessage}>No resume analysis history yet.</p>
          )
        }

        {
          data.map((item) => {
            return (
              <div key={item.id} className={styles.HistoryCard}>
                <div className={styles.cardPercentage}>{item.score}%</div>
                {/* <h2 >{Frontend Developer}</h2> */}
                <p>Resume Name : {item.resume_name}</p>
                <p>{item.feedback}</p>
                <p>Dated : {item.createdAt?.slice(0, 10)}</p>
              </div>
            );
          })
        }



      </div>

    </div>
  )
}

export default WithAuthHOC(History)
