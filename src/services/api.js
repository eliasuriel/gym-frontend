import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://localhost:8080/api',
    // Usa la misma IP/nombre desde el que se abrió la página, así funciona en cualquier PC de la red
    baseURL: `http://${window.location.hostname}:8080/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;