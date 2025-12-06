import { createContext, useState, useContext, useEffect, useCallback, } from "react";
import Constants from "@utils/Constants";
import React from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userState, setUserState] = useState(() => {
        try{
            const storedUser = localStorage.getItem(Constants.LOCAL_STORAGE_ACCESS_USER_INFO);
            return storedUser ? JSON.parse(storedUser) : null;
        }catch(error){
            console.error("Failed to parse user data from localStorage", error);
            return null;
        }
    });

    const setUser = useCallback((newUser) => {
        setUserState((prevUser) => {
            if (JSON.stringify(prevUser) === JSON.stringify(newUser)){
                return prevUser;
            }
            return newUser;
        })
    }, []);

    useEffect(() => {
        try{
            if (userState) {
                localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_USER_INFO, JSON.stringify(userState));
                if (userState.access_token !== undefined)
                    localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_TOKEN_KEY, userState.access_token);
                if (userState.entity)
                    localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_ENTITY_KEY, userState.entity);
                if (userState.userType)
                    localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_USER_TYPE_KEY, userState.userType);
            }
            else{
                localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_USER_TYPE_KEY);
                localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_USER_INFO);
                localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_TOKEN_KEY);
                localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_ENTITY_KEY);
            }
        }catch(error){
            console.error("Failed to store user data in localStorage", error);
        }
    }, [userState])

    const contextValue = React.useMemo (() => ({
        user: userState,
        userState, 
        setUser, 
        isAuthenticated: !!userState?.access_token && userState?.userType === "logged",
        isDemo: userState?.userType === "demo",
    }), [userState, setUser]);

    return (
        <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
    )
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};