import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar,
  FileText, 
  FileEdit,
  Settings,
  LogOut 
} from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['abogado', 'secretaria', 'gestor', 'pasante'] },
    { path: '/expedientes', icon: Briefcase, label: 'Expedientes', roles: ['abogado', 'secretaria', 'gestor', 'pasante'] },
    { path: '/clientes', icon: Users, label: 'Clientes', roles: ['abogado', 'secretaria', 'gestor'] },
    { path: '/audiencias', icon: Calendar, label: 'Audiencias', roles: ['abogado', 'secretaria', 'gestor', 'pasante'] },
    { path: '/documentos', icon: FileText, label: 'Documentos', roles: ['abogado', 'secretaria', 'gestor', 'pasante'] },
    { path: '/plantillas', icon: FileEdit, label: 'Plantillas', roles: ['abogado', 'secretaria'] },
    { path: '/agenda', icon: Settings, label: 'Agenda', roles: ['abogado', 'secretaria', 'gestor', 'pasante'] },
  ]

  const getRoleBadge = (rol: string) => {
    const colors: Record<string, string> = {
      abogado: 'badge-success',
      secretaria: 'badge-info',
      gestor: 'badge-warning',
      pasante: 'badge-gray'
    }
    return colors[rol] || 'badge-gray'
  }

  const userNavItems = navItems.filter(item => item.roles.includes(user?.rol || ''))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">Estudio Jurídico</h2>
                <p className="text-xs text-gray-500">Multifuero</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-lg">
                  {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <span className={`badge ${getRoleBadge(user?.rol || '')} mt-1 text-xs`}>
                {user?.rol?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

