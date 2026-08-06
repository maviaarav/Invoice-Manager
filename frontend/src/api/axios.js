import axios from "axios";
const instance = axios.create({
    baseURL: 'https://maviaarav-invoice-api-d7aqcgd7gaagh7eg.centralindia-01.azurewebsites.net',
    withCredentials: true
})

export default instance