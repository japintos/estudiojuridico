import { useEffect, useState } from 'react'
import { Filter, AlertCircle, Briefcase, Settings, Send } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'

interface ReporteExpedientes {
  expedientes: any[]
  estadisticas: {
    total: number
    por_fuero: Record<string, number>
    por_estado: Record<string, number>
    total_monto: number
  }
  filtros: any
}

interface ReporteVencimientos {
  vencimientos: Array<{
    id: number
    titulo: string
    descripcion?: string
    fecha_vencimiento: string
    numero_expediente?: string
    caratula?: string
    urgente: boolean
    dias_restantes: number
    estado_vencimiento: string
  }>
  estadisticas: {
    total: number
    vencidos: number
    criticos: number
    proximos: number
    normales: number
    urgentes: number
  }
  filtros: any
}

interface ReporteAudiencias {
  audiencias: any[]
  estadisticas: {
    total: number
    realizadas: number
    pendientes: number
    por_tipo: Record<string, number>
  }
  filtros: any
}

interface ReporteFiltrosState {
  fecha_desde: string
  fecha_hasta: string
  fuero: string
  estado: string
  urgente: string
  completada: string
  realizada: string
  tipo: string
}

interface ExpedienteInactivo {
  id: number
  numero_expediente: string
  caratula: string
  fuero: string
  nombre_cliente?: string
  nombre_abogado?: string
  apellido_abogado?: string
  dias_sin_movimiento: number
  ultima_actividad: string
}

interface ExpedientesInactivosInfo {
  total: number
  fecha_limite: string
  por_fuero: Record<string, number>
}

type TipoReporte = 'expedientes' | 'vencimientos' | 'audiencias' | 'general'
type TipoReporteEnvio = 'expedientes' | 'vencimientos'

