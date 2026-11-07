import axios from 'axios'

// Set VITE_API_BASE_URL in .env (local) or in your hosting dashboard (production).
// Example: VITE_API_BASE_URL=https://chat-app-backend.onrender.com
export const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

export const httpClient = axios.create({
   baseURL: baseURL,
})
