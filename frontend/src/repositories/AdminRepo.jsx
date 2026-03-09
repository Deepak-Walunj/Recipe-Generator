import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_PORT_URL
const URL = `${BASE_URL}/admin`
const ENDPOINTS = {
    REGISTER: `${URL}/register`,
    GET_ME: `${URL}/me`,
    DELETE_ME: `${URL}/me`,
    GET_USERS: `${URL}/entities`,
    GET_USER: `${URL}/entity`,
    ADD_CUISINE: `${URL}/cuisine`,
    ADD_INGREDIENT: `${URL}/ingredient`,
    ADD_RECIPE: `${URL}/recipe`,
    DELETE_RECIPE: `${URL}/recipe/:recipe_id`,
    GET_RECIPES: `${URL}/recipes`,
    GET_RECIPE: `${URL}/recipe/:recipe_id`,
    DELETE_ENTITY: `${URL}/entity`,
    UPDATE_ENTITY: `${URL}/entity`,
    GET_RECIPE_STEPS: `${URL}/recipe-steps/:recipe_id`,
    UPDATE_RECIPE: `${URL}/recipe/:recipe_id`
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

export const getMeApi = async () => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.GET_ME,
            method : "GET"
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

export const deleteAdminApi = async () => {
    let response= {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.DELETE_ME,
            method : "DELETE"
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

export const deleteEntityApi = async (data) => {
    let response= {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.DELETE_ENTITY,
            method : "DELETE",
            data: data
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

export const updateEntityApi = async (data) => {
    let response= {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.UPDATE_ENTITY,
            method : "PUT",
            data: data
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if (response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to update user");
    }
    return response.data
}

export const getEntity = async (data) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.GET_USER,
            method : "GET",
            params: data
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if(response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to fetch user");
    }
    return response.data
}

export const getAllUsers = async ({search=null, page=1, limit=10}) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.GET_USERS,
            method : "GET",
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

export const addRecipe = async (data) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.ADD_RECIPE,
            method : "POST",
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

export const getRecipe = async (recipeId) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.GET_RECIPE.replace(":recipe_id", recipeId),
            method : "GET",
            params: { recipeId}
        })
    }catch (error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong")
    }
    if (response.status != 200){
        const backendMessage = response?.data?.message
        const detailsMessage = response?.data?.details?.[0]?.message
        throw new Error(backendMessage || detailsMessage || "Unable to fetch recipe")
    }
    return response.data
}

export const deleteRecipe = async (recipeId) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.DELETE_RECIPE.replace(":recipe_id", recipeId),
            method : "DELETE",
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

export const getRecipeSteps = async (recipe_id) => {
    let response = {}
    try{
        response = await MakeApiCall({
            url: ENDPOINTS.GET_RECIPE_STEPS.replace(":recipe_id", recipe_id),
            method: "GET",
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if (response.status != 200){
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to fetch response")
    }
    return response.data
} 

export const updateRecipe = async (recipe_id, data) => {
    let response= {}
    try{
        response = await MakeApiCall({
            url : ENDPOINTS.UPDATE_RECIPE.replace(":recipe_id", recipe_id),
            method : "PUT",
            data: data
        })
    }catch(error){
        console.error(error)
        throw new Error(error?.response?.data?.message || "Something went wrong.")
    }
    if (response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Unable to update user");
    }
    return response.data
}