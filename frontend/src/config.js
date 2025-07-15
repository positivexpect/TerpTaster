// Dynamic API URL configuration
const isDevelopment = process.env.NODE_ENV === "development";
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (isDevelopment
    ? "http://localhost:3001"
    : "https://your-backend-domain.vercel.app");

export default API_BASE_URL;
