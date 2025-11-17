import { useEffect, useMemo, useState } from 'react'
import { Plus, Edit3, Lock, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: 'abogado' | 'secretaria' | 'gestor' | 'pasante'
  telefono?: string
  activo: boolean
  created_at: string
}

type ModalMode = 'create' | 'edit' | 'reset'

const ROLES = [
  { value: 'abogado', label: 'Abogado/a' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'pasante', label: 'Pasante' }
]

const defaultForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  rol: 'abogado' as Usuario['rol'],
  password: ''
}

export default function Usuarios() {
  const { user } = useAuthStore()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [formData, setFormData] = useState(defaultForm)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetPassword, setResetPassword] = useState('')

  const adminEmails = useMemo(() => {
    const value = import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || 'admin@estudiojuridico.com'
    return value
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter((email: string) => email.length > 0)
  }, [])

  const isAdminUser = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Usuario[]>('/usuarios')
      setUsuarios(data)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdminUser) {
      fetchUsuarios()
    }
  }, [isAdminUser])

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedUser(null)
    setFormData({ ...defaultForm })
    setModalOpen(true)
  }

  const openEditModal = (usuario: Usuario) => {
    setModalMode('edit')
    setSelectedUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      password: ''
    })
    setModalOpen(true)
  }

  const openResetModal = (usuario: Usuario) => {
    setModalMode('reset')
    setSelectedUser(usuario)
    setResetPassword('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
    setFormData({ ...defaultForm })
    setResetPassword('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modalMode === 'create') {
        await api.post('/usuarios', formData)
        toast.success('Usuario creado correctamente')
      } else if (modalMode === 'edit' && selectedUser) {
        await api.put(`/usuarios/${selectedUser.id}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          rol: formData.rol
        })
        toast.success('Usuario actualizado')
      }
      await fetchUsuarios()
      closeModal()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ocurrió un error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    if (resetPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    setSaving(true)
    try {
      await api.post(`/usuarios/${selectedUser.id}/reset-password`, { password: resetPassword })
      toast.success('Contraseña restablecida')
      closeModal()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudo restablecer la contraseña')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      await api.patch(`/usuarios/${usuario.id}/estado`, { activo: !usuario.activo })
      toast.success('Estado actualizado')
      await fetchUsuarios()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el estado')
    }
  }

  if (!isAdminUser) {
    return (
      <div className="card text-center py-12">
        <p className="text-lg font-semibold text-gray-700">Solo el administrador puede acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra las cuentas y los accesos del estudio</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsuarios}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {usuario.nombre} {usuario.apellido}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{usuario.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="badge badge-info capitalize">{usuario.rol}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{usuario.telefono || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={usuario.activo}
                          onChange={() => handleToggleActivo(usuario)}
                        />
                        <div className={`w-10 h-5 flex items-center rounded-full p-1 ${usuario.activo ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${usuario.activo ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(usuario)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResetModal(usuario)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            {modalMode === 'reset' ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Restablecer contraseña
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Usuario: <strong>{selectedUser?.nombre} {selectedUser?.apellido}</strong>
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña *</label>
                    <input
                      type="password"
                      className="input-field"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" className="btn-secondary" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Guardando...' : 'Actualizar'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {modalMode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                      <input
                        type="text"
                        name="nombre"
                        className="input-field"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                      <input
                        type="text"
                        name="apellido"
                        className="input-field"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="input-field"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                      <select
                        name="rol"
                        className="input-field"
                        value={formData.rol}
                        onChange={handleChange}
                        required
                      >
                        {ROLES.map((rol) => (
                          <option key={rol.value} value={rol.value}>
                            {rol.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="text"
                        name="telefono"
                        className="input-field"
                        value={formData.telefono}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña temporal *</label>
                      <input
                        type="password"
                        name="password"
                        className="input-field"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">El usuario deberá cambiarla luego desde su perfil.</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-3">
                    <button type="button" className="btn-secondary" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

