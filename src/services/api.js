import axios from 'axios';

const api = axios.create({
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

// Si la sesión caducó o el token ya no es válido, el backend responde 401/403 sin mensaje.
// En ese caso se limpia la sesión guardada y se vuelve al login, en vez de mostrar errores.
// (Un 403 por falta de permisos SÍ trae "mensaje" y no cierra la sesión.)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const sinMensaje = !error.response?.data?.mensaje;
        const esLogin = (error.config?.url || '').includes('/auth/');

        if ((status === 401 || (status === 403 && sinMensaje)) && !esLogin && localStorage.getItem('token')) {
            localStorage.clear();
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;