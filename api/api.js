import axios from 'axios';

// Detect the environment variable based on your builder (Vite example below)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export default api;