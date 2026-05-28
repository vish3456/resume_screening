import { createContext, useState } from "react";


export const AuthContext = createContext();

const readStoredUser = () => {
    const userInfoData = localStorage.getItem("userInfo");

    if (!userInfoData) return null;

    try {
        return JSON.parse(userInfoData);
    } catch (err) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("isLogin");
        return null;
    }
}

const AuthProvider = ({children})=>{

    var login = localStorage.getItem('isLogin') === 'true';
    const [isLogin,setLogin] = useState(login);
    const [userInfo,setUserInfo] = useState(readStoredUser);

    return(
        <AuthContext.Provider value={{isLogin,setLogin,userInfo,setUserInfo}}>
            {children}
        </AuthContext.Provider>
    );

}

export default AuthProvider;
