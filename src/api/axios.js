import axios from "axios";
import { Cookies } from "react-cookie";

const BASE_URL = "http://lms278.runasp.net";

// Global function to show unauthorized overlay - will be set by AuthContext
let showUnauthorizedOverlay = null;

// Function to set the showUnauthorizedOverlay function from AuthContext
export const setUnauthorizedHandler = (handler) => {
  showUnauthorizedOverlay = handler;
};

// Create a single axios instance for the app
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Send cookies with cross-origin requests
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    try {
      const cookies = new Cookies();
      const token = cookies.get("token");
      if (token && !config.headers?.Authorization) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
      // no-op: if cookies aren't accessible, proceed without token
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor: surface 401s so UI can react (e.g., AddCourse error component)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    console.error("Response interceptor error:", {
      status,
      url: error?.config?.url,
      method: error?.config?.method,
      message: error?.message,
      responseData: error?.response?.data
    });
    
    if (status === 401) {
      console.error("401 Unauthorized error detected");
      // Show unauthorized overlay if handler is available
      if (showUnauthorizedOverlay) {
        const message = error?.response?.data?.message || 
          "لا يمكن الوصول لبيانات المستخدم. قد تكون هناك مشكلة في الصلاحيات أو الجلسة منتهية.";
        console.log("Showing unauthorized overlay with message:", message);
        showUnauthorizedOverlay(message);
      } else {
        console.warn("showUnauthorizedOverlay handler not set");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
