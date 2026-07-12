import axios from "axios";
const instance = axios.create({
    baseURL: '/backend',
    withCredentials: true
})

export default instance