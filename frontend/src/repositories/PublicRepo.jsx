import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
const URL = `${BASE_URL}/public`
const ENDPOINTS = {
    GET_INGREDIENTS: `${URL}/ingredients`,
    GET_CUISINES: `${URL}/cuisines`,
    GET_RECIPES: `${URL}/recipes`,
}

export const getAllRecipes = async({ search=null, page=1, limit=10 }) =>{
    let response = {}
    try{
        response = await MakeApiCall({
            url: ENDPOINTS.GET_RECIPES,
            method: "GET",
            params: {search, page, limit}
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