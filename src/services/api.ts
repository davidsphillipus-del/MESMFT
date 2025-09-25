import axios, { AxiosInstance, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken } = response.data.data
          localStorage.setItem('accessToken', accessToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// API Response type
interface ApiResponse<T = any> {
  message: string
  data: T
  success?: boolean
}

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: {
    email: string
    password: string
    role: string
    firstName: string
    lastName: string
    phone: string
  }): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },
}

// Patient API
export const patientAPI = {
  getPatients: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/patients', { params })
    return response.data
  },

  getPatient: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/patients/${id}`)
    return response.data
  },

  updatePatient: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/patients/${id}`, data)
    return response.data
  },

  getMedicalRecords: async (patientId: string): Promise<ApiResponse> => {
    const response = await api.get(`/patients/${patientId}/medical-records`)
    return response.data
  },

  addMedicalRecord: async (patientId: string, data: any): Promise<ApiResponse> => {
    const response = await api.post(`/patients/${patientId}/medical-records`, data)
    return response.data
  },

  getVitalSigns: async (patientId: string): Promise<ApiResponse> => {
    const response = await api.get(`/patients/${patientId}/vital-signs`)
    return response.data
  },

  addVitalSigns: async (patientId: string, data: any): Promise<ApiResponse> => {
    const response = await api.post(`/patients/${patientId}/vital-signs`, data)
    return response.data
  },
}

// Appointment API
export const appointmentAPI = {
  getAppointments: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/appointments', { params })
    return response.data
  },

  getAppointment: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  createAppointment: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/appointments', data)
    return response.data
  },

  updateAppointment: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/appointments/${id}`, data)
    return response.data
  },

  cancelAppointment: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/appointments/${id}/cancel`)
    return response.data
  },
}

// Episode API
export const episodeAPI = {
  getEpisodes: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/episodes', { params })
    return response.data
  },

  getEpisode: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/episodes/${id}`)
    return response.data
  },

  createEpisode: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/episodes', data)
    return response.data
  },

  updateEpisode: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/episodes/${id}`, data)
    return response.data
  },

  getPatientEpisodes: async (patientId: string): Promise<ApiResponse> => {
    const response = await api.get(`/episodes/patient/${patientId}`)
    return response.data
  },
}

// Prescription API
export const prescriptionAPI = {
  getPrescriptions: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/prescriptions', { params })
    return response.data
  },

  getPrescription: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/prescriptions/${id}`)
    return response.data
  },

  createPrescription: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/prescriptions', data)
    return response.data
  },

  updatePrescription: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/prescriptions/${id}`, data)
    return response.data
  },

  dispensePrescription: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/prescriptions/${id}/dispense`)
    return response.data
  },
}

// Medication API
export const medicationAPI = {
  getMedications: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/medications', { params })
    return response.data
  },

  getMedication: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/medications/${id}`)
    return response.data
  },

  createMedication: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/medications', data)
    return response.data
  },

  updateMedication: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/medications/${id}`, data)
    return response.data
  },

  searchMedications: async (query: string): Promise<ApiResponse> => {
    const response = await api.get(`/medications/search/${query}`)
    return response.data
  },

  checkInteractions: async (medicationId: string, otherMedicationIds: string[]): Promise<ApiResponse> => {
    const response = await api.get(`/medications/${medicationId}/interactions`, {
      params: { with: otherMedicationIds }
    })
    return response.data
  },
}

// Notification API
export const notificationAPI = {
  getNotifications: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  getUnreadCount: async (): Promise<ApiResponse> => {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  markAsRead: async (notificationIds: string[]): Promise<ApiResponse> => {
    const response = await api.put('/notifications/mark-read', { notificationIds })
    return response.data
  },

  markSingleAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await api.put(`/notifications/${id}/mark-read`)
    return response.data
  },

  deleteNotification: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },
}

// AI API
export const aiAPI = {
  getDiagnosis: async (symptoms: string[], patientHistory?: any): Promise<ApiResponse> => {
    const response = await api.post('/ai/diagnosis', { symptoms, patientHistory })
    return response.data
  },

  getEducation: async (topic: string, userRole: string): Promise<ApiResponse> => {
    const response = await api.post('/ai/education', { topic, userRole })
    return response.data
  },

  getDiagnosisHistory: async (): Promise<ApiResponse> => {
    const response = await api.get('/ai/diagnosis/history')
    return response.data
  },

  getEducationTopics: async (): Promise<ApiResponse> => {
    const response = await api.get('/ai/education/topics')
    return response.data
  },

  getAIStatus: async (): Promise<ApiResponse> => {
    const response = await api.get('/ai/status')
    return response.data
  },
}

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get('/health')
    return response.data
  },
}

// Export the main api instance for custom requests
export default api
