import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = "https://authentication-server-fp63.onrender.com";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
                withCredentials: true, // Required to send cookies
            });

            if (data.success) {
                setIsLoggedIn(true);
                getUserData();  // Fetch user data only after successful auth
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Authentication failed");
            setIsLoggedIn(false);
            setUserData(null);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`, {
                withCredentials: true, // Ensure cookies are included
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error("Error fetching user data:", error.response?.data?.message || error.message);
            setUserData(null);
        }
    };

    useEffect(() => {
        getAuthState();
    }, []);

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

