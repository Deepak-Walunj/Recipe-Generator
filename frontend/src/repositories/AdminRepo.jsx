import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
const URL = `${BASE_URL}/admin`
const ENDPOINTS = {
    REGISTER: `${URL}/register`,
    GET_ME: `${URL}/me`,
    DELETE_ME: `${URL}/me`,
    GET_USERS: `${URL}/users`,
    ADD_CUISINE: `${URL}/cuisine`,
    ADD_INGREDIENT: `${URL}/ingredient`,
    ADD_RECIPE: `${URL}/recipe`,
    DELETE_RECIPE: `${URL}/recipe/:recipe_id`,
}

export const adminRegistrationApi = async (data) => {
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
        throw new Error(backendMessage || detailsMessage || "Unable to register admin");
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
        console.error(error);
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

export const getAllUsers = async ({token='', search=null, page=1, limit=10}) => {
    let response = {}
    let headers = {}
    if (!!token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.GET_USERS,
            method : "GET",
            headers : headers,
            params: { search, page, limit }
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to fetch users");
    }
    return response.data
}

export const addRecipe = async (token='', data) => {
    let response = {}
    let headers = {}
    if (!!token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.ADD_RECIPE,
            method : "POST",
            headers : headers,
            data : data, 
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to fetch users");
    }
    return response.data
}

export const deleteRecipe = async (token='', recipeId) => {
    let response = {}
    let headers = {}
    if (!!token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.DELETE_RECIPE.replace(":recipe_id", recipeId),
            method : "DELETE",
            headers : headers,
            params: { recipeId }
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to fetch users");
    }
    return response.data
}
