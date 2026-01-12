import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Spring Boot Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Auth Failures
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only clear session if it's strictly an auth failure (401/403)
        // and NOT on public routes if possible
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Authentication failed or session expired. Redirecting...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Avoid infinite redirect loop
            if (!window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
