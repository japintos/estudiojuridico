import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface Expediente {
  id: number
  numero_expediente: string
  fuero: string
  estado: string
  caratula: string
  cliente_nombre: string
  abogado_nombre: string
  fecha_inicio: string
}

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterFuero, setFilterFuero] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchExpedientes()
  }, [filterEstado, filterFuero])

  const fetchExpedientes = async () => {
    try {
      const params: any = {}
      if (filterEstado) params.estado = filterEstado
      if (filterFuero) params.fuero = filterFuero
      if (search) params.search = search

      const response = await api.get('/expedientes', { params })
      setExpedientes(response.data)
    } catch (error) {
      toast.error('Error al cargar expedientes')
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

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      activo: 'badge-success',
      finalizado: 'badge-info',
      archivado: 'badge-gray',
      suspendido: 'badge-warning'
    }
    return badges[estado] || 'badge-gray'
  }

  const filteredExpedientes = expedientes.filter(e =>
    e.numero_expediente.toLowerCase().includes(search.toLowerCase()) ||
    e.caratula.toLowerCase().includes(search.toLowerCase()) ||
    e.cliente_nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600 mt-1">Gestión de expedientes judiciales</p>
        </div>
        <button
          onClick={() => navigate('/expedientes/new')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Expediente
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, carátula o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input-field"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
            <option value="archivado">Archivado</option>
            <option value="suspendido">Suspendido</option>
          </select>
          <select
            value={filterFuero}
            onChange={(e) => setFilterFuero(e.target.value)}
            className="input-field"
          >
            <option value="">Todos los fueros</option>
            <option value="laboral">Laboral</option>
            <option value="civil">Civil</option>
            <option value="comercial">Comercial</option>
            <option value="penal">Penal</option>
            <option value="administrativo">Administrativo</option>
            <option value="familia">Familia</option>
            <option value="contencioso">Contencioso</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center py-12">Cargando...</div>
      ) : filteredExpedientes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No se encontraron expedientes</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carátula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpedientes.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {exp.numero_expediente}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(exp.fecha_inicio).toLocaleDateString('es-AR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {exp.caratula}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exp.cliente_nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {getFueroLabel(exp.fuero)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getEstadoBadge(exp.estado)}`}>
                        {exp.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/expedientes/${exp.id}`)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

