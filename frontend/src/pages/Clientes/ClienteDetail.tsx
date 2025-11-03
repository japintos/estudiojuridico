import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface ClienteDetail {
  id: number
  nombre_completo: string
  razon_social: string
  documento_numero: string
  documento_tipo: string
  email: string
  telefono: string
  celular: string
  domicilio: string
  tipo: string
  expedientes: any[]
}

export default function ClienteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<ClienteDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCliente()
  }, [id])

  const fetchCliente = async () => {
    try {
      const response = await api.get(`/clientes/${id}`)
      setCliente(response.data)
    } catch (error) {
      toast.error('Error al cargar cliente')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card text-center py-12">Cargando...</div>
  if (!cliente) return <div className="card text-center py-12">Cliente no encontrado</div>

  return (
    <div>
      <button onClick={() => navigate('/clientes')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {cliente.tipo === 'persona_fisica' ? cliente.nombre_completo : cliente.razon_social}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div><dt className="text-sm font-medium text-gray-500">Tipo</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {cliente.tipo === 'persona_fisica' ? 'Persona Física' : 'Persona Jurídica'}
                </dd>
              </div>
              <div><dt className="text-sm font-medium text-gray-500">Documento</dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.documento_tipo}: {cliente.documento_numero}</dd>
              </div>
              {cliente.email && <div><dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.email}</dd>
              </div>}
              {cliente.telefono && <div><dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.telefono}</dd>
              </div>}
              {cliente.domicilio && <div><dt className="text-sm font-medium text-gray-500">Domicilio</dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.domicilio}</dd>
              </div>}
            </dl>
          </div>

          <div className="card mt-6">
            <div className="flex items-center mb-4">
              <Briefcase className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Expedientes</h3>
            </div>
            {cliente.expedientes.length === 0 ? (
              <p className="text-gray-500">No tiene expedientes</p>
            ) : (
              <div className="space-y-3">
                {cliente.expedientes.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{exp.numero_expediente}</p>
                    <p className="text-sm text-gray-600 mt-1">{exp.caratula}</p>
                    <span className={`badge ${
                      exp.estado === 'activo' ? 'badge-success' :
                      exp.estado === 'finalizado' ? 'badge-info' : 'badge-gray'
                    } mt-2`}>
                      {exp.estado.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

