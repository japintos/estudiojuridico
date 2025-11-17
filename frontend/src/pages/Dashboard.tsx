import { useEffect, useState } from 'react'
import api from '../services/api'
import { 
  TrendingUp, 
  Briefcase, 
  Calendar as CalendarIcon,
  FileText,
  AlertTriangle 
} from 'lucide-react'
import DashboardCard from './Dashboard/DashboardCard'

interface Stats {
  porFuero: Array<{
    fuero: string
    total: number
    activos: number
    finalizados: number
  }>
  porEstado: Array<{
    estado: string
    total: number
  }>
  proximasAudiencias: Array<{
    id: number
    fecha_hora: string
    tipo: string
    numero_expediente: string
    caratula: string
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/expedientes/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default empty stats
      setStats({
        porFuero: [],
        porEstado: [],
        proximasAudiencias: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>
  }

  const totalExpedientes = stats?.porFuero.reduce((sum, f) => sum + f.total, 0) || 0
  const totalActivos = stats?.porFuero.reduce((sum, f) => sum + f.activos, 0) || 0
  const totalFinalizados = stats?.porFuero.reduce((sum, f) => sum + f.finalizados, 0) || 0

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

  const getTipoAudienciaLabel = (tipo: string) => {
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
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del estudio</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Expedientes"
          value={totalExpedientes}
          colorClass="bg-blue-100"
          icon={<Briefcase className="w-6 h-6 text-blue-600" />}
        />
        <DashboardCard
          title="Activos"
          value={totalActivos}
          colorClass="bg-green-100"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <DashboardCard
          title="Finalizados"
          value={totalFinalizados}
          colorClass="bg-purple-100"
          icon={<FileText className="w-6 h-6 text-purple-600" />}
        />
        <DashboardCard
          title="Próximas Audiencias"
          value={stats?.proximasAudiencias.length || 0}
          colorClass="bg-orange-100"
          icon={<CalendarIcon className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Por Fuero */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expedientes por Fuero</h3>
          <div className="space-y-4">
            {stats?.porFuero.map((item) => (
              <div key={item.fuero}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getFueroLabel(item.fuero)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{item.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${totalExpedientes > 0 ? (item.total / totalExpedientes) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Activos: {item.activos}</span>
                  <span>Finalizados: {item.finalizados}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por Estado */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expedientes por Estado</h3>
          <div className="space-y-4">
            {stats?.porEstado.map((item) => (
              <div key={item.estado} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    item.estado === 'activo' ? 'bg-green-500' :
                    item.estado === 'finalizado' ? 'bg-purple-500' :
                    item.estado === 'archivado' ? 'bg-gray-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.estado}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximas Audiencias */}
      <div className="card">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Próximas Audiencias</h3>
        </div>
        {stats?.proximasAudiencias.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay audiencias próximas</p>
        ) : (
          <div className="space-y-3">
            {stats?.proximasAudiencias.map((audiencia) => (
              <div
                key={audiencia.id}
                className="flex items-start p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {getTipoAudienciaLabel(audiencia.tipo)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {audiencia.numero_expediente}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {audiencia.caratula}
                  </p>
                  <p className="text-sm font-medium text-orange-600 mt-2">
                    {formatDate(audiencia.fecha_hora)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

