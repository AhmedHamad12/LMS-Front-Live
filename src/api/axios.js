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
  
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    try {
      const cookies = new Cookies();
      // TODO: return to dynamic token
      const token = cookies.get("token");
      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIwNjM1OTE2LTkyNDctNDAwMi1hOGRmLWU3YzMyMTUxNWU1NSIsInVzZXJJZCI6IjIwNjM1OTE2LTkyNDctNDAwMi1hOGRmLWU3YzMyMTUxNWU1NSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6IkFib0hhbnkiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJtb2hhbWVkaGFueTQ0MDFAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVGVhY2hlciIsInJvbGVzIjoiVGVhY2hlciIsImV4cCI6MTc1NzQ1Mjk2NywiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzI1MS8iLCJhdWQiOiJNeVNlY3VyZUF1ZGllbmNlIn0.bJpgwoBHtLyIMkIU-fOkX4w4FA6N1UaYvpoy6Rq-MqQ"
      if (token && !config.headers?.Authorization) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    
    console.log("Making request:", {
      url: config.url,
      method: config.method,
      hasAuthHeader: !!config.headers?.Authorization,
      hasCookies: !!config.withCredentials
    });
    
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