export default function Reportes() {
  const createEmptyFiltros = (): ReporteFiltrosState => ({
    fecha_desde: '',
    fecha_hasta: '',
    fuero: '',
    estado: '',
    urgente: '',
    completada: '',
    realizada: '',
    tipo: ''
  })

  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('expedientes')
  const [loading, setLoading] = useState(false)
  const [reporteData, setReporteData] = useState<ReporteExpedientes | ReporteVencimientos | ReporteAudiencias | null>(null)
  const [emailDestino, setEmailDestino] = useState('')
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)
  const [tipoEnvio, setTipoEnvio] = useState<TipoReporteEnvio>('expedientes')
  const [expedientesInactivos, setExpedientesInactivos] = useState<ExpedienteInactivo[]>([])
  const [expedientesInactivosInfo, setExpedientesInactivosInfo] = useState<ExpedientesInactivosInfo>({
    total: 0,
    fecha_limite: '',
    por_fuero: {}
  })
  const [loadingInactivos, setLoadingInactivos] = useState(false)
  const [autoSchedule, setAutoSchedule] = useState({
    vencimientosHora: '08:00',
    inactivosHora: '08:30',
    inactivosDias: '1,16'
  })
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const { user } = useAuthStore()

  const [reporteFiltros, setReporteFiltros] = useState<ReporteFiltrosState>(() => createEmptyFiltros())
  const [correoFiltros, setCorreoFiltros] = useState<ReporteFiltrosState>(() => createEmptyFiltros())

  useEffect(() => {
    if (tipoReporte) {
      fetchReporte()
    }
  }, [tipoReporte, reporteFiltros])

  useEffect(() => {
    if (tipoReporte === 'expedientes') {
      fetchExpedientesInactivos()
    }
  }, [tipoReporte])

  useEffect(() => {
    fetchEmailSchedule()
  }, [])

  const buildParamsForTipo = (filtros: ReporteFiltrosState, tipo: TipoReporte | TipoReporteEnvio) => {
    const params: any = {}

    if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde
    if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta

    if (tipo === 'expedientes') {
      if (filtros.fuero) params.fuero = filtros.fuero
      if (filtros.estado) params.estado = filtros.estado
    }

    if (tipo === 'vencimientos') {
      if (filtros.urgente) params.urgente = filtros.urgente
      if (filtros.completada) params.completada = filtros.completada
    }

    if (tipo === 'audiencias') {
      if (filtros.realizada) params.realizada = filtros.realizada
      if (filtros.tipo) params.tipo = filtros.tipo
    }

    return params
  }

  const fetchReporte = async () => {
    setLoading(true)
    try {
      let response
      const params = buildParamsForTipo(reporteFiltros, tipoReporte)

      switch (tipoReporte) {
        case 'expedientes':
          response = await api.get('/reportes/expedientes', { params })
          break
        case 'vencimientos':
          response = await api.get('/reportes/vencimientos', { params })
          break
        case 'audiencias':
          response = await api.get('/reportes/audiencias', { params })
          break
        case 'general':
          response = await api.get('/reportes/general', { params })
          break
      }

      setReporteData(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpedientesInactivos = async () => {
    setLoadingInactivos(true)
    try {
      const response = await api.get('/reportes/expedientes-inactivos')
      const data = response.data
      setExpedientesInactivos(data.expedientes || [])

      const porFuero: Record<string, number> = {}
      if (data.por_fuero) {
        Object.entries(data.por_fuero).forEach(([fuero, listado]) => {
          porFuero[fuero] = Array.isArray(listado) ? listado.length : Number(listado) || 0
        })
      }

      setExpedientesInactivosInfo({
        total: data.total || 0,
        fecha_limite: data.fecha_limite || '',
        por_fuero: porFuero
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudieron cargar los expedientes inactivos')
    } finally {
      setLoadingInactivos(false)
    }
  }

  const fetchEmailSchedule = async () => {
    setLoadingSchedule(true)
    try {
      const { data } = await api.get('/config/email-schedule')
      setAutoSchedule({
        vencimientosHora: data?.vencimientos?.hora || '08:00',
        inactivosHora: data?.expedientes_inactivos?.hora || '08:30',
        inactivosDias: (data?.expedientes_inactivos?.dias || [1, 16]).join(',')
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudo cargar el horario automático')
    } finally {
      setLoadingSchedule(false)
    }
  }

  const handleGuardarHorarioAutomatico = async () => {
    if (!horaValida(autoSchedule.vencimientosHora) || !horaValida(autoSchedule.inactivosHora)) {
      toast.error('Los horarios deben tener formato HH:MM (24 hs)')
      return
    }

    const dias = autoSchedule.inactivosDias
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((d) => !Number.isNaN(d) && d >= 1 && d <= 31)

    if (dias.length === 0) {
      toast.error('Ingrese al menos un día válido (1 al 31) para expedientes sin movimiento')
      return
    }

    setSavingSchedule(true)
    try {
      const payload = {
        vencimientos: { hora: autoSchedule.vencimientosHora },
        expedientes_inactivos: { hora: autoSchedule.inactivosHora, dias }
      }

      const { data } = await api.put('/config/email-schedule', payload)

      setAutoSchedule({
        vencimientosHora: data.config.vencimientos.hora,
        inactivosHora: data.config.expedientes_inactivos.hora,
        inactivosDias: data.config.expedientes_inactivos.dias.join(',')
      })

      toast.success('Horarios automáticos actualizados')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el horario automático')
    } finally {
      setSavingSchedule(false)
    }
  }

  const handleEnviarCorreo = async () => {
    if (!emailDestino.trim()) {
      toast.error('Ingrese un email válido')
      return
    }

    setEnviandoCorreo(true)
    try {
      const filtrosEnvio = buildParamsForTipo(correoFiltros, tipoEnvio)

      await api.post('/reportes/enviar', {
        tipo: tipoEnvio,
        email: emailDestino.trim(),
        ...filtrosEnvio
      })
      toast.success('Reporte enviado por correo exitosamente')
      setEmailDestino('')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar el reporte')
    } finally {
      setEnviandoCorreo(false)
    }
  }

  const getFueroLabel = (fuero: string) => {
    const labels: Record<string, string> = {
      laboral: 'Laboral',
      civil: 'Civil',
      comercial: 'Comercial',
      penal: 'Penal',
      administrativo: 'Administrativo',
      familia: 'Familia',
      contencioso: 'Contencioso',
      otros: 'Otros'
    }
    return labels[fuero] || fuero
  }

  const getEstadoVencimientoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      vencido: 'badge-danger',
      critico: 'badge-danger',
      proximo: 'badge-warning',
      normal: 'badge-info'
    }
    return badges[estado] || 'badge-gray'
  }

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'N/A'
    const date = new Date(fecha)
    if (Number.isNaN(date.getTime())) return fecha
    return date.toLocaleDateString('es-AR')
  }

  const horaValida = (valor: string) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(valor)

  const renderReporteExpedientes = () => {
    const data = reporteData as ReporteExpedientes
    if (!data || !data.expedientes) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expedientes</p>
                <p className="text-2xl font-bold text-gray-900">{data.estadisticas.total}</p>
              </div>
              <Briefcase className="w-10 h-10 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Expedientes por Fuero</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.estadisticas.por_fuero).map(([fuero, total]) => (
              <div key={fuero} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{getFueroLabel(fuero)}</p>
                <p className="text-xl font-bold text-gray-900">{total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Listado de Expedientes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expediente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carátula</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuero</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.expedientes.slice(0, 50).map((exp: any) => (
                  <tr key={exp.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{exp.numero_expediente}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exp.caratula?.substring(0, 60)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getFueroLabel(exp.fuero)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`badge ${exp.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>
                        {exp.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exp.nombre_cliente || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Expedientes sin movimiento (+60 días)</h3>
              <p className="text-sm text-gray-600">
                Última actividad registrada antes del {formatFecha(expedientesInactivosInfo.fecha_limite)}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchExpedientesInactivos}
              className="btn-secondary self-start md:self-auto"
              disabled={loadingInactivos}
            >
              {loadingInactivos ? 'Actualizando...' : 'Actualizar listado'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-sm text-amber-700">Total detectado</p>
                <p className="text-2xl font-bold text-amber-900">{expedientesInactivosInfo.total}</p>
              </div>
            </div>
            {Object.entries(expedientesInactivosInfo.por_fuero).map(([fuero, total]) => (
              <div key={fuero} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Fuero {getFueroLabel(fuero)}</p>
                <p className="text-xl font-semibold text-gray-900">{total}</p>
              </div>
            ))}
          </div>

          {loadingInactivos ? (
            <p className="text-sm text-gray-500">Cargando expedientes inactivos...</p>
          ) : expedientesInactivos.length === 0 ? (
            <p className="text-sm text-gray-500">No se detectaron expedientes sin actividad prolongada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expediente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuero</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abogado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días sin mov.</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expedientesInactivos.slice(0, 25).map((exp) => (
                    <tr key={`${exp.id}-${exp.numero_expediente}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {exp.numero_expediente}
                        <p className="text-xs text-gray-500">{exp.caratula?.substring(0, 60)}...</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getFueroLabel(exp.fuero)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{exp.nombre_cliente || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(exp.nombre_abogado || '') + ' ' + (exp.apellido_abogado || '')}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600">{exp.dias_sin_movimiento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderReporteVencimientos = () => {
    const data = reporteData as ReporteVencimientos
    if (!data || !data.vencimientos) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{data.estadisticas.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-red-600">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">{data.estadisticas.vencidos}</p>
          </div>
          <div className="card">
            <p className="text-sm text-orange-600">Críticos (≤3 días)</p>
            <p className="text-2xl font-bold text-orange-600">{data.estadisticas.criticos}</p>
          </div>
          <div className="card">
            <p className="text-sm text-yellow-600">Próximos (≤7 días)</p>
            <p className="text-2xl font-bold text-yellow-600">{data.estadisticas.proximos}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Urgentes</p>
            <p className="text-2xl font-bold text-gray-900">{data.estadisticas.urgentes}</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Listado de Vencimientos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expediente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Vencimiento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Restantes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.vencimientos.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.titulo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.numero_expediente || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(v.fecha_vencimiento).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={v.dias_restantes < 0 ? 'text-red-600 font-bold' : v.dias_restantes <= 3 ? 'text-orange-600 font-bold' : ''}>
                        {v.dias_restantes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`badge ${getEstadoVencimientoBadge(v.estado_vencimiento)}`}>
                        {v.estado_vencimiento}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderReporteAudiencias = () => {
    const data = reporteData as ReporteAudiencias
    if (!data || !data.audiencias) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{data.estadisticas.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-green-600">Realizadas</p>
            <p className="text-2xl font-bold text-green-600">{data.estadisticas.realizadas}</p>
          </div>
          <div className="card">
            <p className="text-sm text-yellow-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{data.estadisticas.pendientes}</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Listado de Audiencias</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expediente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.audiencias.map((aud: any) => (
                  <tr key={aud.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(aud.fecha_hora).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{aud.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{aud.numero_expediente || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`badge ${aud.realizada ? 'badge-success' : 'badge-warning'}`}>
                        {aud.realizada ? 'Realizada' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderContenido = () => {
    if (loading) {
      return <div className="card text-center py-12">Cargando reporte...</div>
    }

    if (!reporteData) {
      return <div className="card text-center py-12 text-gray-500">Seleccione un tipo de reporte y filtros</div>
    }

    switch (tipoReporte) {
      case 'expedientes':
        return renderReporteExpedientes()
      case 'vencimientos':
        return renderReporteVencimientos()
      case 'audiencias':
        return renderReporteAudiencias()
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-1">
          Consulta de métricas y gestión integral de los envíos de reportes por correo
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as TipoReporte)}
              className="input-field"
            >
              <option value="expedientes">Expedientes</option>
              <option value="vencimientos">Vencimientos</option>
              <option value="audiencias">Audiencias</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
            <input
              type="date"
              value={reporteFiltros.fecha_desde}
              onChange={(e) => setReporteFiltros({ ...reporteFiltros, fecha_desde: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
            <input
              type="date"
              value={reporteFiltros.fecha_hasta}
              onChange={(e) => setReporteFiltros({ ...reporteFiltros, fecha_hasta: e.target.value })}
              className="input-field"
            />
          </div>
          {tipoReporte === 'expedientes' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuero</label>
                <select
                  value={reporteFiltros.fuero}
                  onChange={(e) => setReporteFiltros({ ...reporteFiltros, fuero: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todos</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={reporteFiltros.estado}
                  onChange={(e) => setReporteFiltros({ ...reporteFiltros, estado: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="archivado">Archivado</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </>
          )}
          {tipoReporte === 'vencimientos' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgente</label>
                <select
                  value={reporteFiltros.urgente}
                  onChange={(e) => setReporteFiltros({ ...reporteFiltros, urgente: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </>
          )}
          {tipoReporte === 'audiencias' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Realizada</label>
                <select
                  value={reporteFiltros.realizada}
                  onChange={(e) => setReporteFiltros({ ...reporteFiltros, realizada: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todas</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de audiencia</label>
                <input
                  type="text"
                  value={reporteFiltros.tipo}
                  onChange={(e) => setReporteFiltros({ ...reporteFiltros, tipo: e.target.value })}
                  className="input-field"
                  placeholder="Ej: conciliación"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido del reporte */}
      {renderContenido()}

      {/* Gestión de envíos por correo */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-gray-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de reportes por correo</h2>
            <p className="text-sm text-gray-600">
              Administra todos los envíos de reportes en PDF desde un único lugar. Esta sección es independiente de los filtros utilizados en la vista de reportes.
            </p>
          </div>
        </div>
        <div className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de reporte</label>
              <select
                value={tipoEnvio}
                onChange={(e) => {
                  const value = e.target.value as TipoReporteEnvio
                  setTipoEnvio(value)
                  setCorreoFiltros((prev) => ({
                    ...prev,
                    fuero: '',
                    estado: '',
                    urgente: '',
                    completada: ''
                  }))
                }}
                className="input-field"
              >
                <option value="expedientes">Expedientes (detalle + estadísticas)</option>
                <option value="vencimientos">Vencimientos (alertas y prioridades)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email destinatario *</label>
              <input
                type="email"
                value={emailDestino}
                onChange={(e) => setEmailDestino(e.target.value)}
                className="input-field"
                placeholder="ejemplo@cliente.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
              <input
                type="date"
                value={correoFiltros.fecha_desde}
                onChange={(e) => setCorreoFiltros({ ...correoFiltros, fecha_desde: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={correoFiltros.fecha_hasta}
                onChange={(e) => setCorreoFiltros({ ...correoFiltros, fecha_hasta: e.target.value })}
                className="input-field"
              />
            </div>
            {tipoEnvio === 'expedientes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuero</label>
                  <select
                    value={correoFiltros.fuero}
                    onChange={(e) => setCorreoFiltros({ ...correoFiltros, fuero: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={correoFiltros.estado}
                    onChange={(e) => setCorreoFiltros({ ...correoFiltros, estado: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="archivado">Archivado</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </>
            )}
            {tipoEnvio === 'vencimientos' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgente</label>
                  <select
                    value={correoFiltros.urgente}
                    onChange={(e) => setCorreoFiltros({ ...correoFiltros, urgente: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    <option value="true">Solo urgentes</option>
                    <option value="false">Excluir urgentes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completada</label>
                  <select
                    value={correoFiltros.completada}
                    onChange={(e) => setCorreoFiltros({ ...correoFiltros, completada: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todas</option>
                    <option value="false">Pendientes</option>
                    <option value="true">Completadas</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Resumen:</span> se enviará un correo con el reporte de{' '}
              <strong>{tipoEnvio}</strong> en PDF adjunto. Usuario actual: {user?.nombre} {user?.apellido || ''}.
              Los filtros aplicados en esta sección se guardan de manera independiente para tus próximos envíos.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleEnviarCorreo}
              disabled={enviandoCorreo}
              className="btn-primary flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {enviandoCorreo ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </div>

        <div className="card space-y-6 mt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Horarios de envío automático</p>
              <p className="text-sm text-gray-600">
                Define a qué hora se envían automáticamente las alertas de vencimientos y el reporte quincenal de
                expedientes sin movimiento.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchEmailSchedule}
              className="btn-secondary"
              disabled={loadingSchedule}
            >
              {loadingSchedule ? 'Actualizando...' : 'Recargar'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora diaria de vencimientos</label>
              <input
                type="time"
                value={autoSchedule.vencimientosHora}
                onChange={(e) => setAutoSchedule((prev) => ({ ...prev, vencimientosHora: e.target.value }))}
                className="input-field"
                disabled={loadingSchedule}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora reporte inactivos</label>
              <input
                type="time"
                value={autoSchedule.inactivosHora}
                onChange={(e) => setAutoSchedule((prev) => ({ ...prev, inactivosHora: e.target.value }))}
                className="input-field"
                disabled={loadingSchedule}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días del mes (1-31)</label>
              <input
                type="text"
                value={autoSchedule.inactivosDias}
                onChange={(e) => setAutoSchedule((prev) => ({ ...prev, inactivosDias: e.target.value }))}
                className="input-field"
                disabled={loadingSchedule}
                placeholder="1,16"
              />
              <p className="text-xs text-gray-500 mt-1">Separados por coma. Ej: 1,16</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGuardarHorarioAutomatico}
              disabled={savingSchedule || loadingSchedule}
              className="btn-primary"
            >
              {savingSchedule ? 'Guardando...' : 'Guardar horario automático'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

