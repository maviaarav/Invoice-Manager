import axios from "axios";
const instance = axios.create({
    baseURL: 'https://api.invoizor.me',
    withCredentials: true
})

export default instance