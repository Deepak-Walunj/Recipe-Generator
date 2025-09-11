import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
console.log("BASE_URL from env:", BASE_URL);
const URL = `${BASE_URL}/user`
const ENDPOINTS = {
    REGISTER: `${URL}/register`,
    GET_ME: `${URL}/me`,
    DELETE_ME: `${URL}/me`
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
        throw new Error("Unable to register user")
    }
    return response.data
}