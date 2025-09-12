import Constants  from '@utils/Constants';
import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
const URL = `${BASE_URL}/auth`
const ENDPOINTS = {
    LOGIN : `${URL}/login`,
}

export const loginApi = async (email, password, entity_type) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.LOGIN,
            method: "POST",
            data : {email, password, entity_type},
            redirect_on_unauthorized : false,
        })
    }catch(error){
        console.error(error);
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        throw new Error("Unable to login")
    }
    return response.data
}

export const companyLoginApi = async (email, password) => {
    return loginApi(email, password, Constants.ENTITY.ADMIN)
}

export const userLoginApi = async (email, password) => {
    return loginApi(email, password, Constants.ENTITY.USER)
}