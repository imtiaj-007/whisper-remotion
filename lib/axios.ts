import { settings } from '@/config/settings'
import axios from 'axios'

const axiosClient = axios.create({
    baseURL: settings.API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
axiosClient.interceptors.request.use(
    config => {
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// Response interceptor
axiosClient.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default axiosClient
