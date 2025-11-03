import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface Audiencia {
  id: number
  tipo: string
  fecha_hora: string
  resultado: string
  realizada: boolean
  numero_expediente: string
  caratula: string
}

export default function Audiencias() {
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAudiencias()
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
    return date.toLocaleString('es-AR')
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audiencias</h1>
          <p className="text-gray-600 mt-1">Próximas audiencias judiciales</p>
        </div>
        <button 
          onClick={() => toast.info('Funcionalidad en desarrollo - próximo lanzamiento')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Audiencia
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">Cargando...</div>
      ) : audiencias.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay audiencias próximas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audiencias.map((aud) => (
            <div key={aud.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{getTipoLabel(aud.tipo)}</h3>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(aud.fecha_hora)}</p>
                </div>
                <span className={`badge ${aud.realizada ? 'badge-success' : 'badge-warning'}`}>
                  {aud.realizada ? 'Realizada' : 'Pendiente'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700">Expediente</p>
                <p className="text-sm text-gray-900 mt-1">{aud.numero_expediente}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{aud.caratula}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

