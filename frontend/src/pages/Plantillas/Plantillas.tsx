import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileEdit, Plus, Eye } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface Plantilla {
  id: number
  nombre: string
  tipo: string
  fuero: string
  descripcion: string
  activa: boolean
}

export default function Plantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlantillas()
  }, [])

  const fetchPlantillas = async () => {
    try {
      const response = await api.get('/plantillas', { params: { activa: true } })
      setPlantillas(response.data)
    } catch (error) {
      toast.error('Error al cargar plantillas')
    } finally {
      setLoading(false)
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
          onClick={() => toast.info('Funcionalidad en desarrollo - próximo lanzamiento')}
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
              <button className="btn-secondary w-full mt-4">
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

