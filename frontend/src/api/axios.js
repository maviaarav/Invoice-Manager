import axios from "axios";
const instance = axios.create({
    baseURL: 'https://api.invoizor.me',
    withCredentials: true
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default instance