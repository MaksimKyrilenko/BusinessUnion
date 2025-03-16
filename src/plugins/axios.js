import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    }
})

export default axiosInstance 