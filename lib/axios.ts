import axios from 'axios'

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api',
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
