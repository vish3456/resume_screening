import React, { useContext, useState } from 'react'
import styles from './Login.module.css';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GoogleIcon from '@mui/icons-material/Google';

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
        <div className={styles.Login}>
            <div className={styles.loginCard}>
                <div className={styles.loginCardTitle}>
                    <h1>Login </h1>
                    <VpnKeyIcon />
                </div>

                <button className={styles.googleBtn} onClick={handleLogin} disabled={loading}>
                    <GoogleIcon sx={{ fontSize: 20, color: "red" }} />
                    {loading ? 'Signing in...' : 'Sign in with Google'}
                </button>

            </div>
        </div>
    )
}

export default Login
