import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider=(props)=>{
    const backendUrl = 'https://authentication-server-fp63.onrender.com';
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [userData,setUserData]=useState(null);
    axios.defaults.withCredentials=true;
    const getAuthState = async ()=>{
        try {
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth')
            if(data.success){
                setIsLoggedIn(true)
                getUserData();
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    const getUserData = async () => {
        try {
          const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
          if (data.success) {
            setUserData(data.userData);  // Ensure userData is set here
          }
        } catch (error) {
          console.error(error);
        }
      };
    
      useEffect(() => {
        getUserData();
      }, []); 

      useEffect(()=>{getAuthState()},[]);
      
    
    const value = {
       backendUrl,
       isLoggedIn,setIsLoggedIn,
       userData,setUserData,
       getUserData

    }
    return( 
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
