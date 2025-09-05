import axios from "axios";
import { Cookies } from "react-cookie";

export const BASE_URL = "https://api.elmohdra.com";

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
  
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    try {
      const cookies = new Cookies();
      // TODO: return to dynamic token
      const token = cookies.get("token");
      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImRjN2UzYzQ1LTRhY2YtNDMwOC05MmJiLTkwMGViYzI5NDcxMSIsInVzZXJJZCI6ImRjN2UzYzQ1LTRhY2YtNDMwOC05MmJiLTkwMGViYzI5NDcxMSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6InN0dWRlbnRtb2hhbWVkIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiU3R1ZGVudEBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdHVkZW50Iiwicm9sZXMiOiJTdHVkZW50IiwiZXhwIjoxNzU3NDU3NjgyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MjUxLyIsImF1ZCI6Ik15U2VjdXJlQXVkaWVuY2UifQ.8llZsZ2wDTI6Xb33zfT7qqzaQTfwpT-NTao4L3t1s6U"
      if (token && !config.headers?.Authorization) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    
   
    
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);
//final

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
        
        showUnauthorizedOverlay(message);
      } else {
        console.warn("showUnauthorizedOverlay handler not set");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
