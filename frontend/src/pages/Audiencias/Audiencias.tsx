import { useEffect, useState } from 'react'
import { Calendar, Plus, X, Edit, Trash2, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'

interface Audiencia {
  id: number
  tipo: string
  fecha_hora: string
  resultado?: string
  realizada: boolean
  numero_expediente: string
  caratula: string
  sala?: string
  juez?: string
  secretario?: string
  observaciones?: string
  fuero?: string
}

interface Expediente {
  id: number
  numero_expediente: string
  caratula: string
  fuero: string
  estado: string
}

export default function Audiencias() {
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAudiencia, setSelectedAudiencia] = useState<Audiencia | null>(null)
  const { user } = useAuthStore()

  // Función para obtener fecha y hora por defecto (próximo día hábil a las 07:30)
  const getDefaultDateTime = (): string => {
    const ahora = new Date()
    let fecha = new Date(ahora)
    
    // Si es fin de semana, avanzar al lunes
    const diaSemana = fecha.getDay()
    if (diaSemana === 0) { // Domingo
      fecha.setDate(fecha.getDate() + 1) // Lunes
    } else if (diaSemana === 6) { // Sábado
      fecha.setDate(fecha.getDate() + 2) // Lunes
    } else if (fecha.getHours() >= 18 || (fecha.getHours() === 17 && fecha.getMinutes() >= 30)) {
      // Si ya pasó el horario laboral, avanzar al día siguiente
      fecha.setDate(fecha.getDate() + 1)
      // Si el siguiente día es fin de semana, avanzar al lunes
      if (fecha.getDay() === 0) fecha.setDate(fecha.getDate() + 1)
      if (fecha.getDay() === 6) fecha.setDate(fecha.getDate() + 2)
    }
    
    // Establecer hora a 07:30
    fecha.setHours(7, 30, 0, 0)
    
    // Formato para input datetime-local (YYYY-MM-DDTHH:mm)
    return fecha.toISOString().slice(0, 16)
  }

  const [formData, setFormData] = useState({
    expediente_id: '',
    tipo: 'primera_audiencia',
    fecha_hora: getDefaultDateTime(),
    sala: '',
    juez: '',
    secretario: '',
    observaciones: ''
  })

  useEffect(() => {
    fetchAudiencias()
    fetchExpedientes()
  }, [])

  const fetchAudiencias = async () => {
    try {
      const response = await api.get('/audiencias', { params: { realizada: false } })
      setAudiencias(response.data)
    } catch (error) {
      toast.error('Error al cargar audiencias')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpedientes = async () => {
    try {
      const response = await api.get('/expedientes', { params: { estado: 'activo' } })
      setExpedientes(response.data)
    } catch (error) {
      console.error('Error al cargar expedientes:', error)
    }
  }

  const validateFechaHora = (fechaHora: string): string | null => {
    if (!fechaHora) return 'La fecha y hora son requeridas'
    
    const fecha = new Date(fechaHora)
    const ahora = new Date()
    
    // Validar que sea fecha futura
    if (fecha <= ahora) {
      return 'La audiencia debe ser programada para una fecha y hora futura'
    }
    
    // Validar que no sea fin de semana (sábado = 6, domingo = 0)
    const diaSemana = fecha.getDay()
    if (diaSemana === 0 || diaSemana === 6) {
      return 'No se pueden programar audiencias los fines de semana'
    }
    
    // Validar horario laboral (7:30 a 18:00)
    const hora = fecha.getHours()
    const minutos = fecha.getMinutes()
    const horaDecimal = hora + minutos / 60
    if (horaDecimal < 7.5 || horaDecimal >= 18) {
      return 'Las audiencias deben programarse en horario laboral (7:30 - 18:00)'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.expediente_id) {
      toast.error('Debe seleccionar un expediente')
      return
    }
    
    if (!formData.fecha_hora) {
      toast.error('Debe ingresar fecha y hora')
      return
    }
    
    const fechaError = validateFechaHora(formData.fecha_hora)
    if (fechaError) {
      toast.error(fechaError)
      return
    }

    try {
      await api.post('/audiencias', {
        ...formData,
        expediente_id: parseInt(formData.expediente_id)
      })
      
      toast.success('Audiencia creada exitosamente')
      setShowModal(false)
      setFormData({
        expediente_id: '',
        tipo: 'primera_audiencia',
        fecha_hora: getDefaultDateTime(),
        sala: '',
        juez: '',
        secretario: '',
        observaciones: ''
      })
      fetchAudiencias()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear audiencia')
    }
  }

  const handleEdit = (audiencia: Audiencia) => {
    setSelectedAudiencia(audiencia)
    setFormData({
      expediente_id: '',
      tipo: audiencia.tipo,
      fecha_hora: new Date(audiencia.fecha_hora).toISOString().slice(0, 16),
      sala: audiencia.sala || '',
      juez: audiencia.juez || '',
      secretario: audiencia.secretario || '',
      observaciones: audiencia.observaciones || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAudiencia) return
    
    const fechaError = validateFechaHora(formData.fecha_hora)
    if (fechaError) {
      toast.error(fechaError)
      return
    }

    try {
      await api.put(`/audiencias/${selectedAudiencia.id}`, formData)
      toast.success('Audiencia actualizada exitosamente')
      setShowEditModal(false)
      setSelectedAudiencia(null)
      fetchAudiencias()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar audiencia')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta audiencia?')) {
      return
    }

    try {
      await api.delete(`/audiencias/${id}`)
      toast.success('Audiencia eliminada exitosamente')
      fetchAudiencias()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar audiencia')
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      primera_audiencia: 'Primera Audiencia',
      mediacion: 'Mediación',
      instructiva: 'Instructiva',
      vista_causa: 'Vista de Causa',
      medidas_cautelares: 'Medidas Cautelares',
      otra: 'Otra'
    }
    return labels[tipo] || tipo
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFueroLabel = (fuero?: string) => {
    const labels: Record<string, string> = {
      laboral: 'Laboral',
      civil: 'Civil',
      comercial: 'Comercial',
      penal: 'Penal',
      administrativo: 'Admin.',
      familia: 'Familia',
      contencioso: 'Contencioso',
      otros: 'Otros'
    }
    return labels[fuero || ''] || fuero || ''
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audiencias</h1>
          <p className="text-gray-600 mt-1">Próximas audiencias judiciales</p>
        </div>
        {(user?.rol === 'abogado' || user?.rol === 'secretaria') && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Audiencia
          </button>
        )}
      </div>

      {loading ? (
        <div className="card text-center py-12">Cargando...</div>
      ) : audiencias.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay audiencias próximas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiencias.map((aud) => (
            <div key={aud.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{getTipoLabel(aud.tipo)}</h3>
                    {aud.fuero && (
                      <span className="badge badge-info text-xs">{getFueroLabel(aud.fuero)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(aud.fecha_hora)}</span>
                  </div>
                </div>
                <span className={`badge ${aud.realizada ? 'badge-success' : 'badge-warning'}`}>
                  {aud.realizada ? 'Realizada' : 'Pendiente'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Expediente</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{aud.numero_expediente}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{aud.caratula}</p>
                </div>
                
                {aud.sala && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Sala</p>
                    <p className="text-sm text-gray-900">{aud.sala}</p>
                  </div>
                )}
                
                {aud.juez && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Juez</p>
                    <p className="text-sm text-gray-900">{aud.juez}</p>
                  </div>
                )}
                
                {aud.observaciones && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Observaciones</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{aud.observaciones}</p>
                  </div>
                )}
              </div>

              {(user?.rol === 'abogado' || user?.rol === 'secretaria') && (
                <div className="border-t border-gray-200 pt-4 mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(aud)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                  {user?.rol === 'abogado' && (
                    <button
                      onClick={() => handleDelete(aud.id)}
                      className="btn-danger text-sm px-3"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Audiencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nueva Audiencia</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expediente *
                </label>
                <select
                  value={formData.expediente_id}
                  onChange={(e) => setFormData({ ...formData, expediente_id: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Seleccione un expediente</option>
                  {expedientes.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.numero_expediente} - {exp.caratula.substring(0, 60)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Audiencia *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                    className="input-field"
                  >
                    <option value="primera_audiencia">Primera Audiencia</option>
                    <option value="mediacion">Mediación</option>
                    <option value="instructiva">Instructiva</option>
                    <option value="vista_causa">Vista de Causa</option>
                    <option value="medidas_cautelares">Medidas Cautelares</option>
                    <option value="otra">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_hora}
                    onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Solo días hábiles, horario 7:30 - 18:00
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    className="input-field"
                    placeholder="Ej: Sala 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Juez
                  </label>
                  <input
                    type="text"
                    value={formData.juez}
                    onChange={(e) => setFormData({ ...formData, juez: e.target.value })}
                    className="input-field"
                    placeholder="Nombre del juez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secretario
                  </label>
                  <input
                    type="text"
                    value={formData.secretario}
                    onChange={(e) => setFormData({ ...formData, secretario: e.target.value })}
                    className="input-field"
                    placeholder="Nombre del secretario"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Notas, recordatorios, información adicional..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Crear Audiencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Audiencia */}
      {showEditModal && selectedAudiencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Editar Audiencia</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedAudiencia(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Expediente:</p>
              <p className="text-sm font-semibold text-gray-900">{selectedAudiencia.numero_expediente}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedAudiencia.caratula}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Audiencia *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                    className="input-field"
                  >
                    <option value="primera_audiencia">Primera Audiencia</option>
                    <option value="mediacion">Mediación</option>
                    <option value="instructiva">Instructiva</option>
                    <option value="vista_causa">Vista de Causa</option>
                    <option value="medidas_cautelares">Medidas Cautelares</option>
                    <option value="otra">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_hora}
                    onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                    required
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Solo días hábiles, horario 7:30 - 18:00
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    className="input-field"
                    placeholder="Ej: Sala 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Juez
                  </label>
                  <input
                    type="text"
                    value={formData.juez}
                    onChange={(e) => setFormData({ ...formData, juez: e.target.value })}
                    className="input-field"
                    placeholder="Nombre del juez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secretario
                  </label>
                  <input
                    type="text"
                    value={formData.secretario}
                    onChange={(e) => setFormData({ ...formData, secretario: e.target.value })}
                    className="input-field"
                    placeholder="Nombre del secretario"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Notas, recordatorios, información adicional..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedAudiencia(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

