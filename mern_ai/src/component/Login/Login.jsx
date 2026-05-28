import React, { useContext, useState } from 'react'
import styles from './Login.module.css';
import GoogleIcon from '@mui/icons-material/Google';
import ArticleIcon from '@mui/icons-material/Article';

import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const Login = () => {

    const { setLogin, setUserInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (loading) return;

        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            const googleUser = result.user;

            const userPayload = {
                name: googleUser.displayName,
                email: googleUser.email,
                photoUrl: googleUser.photoURL,
            };

            const response = await axios.post('/api/user', userPayload);
            const appUser = response.data.user;

            setUserInfo(appUser);
            localStorage.setItem('userInfo', JSON.stringify(appUser));

            setLogin(true);
            localStorage.setItem("isLogin", "true")

            navigate('/dashboard')
        } catch (err) {
            alert(err?.message || "Something Went Wrong");
            console.log(err)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.loginPage}>
            {/* Animated background mesh */}
            <div className={styles.bgMesh}>
                <div className={styles.meshOrb1} />
                <div className={styles.meshOrb2} />
                <div className={styles.meshOrb3} />
            </div>

            <div className={styles.loginCard}>
                <div className={styles.cardGlow} />
                
                <div className={styles.logoBlock}>
                    <div className={styles.logoIcon}>
                        <ArticleIcon sx={{ fontSize: 32 }} />
                    </div>
                    <h1 className={styles.logoTitle}>ResumeAI</h1>
                    <p className={styles.logoSubtitle}>AI-powered resume screening platform</p>
                </div>

                <div className={styles.divider}>
                    <span>Sign in to continue</span>
                </div>

                <button className={styles.googleBtn} onClick={handleLogin} disabled={loading}>
                    {loading ? (
                        <span className={styles.spinner} />
                    ) : (
                        <GoogleIcon sx={{ fontSize: 20 }} />
                    )}
                    <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>

                <p className={styles.terms}>
                    By signing in, you agree to our terms of service
                </p>
            </div>
        </div>
    )
}

export default Login
