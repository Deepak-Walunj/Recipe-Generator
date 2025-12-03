import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
const URL = `${BASE_URL}/public`
const ENDPOINTS = {
    GET_INGREDIENTS: `${URL}/ingredients`,
    GET_CUISINES: `${URL}/cuisines`,
    GET_RECIPES: `${URL}/recipes`,
}