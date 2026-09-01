import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT (+ laisser FormData gérer son Content-Type)
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('esante_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const familleProfilId = localStorage.getItem('djamsante_famille_profil_id');
        if (familleProfilId) {
            config.headers['X-Famille-Profil-Id'] = familleProfilId;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            if (!config.timeout) {
                config.timeout = 60000;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 + token refresh
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('esante_refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const result = data.data || data;
                const token = result.token || result.accessToken;
                localStorage.setItem('esante_access_token', token);
                if (result.refreshToken) {
                    localStorage.setItem('esante_refresh_token', result.refreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${token}`;
                return client(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('esante_access_token');
                localStorage.removeItem('esante_refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default client;
