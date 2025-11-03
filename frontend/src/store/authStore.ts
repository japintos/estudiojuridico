import { create } from 'zustand'
import api from '../services/api'

interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: 'abogado' | 'secretaria' | 'gestor' | 'pasante'
  avatar_url?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Función de persistencia simple con localStorage
const persistAuth = (state: Partial<AuthState>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-storage', JSON.stringify(state))
  }
}

const loadAuth = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        return {}
      }
    }
  }
  return {}
}

const initialAuth = loadAuth()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user || null,
  token: initialAuth.token || null,
  isAuthenticated: initialAuth.isAuthenticated || false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      set({ user, token, isAuthenticated: true })
      persistAuth({ user, token, isAuthenticated: true })
      
      // Actualizar headers de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión')
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    persistAuth({ user: null, token: null, isAuthenticated: false })
    delete api.defaults.headers.common['Authorization']
  },
}))

// Cargar token inicial si existe
if (initialAuth.token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialAuth.token}`
}

