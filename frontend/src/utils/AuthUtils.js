import Constants from "./Constants";

export const isAuthenticated = () => {
    const token = localStorage.getItem(Constants.LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    return !!token
}

export const isEntityAuthorized = (allowedEntity) => {
    const signedInEntity = localStorage.getItem(Constants.LOCAL_STORAGE_ACCESS_ENTITY_KEY);
    console.log({signedInEntity, allowedEntity, empty: !!signedInEntity, second: allowedEntity == signedInEntity})
    return !!signedInEntity && allowedEntity === signedInEntity;
}

export const logOut = (clearAll = false, additional_keys = []) => {
    localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_USER_INFO);
    localStorage.removeItem(Constants.LOCAL_STORAGE_ACCESS_ENTITY_KEY);
    if (additional_keys && additional_keys.length) {
        additional_keys.forEach(key => localStorage.removeItem(key));
    }
    if (clearAll) {
        localStorage.clear();
    }
}

export const clearStorage = () => {
    localStorage.clear();
}

export const handleLoginSuccess = (entity, access_token, setUser, userType) => {
    try{
        const userInfo = { access_token, entity, userType };
        localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_TOKEN_KEY, access_token);
        localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_ENTITY_KEY, entity);
        localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_USER_TYPE_KEY, userType);
        localStorage.setItem(Constants.LOCAL_STORAGE_ACCESS_USER_INFO, JSON.stringify(userInfo));
        // console.log(userInfo)
        setUser(userInfo);
    }catch(error){
        console.error("Failed to handle login success", error);
    }
}