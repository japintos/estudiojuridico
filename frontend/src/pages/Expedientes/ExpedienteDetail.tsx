import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface ExpedienteDetail {
  id: number
  numero_expediente: string
  fuero: string
  estado: string
  caratula: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  abogado_nombre: string
  fecha_inicio: string
  jurisdiccion: string
  juzgado: string
  secretaria: string
  documentos: any[]
  audiencias: any[]
}

export default function ExpedienteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expediente, setExpediente] = useState<ExpedienteDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpediente()
  }, [id])

  const fetchExpediente = async () => {
    try {
      const response = await api.get(`/expedientes/${id}`)
      setExpediente(response.data)
    } catch (error) {
      toast.error('Error al cargar expediente')
    } finally {
      setLoading(false)
    }
  }

  const getFueroLabel = (fuero: string) => {
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
    return labels[fuero] || fuero
  }

  if (loading) {
    return <div className="card text-center py-12">Cargando...</div>
  }

  if (!expediente) {
    return <div className="card text-center py-12">Expediente no encontrado</div>
  }

  return (
    <div>
      <button
        onClick={() => navigate('/expedientes')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{expediente.numero_expediente}</h1>
        <p className="text-gray-600 mt-1">{expediente.caratula}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Información principal */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Fuero</dt>
                <dd className="mt-1 text-sm text-gray-900">{getFueroLabel(expediente.fuero)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Jurisdicción</dt>
                <dd className="mt-1 text-sm text-gray-900">{expediente.jurisdiccion || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Juzgado</dt>
                <dd className="mt-1 text-sm text-gray-900">{expediente.juzgado || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Secretaría</dt>
                <dd className="mt-1 text-sm text-gray-900">{expediente.secretaria || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(expediente.fecha_inicio).toLocaleDateString('es-AR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1">
                  <span className={`badge ${
                    expediente.estado === 'activo' ? 'badge-success' :
                    expediente.estado === 'finalizado' ? 'badge-info' :
                    'badge-gray'
                  }`}>
                    {expediente.estado.toUpperCase()}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Audiencias */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Audiencias</h3>
            </div>
            {expediente.audiencias.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay audiencias registradas</p>
            ) : (
              <div className="space-y-3">
                {expediente.audiencias.map((aud) => (
                  <div key={aud.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{aud.tipo}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(aud.fecha_hora).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <span className={`badge ${aud.realizada ? 'badge-success' : 'badge-warning'}`}>
                        {aud.realizada ? 'Realizada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
            </div>
            {expediente.documentos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay documentos adjuntos</p>
            ) : (
              <div className="space-y-3">
                {expediente.documentos.map((doc) => (
                  <a
                    key={doc.id}
                    href={`/api/documentos/${doc.id}/download`}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="w-5 h-5 text-primary-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.nombre_original}</p>
                      <p className="text-sm text-gray-600">
                        {doc.tipo} • {doc.tamaño_mb} MB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="card">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
            </div>
            <div>
              <p className="font-medium text-gray-900">{expediente.cliente_nombre}</p>
              {expediente.cliente_email && (
                <p className="text-sm text-gray-600 mt-1">{expediente.cliente_email}</p>
              )}
              {expediente.cliente_telefono && (
                <p className="text-sm text-gray-600">{expediente.cliente_telefono}</p>
              )}
            </div>
          </div>

          {/* Abogado */}
          <div className="card">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Abogado Responsable</h3>
            </div>
            <p className="font-medium text-gray-900">{expediente.abogado_nombre}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

