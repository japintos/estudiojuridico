import { useEffect, useState } from 'react'
import { FileEdit, Plus, Eye, X, FileText } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface Plantilla {
  id: number
  nombre: string
  tipo: string
  fuero: string
  descripcion: string
  contenido?: string
  activa: boolean
}

interface Expediente {
  id: number
  numero_expediente: string
  caratula: string
}

export default function Plantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'demanda',
    fuero: '',
    descripcion: '',
    contenido: '',
    activa: true
  })

  const [generateData, setGenerateData] = useState({
    expediente_id: '',
    variables: {} as Record<string, string>
  })

  useEffect(() => {
    fetchPlantillas()
    fetchExpedientes()
  }, [])

  const fetchPlantillas = async () => {
    try {
      const response = await api.get('/plantillas')
      setPlantillas(response.data)
    } catch (error) {
      toast.error('Error al cargar plantillas')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpedientes = async () => {
    try {
      const response = await api.get('/expedientes')
      setExpedientes(response.data)
    } catch (error) {
      console.error('Error al cargar expedientes:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/plantillas', formData)
      toast.success('Plantilla creada exitosamente')
      setShowModal(false)
      setFormData({
        nombre: '',
        tipo: 'demanda',
        fuero: '',
        descripcion: '',
        contenido: '',
        activa: true
      })
      fetchPlantillas()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear plantilla')
    }
  }

  const handleView = async (id: number) => {
    try {
      const response = await api.get(`/plantillas/${id}`)
      setSelectedPlantilla(response.data)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar plantilla')
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlantilla || !generateData.expediente_id) {
      toast.error('Seleccione un expediente')
      return
    }

    try {
      const response = await api.post('/plantillas/generate', {
        plantilla_id: selectedPlantilla.id,
        expediente_id: parseInt(generateData.expediente_id),
        variables: generateData.variables
      })
      
      // Crear un blob con el contenido y descargarlo
      const blob = new Blob([response.data.contenido_final], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${selectedPlantilla.nombre}_${Date.now()}.txt`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Escrito generado exitosamente')
      setShowGenerateModal(false)
      setGenerateData({ expediente_id: '', variables: {} })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al generar escrito')
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      demanda: 'Demanda',
      contestacion: 'Contestación',
      alegato: 'Alegato',
      recurso: 'Recurso',
      notificacion: 'Notificación',
      otro: 'Otro'
    }
    return labels[tipo] || tipo
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plantillas</h1>
          <p className="text-gray-600 mt-1">Plantillas de escritos y documentos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Plantilla
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">Cargando...</div>
      ) : plantillas.length === 0 ? (
        <div className="card text-center py-12">
          <FileEdit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay plantillas disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plant) => (
            <div key={plant.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-6 h-6 text-primary-700" />
                </div>
                <span className={`badge ${plant.activa ? 'badge-success' : 'badge-gray'}`}>
                  {plant.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{plant.nombre}</h3>
              <p className="text-sm text-gray-600 mb-3">{plant.descripcion}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-700">{getTipoLabel(plant.tipo)}</span>
                {plant.fuero && <span className="text-sm text-gray-600">{plant.fuero}</span>}
              </div>
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => handleView(plant.id)}
                  className="btn-secondary flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </button>
                <button 
                  onClick={() => {
                    setSelectedPlantilla(plant)
                    setShowGenerateModal(true)
                  }}
                  className="btn-primary flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear plantilla */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nueva Plantilla</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="input-field"
                  >
                    <option value="demanda">Demanda</option>
                    <option value="contestacion">Contestación</option>
                    <option value="alegato">Alegato</option>
                    <option value="recurso">Recurso</option>
                    <option value="notificacion">Notificación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuero
                  </label>
                  <select
                    value={formData.fuero}
                    onChange={(e) => setFormData({ ...formData, fuero: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    <option value="laboral">Laboral</option>
                    <option value="civil">Civil</option>
                    <option value="comercial">Comercial</option>
                    <option value="penal">Penal</option>
                    <option value="administrativo">Administrativo</option>
                    <option value="familia">Familia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido * (Use {'{{'}variable{'}}'} para variables)
                </label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  required
                  className="input-field font-mono text-sm"
                  rows={10}
                  placeholder="Ejemplo: Expediente {'{{'}numero_expediente{'}}'} - {'{{'}caratula{'}}'}..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables disponibles: {'{{'}numero_expediente{'}}'}, {'{{'}caratula{'}}'}, {'{{'}juzgado{'}}'}, {'{{'}nombre_cliente{'}}'}, {'{{'}dni_cliente{'}}'}, {'{{'}nombre_abogado{'}}'}, {'{{'}fecha{'}}'}
                </p>
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
                  Crear Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ver plantilla */}
      {showViewModal && selectedPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedPlantilla.nombre}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Descripción:</p>
                <p className="text-gray-900">{selectedPlantilla.descripcion || 'Sin descripción'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Contenido:</p>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {selectedPlantilla.contenido}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal generar escrito */}
      {showGenerateModal && selectedPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generar Escrito</h2>
              <button
                onClick={() => {
                  setShowGenerateModal(false)
                  setSelectedPlantilla(null)
                  setGenerateData({ expediente_id: '', variables: {} })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expediente *
                </label>
                <select
                  value={generateData.expediente_id}
                  onChange={(e) => setGenerateData({ ...generateData, expediente_id: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Seleccione un expediente</option>
                  {expedientes.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.numero_expediente} - {exp.caratula}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variables Adicionales (opcional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Puede agregar variables personalizadas que reemplazarán {'{{'}variable{'}}'} en la plantilla
                </p>
                <textarea
                  placeholder='Ejemplo: {"variable1": "valor1", "variable2": "valor2"}'
                  className="input-field font-mono text-sm"
                  rows={4}
                  onChange={(e) => {
                    try {
                      const vars = e.target.value ? JSON.parse(e.target.value) : {}
                      setGenerateData({ ...generateData, variables: vars })
                    } catch {
                      // Ignorar errores de JSON
                    }
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false)
                    setSelectedPlantilla(null)
                    setGenerateData({ expediente_id: '', variables: {} })
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Generar Escrito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

