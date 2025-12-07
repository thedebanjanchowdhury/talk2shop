
const rawUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = rawUrl.replace(/\/$/, "");

export default BACKEND_URL;
