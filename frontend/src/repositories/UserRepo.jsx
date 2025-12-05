import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
const URL = `${BASE_URL}/user`
const ENDPOINTS = {
    REGISTER: `${URL}/register`,
    GET_ME: `${URL}/me`,
    DELETE_ME: `${URL}/me`,
}

export const userRegistrationApi = async (data) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.REGISTER, 
            method : "POST",
            data : data, 
            headers : {"Content-Type": "application/json"}
        })
    }catch(error){
        console.error(error);
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to register user");
    }
    return response.data
}

export const getMeApi = async (token='') => {
    let response = {}
    let headers = {}
    if (!!token){
        headers['Authorization'] = `Bearer ${token}`
    }
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.GET_ME,
            method : "GET",
            headers : headers
        })
    }catch(error){
        console.error(`[UserRepo] Error : ${JSON.stringify(error)}`);
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to fetch user profile");
    }
    return response.data
}

export const deleteMeApi = async (token=' ') => {
    let response= {}
    let headers = {}
    if (!!token){
        headers['Authorization'] = `Bearer ${token}`
    }
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.DELETE_ME,
            method : "DELETE",
            headers : headers
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to delete user");
    }
    return response.data
}
