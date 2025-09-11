import axios from 'axios';
import Constants from './Constants'
import { logOut } from './AuthUtils';

const axiosInstance = axios.create()

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(Constants.LOCAL_STORAGE_ACCESS_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.debug("[ApiUtils] Auth token added to request");
        }else{
            console.warn("[ApiUtils] No auth token found in localStorage");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

/**
 * Make an API call with retry and error handling
 * @param {Object} options - Axios request config
 * @param {boolean} retry - Whether to retry on failure
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries (ms)
 * @param {number[]} errorCodesToNotRetry - HTTP status codes that should not be retried
 * @param {boolean} redirect_on_unauthorized - Whether to redirect to login on 401/403
 */

async function MakeApiCall (options = {}, retry=false, retries=3, delay=500, errorCodesToNotRetry=[400, 401]){
    const { redirect_on_unauthorized = true, ...axiosOptions } = options;
    // if (options.redirect_on_unauthorized !== undefined) {
    //     const { redirect_on_unauthorized, ...restOptions } = options;
    //     options = restOptions;
    // }
    let attempt = 0;
    let data = {};
    let status = 200;

    while (attempt < retries) {
        try{
            const response = await axiosInstance(options);
            data = response.data;
            break
        }catch(error){
            const statusCode = error.response ? error.response.status : null;
            if (statusCode === 401 || statusCode === 403) {
                console.warn("[ApiUtils] Unauthorized or Forbidden - logging out");
                logOut(true);
                if (redirect_on_unauthorized && typeof window !== "undefined")
                    window.location.href = "/";
                throw new Error("Your session has expired. Please log in again.");
            }else if (statusCode === 500) {
                throw new Error(`Server error (status ${error.response.status}): ${error.response.statusText}`);
            }else if (statusCode && errorCodesToNotRetry.includes(statusCode)) {
                status = statusCode;
                data = error.response.data;
                break;
            }else{
                attempt++;
                console.warn(`[ApiUtils] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                if (!retry || attempt === retries) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, delay)); // Delay before retrying
            }
        }
    }
    return { data, status };
}

export default MakeApiCall;
