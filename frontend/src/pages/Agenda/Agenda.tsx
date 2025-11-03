import { useEffect, useState } from 'react'
import { Calendar, Plus, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface AgendaEvent {
  id: number
  titulo: string
  descripcion: string
  tipo: string
  fecha_hora: string
  urgente: boolean
  completada: boolean
  expediente_id: number
  numero_expediente?: string
}

export default function Agenda() {
  const [eventos, setEventos] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgenda()
  }, [])

  const fetchAgenda = async () => {
    try {
      const response = await api.get('/agenda', { params: { completada: false } })
      setEventos(response.data)
    } catch (error) {
      toast.error('Error al cargar agenda')
    } finally {
      setLoading(false)
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      reunion: 'Reunión',
      llamada: 'Llamada',
      revision: 'Revisión',
      audiencia: 'Audiencia',
      vencimiento: 'Vencimiento',
      otro: 'Otro'
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
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gestión de tareas y recordatorios</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Evento
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">Cargando...</div>
      ) : eventos.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay eventos en la agenda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className={`card ${evento.urgente ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    evento.urgente ? 'bg-red-100' : 'bg-primary-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${evento.urgente ? 'text-red-600' : 'text-primary-600'}`} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{evento.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">{evento.descripcion}</p>
                    </div>
                    {evento.urgente && (
                      <span className="badge badge-danger">Urgente</span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        <strong>Tipo:</strong> {getTipoLabel(evento.tipo)}
                      </span>
                      {evento.numero_expediente && (
                        <span className="text-sm text-gray-700">
                          <strong>Expediente:</strong> {evento.numero_expediente}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(evento.fecha_hora)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

