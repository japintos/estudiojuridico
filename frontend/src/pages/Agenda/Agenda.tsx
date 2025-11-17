import { useEffect, useState } from 'react'
import { Calendar, Plus, X, ChevronLeft, ChevronRight, Clock, AlertCircle, Briefcase, Users, Phone, FileText } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'

interface AgendaEvent {
  id: number
  titulo: string
  descripcion?: string
  tipo: string
  fecha_hora: string
  fecha_vencimiento?: string
  urgente: boolean
  completada: boolean
  expediente_id?: number
  numero_expediente?: string
  caratula?: string
}

interface Audiencia {
  id: number
  tipo: string
  fecha_hora: string
  numero_expediente: string
  caratula: string
  sala?: string
  juez?: string
  realizada: boolean
}

type EventoCombinado = (AgendaEvent & { tipo_evento: 'agenda' }) | (Audiencia & { tipo_evento: 'audiencia' })

// Feriados de Argentina (2024-2025 - algunos ejemplos, puedes expandir)
const feriados: string[] = [
  '2024-01-01', // Año Nuevo
  '2024-02-12', // Carnaval
  '2024-02-13', // Carnaval
  '2024-03-24', // Día de la Memoria
  '2024-03-29', // Viernes Santo
  '2024-04-02', // Día del Veterano
  '2024-05-01', // Día del Trabajador
  '2024-05-25', // Día de la Revolución
  '2024-06-17', // Paso a la Inmortalidad
  '2024-06-20', // Día de la Bandera
  '2024-07-09', // Día de la Independencia
  '2024-08-17', // Paso a la Inmortalidad
  '2024-10-12', // Día del Respeto
  '2024-11-20', // Día de la Soberanía
  '2024-12-08', // Inmaculada Concepción
  '2024-12-25', // Navidad
  '2025-01-01', // Año Nuevo
  '2025-02-03', // Carnaval
  '2025-02-04', // Carnaval
  '2025-03-24', // Día de la Memoria
  '2025-04-18', // Viernes Santo
  '2025-04-02', // Día del Veterano
  '2025-05-01', // Día del Trabajador
  '2025-05-25', // Día de la Revolución
  '2025-06-16', // Paso a la Inmortalidad
  '2025-06-20', // Día de la Bandera
  '2025-07-09', // Día de la Independencia
  '2025-08-17', // Paso a la Inmortalidad
  '2025-10-12', // Día del Respeto
  '2025-11-20', // Día de la Soberanía
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad
]

export default function Agenda() {
  const [eventosAgenda, setEventosAgenda] = useState<AgendaEvent[]>([])
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showVencimientoModal, setShowVencimientoModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month')
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'reunion',
    fecha_hora: '',
    fecha_vencimiento: '',
    expediente_id: '',
    urgente: false,
    usuario_id: user?.id || ''
  })

  const [vencimientoData, setVencimientoData] = useState({
    expediente_id: '',
    tipo_vencimiento: '',
    fuero: '',
    fecha_vencimiento: '',
    descripcion: '',
    plazo_dias: '',
    recordatorio_dias: '3',
    urgente: false,
    observaciones: ''
  })

  // Tipos de vencimientos por fuero
  const tiposVencimientos: Record<string, string[]> = {
    laboral: [
      'Contestación de demanda',
      'Ofrecimiento de prueba',
      'Alegatos',
      'Recurso de apelación',
      'Recurso de queja',
      'Reconvención',
      'Prueba documental',
      'Prueba testimonial',
      'Medidas cautelares',
      'Otro'
    ],
    civil: [
      'Contestación de demanda',
      'Reconvención',
      'Ofrecimiento de prueba',
      'Prueba documental',
      'Prueba testimonial',
      'Prueba pericial',
      'Alegatos',
      'Vista de causa',
      'Recurso de apelación',
      'Recurso de casación',
      'Medidas cautelares',
      'Otro'
    ],
    comercial: [
      'Contestación de demanda',
      'Reconvención',
      'Ofrecimiento de prueba',
      'Alegatos',
      'Recurso de apelación',
      'Medidas cautelares',
      'Embargo preventivo',
      'Medidas de no innovar',
      'Otro'
    ],
    penal: [
      'Presentación de defensa',
      'Recurso de apelación',
      'Recurso de casación',
      'Recurso de queja',
      'Recurso de revisión',
      'Prueba documental',
      'Prueba testimonial',
      'Prueba pericial',
      'Medidas cautelares',
      'Otro'
    ],
    administrativo: [
      'Presentación de escrito',
      'Recurso de reconsideración',
      'Recurso jerárquico',
      'Recurso contencioso administrativo',
      'Prueba documental',
      'Alegatos',
      'Medidas cautelares',
      'Otro'
    ],
    familia: [
      'Contestación de demanda',
      'Ofrecimiento de prueba',
      'Prueba documental',
      'Prueba testimonial',
      'Prueba pericial',
      'Alegatos',
      'Audiencia',
      'Medidas cautelares',
      'Otro'
    ],
    contencioso: [
      'Contestación de demanda',
      'Ofrecimiento de prueba',
      'Alegatos',
      'Recurso de apelación',
      'Medidas cautelares',
      'Otro'
    ],
    otros: [
      'Contestación de demanda',
      'Ofrecimiento de prueba',
      'Alegatos',
      'Recurso',
      'Medidas cautelares',
      'Otro'
    ]
  }

  useEffect(() => {
    fetchData()
    fetchExpedientes()
  }, [currentMonth])

  const fetchData = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const [agendaRes, audienciasRes] = await Promise.all([
        api.get('/agenda', {
          params: {
            fecha_desde: startDate.toISOString().split('T')[0],
            fecha_hasta: endDate.toISOString().split('T')[0]
          }
        }),
        api.get('/audiencias', {
          params: {
            realizada: false
          }
        })
      ])
      
      setEventosAgenda(agendaRes.data)
      setAudiencias(audienciasRes.data)
    } catch (error) {
      toast.error('Error al cargar datos')
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

  const getDefaultDateTime = (): string => {
    const fecha = new Date(selectedDate)
    fecha.setHours(9, 0, 0, 0)
    return fecha.toISOString().slice(0, 16)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo || !formData.fecha_hora) {
      toast.error('Título y fecha son requeridos')
      return
    }

    try {
      const usuarioId: number | undefined = formData.usuario_id && formData.usuario_id !== ''
        ? parseInt(String(formData.usuario_id)) 
        : (user?.id || undefined)
      
      await api.post('/agenda', {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        fecha_hora: formData.fecha_hora,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        expediente_id: formData.expediente_id ? parseInt(formData.expediente_id) : null,
        urgente: formData.urgente,
        usuario_id: usuarioId
      })
      
      toast.success('Evento creado exitosamente')
      setShowModal(false)
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'reunion',
        fecha_hora: '',
        fecha_vencimiento: '',
        expediente_id: '',
        urgente: false,
        usuario_id: user?.id || ''
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear evento')
    }
  }

  const handleVencimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vencimientoData.expediente_id || !vencimientoData.tipo_vencimiento || !vencimientoData.fecha_vencimiento) {
      toast.error('Expediente, tipo de vencimiento y fecha son requeridos')
      return
    }

    try {
      // Crear evento de vencimiento en la agenda
      const titulo = `Vencimiento: ${vencimientoData.tipo_vencimiento}`
      const descripcion = `Vencimiento judicial - ${vencimientoData.descripcion || vencimientoData.tipo_vencimiento}${vencimientoData.observaciones ? `\n\nObservaciones: ${vencimientoData.observaciones}` : ''}`
      
      await api.post('/agenda', {
        titulo,
        descripcion,
        tipo: 'vencimiento',
        fecha_hora: vencimientoData.fecha_vencimiento + 'T23:59:59', // Fin del día
        fecha_vencimiento: vencimientoData.fecha_vencimiento,
        expediente_id: parseInt(vencimientoData.expediente_id),
        urgente: vencimientoData.urgente,
        usuario_id: user?.id || undefined
      })

      // Si hay recordatorio, crear evento de recordatorio
      if (vencimientoData.recordatorio_dias && parseInt(vencimientoData.recordatorio_dias) > 0) {
        const fechaRecord = new Date(vencimientoData.fecha_vencimiento)
        fechaRecord.setDate(fechaRecord.getDate() - parseInt(vencimientoData.recordatorio_dias))
        
        await api.post('/agenda', {
          titulo: `Recordatorio: ${vencimientoData.tipo_vencimiento}`,
          descripcion: `Recordatorio: ${titulo} vence el ${new Date(vencimientoData.fecha_vencimiento).toLocaleDateString('es-AR')}`,
          tipo: 'vencimiento',
          fecha_hora: fechaRecord.toISOString().slice(0, 16),
          fecha_vencimiento: vencimientoData.fecha_vencimiento,
          expediente_id: parseInt(vencimientoData.expediente_id),
          urgente: true,
          usuario_id: user?.id || undefined
        })
      }
      
      toast.success('Vencimiento creado exitosamente')
      setShowVencimientoModal(false)
      setVencimientoData({
        expediente_id: '',
        tipo_vencimiento: '',
        fuero: '',
        fecha_vencimiento: '',
        descripcion: '',
        plazo_dias: '',
        recordatorio_dias: '3',
        urgente: false,
        observaciones: ''
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear vencimiento')
    }
  }

  const calcularFechaVencimiento = (dias: string) => {
    if (!dias || !vencimientoData.expediente_id) return
    
    const expediente = expedientes.find(exp => exp.id === parseInt(vencimientoData.expediente_id))
    if (!expediente) return

    // Fecha base: fecha de inicio del expediente o hoy
    const fechaBase = expediente.fecha_inicio ? new Date(expediente.fecha_inicio) : new Date()
    const fechaVenc = new Date(fechaBase)
    fechaVenc.setDate(fechaVenc.getDate() + parseInt(dias))
    
    // Ajustar si cae en fin de semana o feriado
    while (fechaVenc.getDay() === 0 || fechaVenc.getDay() === 6 || isFeriado(fechaVenc)) {
      fechaVenc.setDate(fechaVenc.getDate() + 1)
    }
    
    setVencimientoData({
      ...vencimientoData,
      fecha_vencimiento: fechaVenc.toISOString().split('T')[0]
    })
  }

  const isFeriado = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    return feriados.includes(dateStr)
  }

  const isDomingo = (date: Date): boolean => {
    return date.getDay() === 0
  }

  const getEventsForDate = (date: Date): EventoCombinado[] => {
    const dateStr = date.toISOString().split('T')[0]
    const eventos: EventoCombinado[] = []

    // Eventos de agenda
    eventosAgenda.forEach(evento => {
      const eventoDate = new Date(evento.fecha_hora).toISOString().split('T')[0]
      if (eventoDate === dateStr && !evento.completada) {
        eventos.push({ ...evento, tipo_evento: 'agenda' })
      }
    })

    // Audiencias
    audiencias.forEach(audiencia => {
      const audienciaDate = new Date(audiencia.fecha_hora).toISOString().split('T')[0]
      if (audienciaDate === dateStr && !audiencia.realizada) {
        eventos.push({ ...audiencia, tipo_evento: 'audiencia' })
      }
    })

    // Ordenar por hora
    return eventos.sort((a, b) => {
      const horaA = new Date(a.fecha_hora).getTime()
      const horaB = new Date(b.fecha_hora).getTime()
      return horaA - horaB
    })
  }

  const getEventsForSelectedDay = (): EventoCombinado[] => {
    return getEventsForDate(selectedDate)
  }

  const getTipoIcon = (tipo: string, tipoEvento: 'agenda' | 'audiencia') => {
    if (tipoEvento === 'audiencia') {
      return <Briefcase className="w-4 h-4" />
    }
    
    const icons: Record<string, JSX.Element> = {
      reunion: <Users className="w-4 h-4" />,
      llamada: <Phone className="w-4 h-4" />,
      revision: <FileText className="w-4 h-4" />,
      audiencia: <Briefcase className="w-4 h-4" />,
      vencimiento: <AlertCircle className="w-4 h-4" />,
      otro: <Calendar className="w-4 h-4" />
    }
    return icons[tipo] || <Calendar className="w-4 h-4" />
  }

  const getTipoLabel = (tipo: string, tipoEvento: 'agenda' | 'audiencia') => {
    if (tipoEvento === 'audiencia') {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }

    // Completar hasta 42 días (6 semanas)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }

    return (
      <div className="card">
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
          {days.map(({ date, isCurrentMonth }, index) => {
            const eventosDia = getEventsForDate(date)
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const isToday = date.toDateString() === new Date().toDateString()
            const isFeriadoDia = isFeriado(date)
            const isDomingoDia = isDomingo(date)

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDate(date)
                  setViewMode('day')
                }}
                className={`
                  min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
                  ${isSelected ? 'ring-2 ring-primary-500' : ''}
                  ${isToday ? 'bg-primary-50' : ''}
                  ${isFeriadoDia || isDomingoDia ? 'bg-red-50 border-red-200' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary-700' : ''}`}>
                    {date.getDate()}
                  </span>
                  {isFeriadoDia && (
                    <span className="text-xs text-red-600 font-semibold">F</span>
                  )}
                  {isDomingoDia && !isFeriadoDia && (
                    <span className="text-xs text-red-500">D</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {eventosDia.slice(0, 3).map((evento, idx) => {
                    const isVencimiento = evento.tipo_evento === 'agenda' && (evento as AgendaEvent).tipo === 'vencimiento'
                    return (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          evento.tipo_evento === 'audiencia'
                            ? 'bg-blue-100 text-blue-800'
                            : isVencimiento
                            ? 'bg-orange-100 text-orange-800 font-semibold'
                            : (evento as AgendaEvent).urgente
                            ? 'bg-red-100 text-red-800'
                            : 'bg-primary-100 text-primary-800'
                        }`}
                        title={evento.tipo_evento === 'audiencia' ? `Audiencia: ${(evento as Audiencia).tipo}` : (evento as AgendaEvent).titulo}
                      >
                        {isVencimiento ? '⚠️ ' : ''}{formatTime(evento.fecha_hora)}
                      </div>
                    )
                  })}
                  {eventosDia.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{eventosDia.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const eventos = getEventsForSelectedDay()

    return (
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formatDate(selectedDate)}</h2>
              {isFeriado(selectedDate) && (
                <span className="inline-block mt-2 badge badge-danger">Feriado</span>
              )}
              {isDomingo(selectedDate) && !isFeriado(selectedDate) && (
                <span className="inline-block mt-2 badge badge-warning">Domingo</span>
              )}
            </div>
            <button
              onClick={() => setViewMode('month')}
              className="btn-secondary"
            >
              Ver Calendario
            </button>
          </div>

          {eventos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No hay eventos programados para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    evento.tipo_evento === 'audiencia'
                      ? 'bg-blue-50 border-blue-500'
                      : (evento as AgendaEvent).tipo === 'vencimiento'
                      ? 'bg-orange-50 border-orange-500'
                      : (evento as AgendaEvent).urgente
                      ? 'bg-red-50 border-red-500'
                      : 'bg-white border-primary-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 p-2 rounded-lg ${
                        evento.tipo_evento === 'audiencia'
                          ? 'bg-blue-100'
                          : (evento as AgendaEvent).tipo === 'vencimiento'
                          ? 'bg-orange-100'
                          : (evento as AgendaEvent).urgente
                          ? 'bg-red-100'
                          : 'bg-primary-100'
                      }`}>
                        {getTipoIcon(
                          evento.tipo_evento === 'audiencia' ? (evento as Audiencia).tipo : (evento as AgendaEvent).tipo,
                          evento.tipo_evento
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatTime(evento.fecha_hora)}
                          </span>
                          <span className={`badge ${
                            evento.tipo_evento === 'audiencia'
                              ? 'badge-info'
                              : (evento as AgendaEvent).tipo === 'vencimiento'
                              ? 'badge-warning'
                              : (evento as AgendaEvent).urgente
                              ? 'badge-danger'
                              : 'badge-gray'
                          }`}>
                            {getTipoLabel(
                              evento.tipo_evento === 'audiencia' ? (evento as Audiencia).tipo : (evento as AgendaEvent).tipo,
                              evento.tipo_evento
                            )}
                          </span>
                          {evento.tipo_evento === 'audiencia' && (
                            <span className="badge badge-info">Audiencia</span>
                          )}
                          {(evento as AgendaEvent).tipo === 'vencimiento' && (
                            <span className="badge badge-warning">⚠️ Vencimiento</span>
                          )}
                        </div>
                        <h3 className={`font-semibold mb-1 ${
                          (evento as AgendaEvent).tipo === 'vencimiento' 
                            ? 'text-orange-700' 
                            : 'text-gray-900'
                        }`}>
                          {evento.tipo_evento === 'audiencia'
                            ? `Audiencia: ${getTipoLabel((evento as Audiencia).tipo, 'audiencia')}`
                            : (evento as AgendaEvent).titulo}
                        </h3>
                        {evento.tipo_evento === 'audiencia' ? (
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Expediente:</strong> {(evento as Audiencia).numero_expediente}</p>
                            <p className="line-clamp-1">{(evento as Audiencia).caratula}</p>
                            {(evento as Audiencia).sala && (
                              <p><strong>Sala:</strong> {(evento as Audiencia).sala}</p>
                            )}
                            {(evento as Audiencia).juez && (
                              <p><strong>Juez:</strong> {(evento as Audiencia).juez}</p>
                            )}
                          </div>
                        ) : (
                          <>
                            {(evento as AgendaEvent).descripcion && (
                              <p className={`text-sm mb-2 ${
                                (evento as AgendaEvent).tipo === 'vencimiento'
                                  ? 'text-orange-700 font-medium'
                                  : 'text-gray-600'
                              }`}>
                                {(evento as AgendaEvent).descripcion}
                              </p>
                            )}
                            {(evento as AgendaEvent).numero_expediente && (
                              <p className="text-sm text-gray-600">
                                <strong>Expediente:</strong> {(evento as AgendaEvent).numero_expediente}
                              </p>
                            )}
                            {(evento as AgendaEvent).fecha_vencimiento && (
                              <p className={`text-sm font-semibold mt-2 ${
                                (evento as AgendaEvent).tipo === 'vencimiento'
                                  ? 'text-orange-700'
                                  : 'text-gray-700'
                              }`}>
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Vence: {new Date((evento as AgendaEvent).fecha_vencimiento!).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (loading) {
    return <div className="card text-center py-12">Cargando...</div>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Calendario de actividades y audiencias</p>
        </div>
        {(user?.rol === 'abogado' || user?.rol === 'secretaria') && (
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setFormData({
                  ...formData,
                  fecha_hora: getDefaultDateTime()
                })
                setShowModal(true)
              }}
              className="btn-secondary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Evento
            </button>
            <button 
              onClick={() => {
                const fechaDefault = new Date(selectedDate)
                fechaDefault.setDate(fechaDefault.getDate() + 10) // 10 días por defecto
                setVencimientoData({
                  ...vencimientoData,
                  fecha_vencimiento: fechaDefault.toISOString().split('T')[0],
                  recordatorio_dias: '3'
                })
                setShowVencimientoModal(true)
              }}
              className="btn-primary"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              Nuevo Vencimiento
            </button>
          </div>
        )}
      </div>

      {viewMode === 'month' ? (
        <>
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => changeMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {renderCalendar()}
          <div className="mt-4 card">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-100 border border-primary-500 rounded"></div>
                <span>Evento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
                <span>Audiencia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-500 rounded"></div>
                <span>Vencimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                <span>Feriado/Domingo</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        renderDayView()
      )}

      {/* Modal Nuevo Vencimiento */}
      {showVencimientoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nuevo Vencimiento Judicial</h2>
                <p className="text-sm text-gray-500 mt-1">Registre plazos procesales críticos</p>
              </div>
              <button
                onClick={() => setShowVencimientoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVencimientoSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expediente *
                  </label>
                  <select
                    value={vencimientoData.expediente_id}
                    onChange={(e) => {
                      const exp = expedientes.find(ex => ex.id === parseInt(e.target.value))
                      setVencimientoData({
                        ...vencimientoData,
                        expediente_id: e.target.value,
                        fuero: exp?.fuero || ''
                      })
                    }}
                    required
                    className="input-field"
                  >
                    <option value="">Seleccione un expediente</option>
                    {expedientes.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.numero_expediente} - {exp.caratula.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuero *
                  </label>
                  <select
                    value={vencimientoData.fuero}
                    onChange={(e) => setVencimientoData({ ...vencimientoData, fuero: e.target.value, tipo_vencimiento: '' })}
                    required
                    className="input-field"
                  >
                    <option value="">Seleccione el fuero</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vencimiento *
                </label>
                <select
                  value={vencimientoData.tipo_vencimiento}
                  onChange={(e) => setVencimientoData({ ...vencimientoData, tipo_vencimiento: e.target.value })}
                  required
                  disabled={!vencimientoData.fuero}
                  className="input-field"
                >
                  <option value="">Seleccione el tipo de vencimiento</option>
                  {vencimientoData.fuero && tiposVencimientos[vencimientoData.fuero]?.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                {!vencimientoData.fuero && (
                  <p className="text-xs text-gray-500 mt-1">Primero seleccione el fuero</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    value={vencimientoData.fecha_vencimiento}
                    onChange={(e) => setVencimientoData({ ...vencimientoData, fecha_vencimiento: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calcular por Plazo (días)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={vencimientoData.plazo_dias}
                      onChange={(e) => setVencimientoData({ ...vencimientoData, plazo_dias: e.target.value })}
                      className="input-field flex-1"
                      placeholder="Ej: 15"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={() => calcularFechaVencimiento(vencimientoData.plazo_dias)}
                      disabled={!vencimientoData.plazo_dias || !vencimientoData.expediente_id}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Calcular
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Calcula desde la fecha de inicio del expediente
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Acto Procesal
                </label>
                <textarea
                  value={vencimientoData.descripcion}
                  onChange={(e) => setVencimientoData({ ...vencimientoData, descripcion: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Describa el acto procesal que debe cumplirse..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recordatorio (días antes)
                  </label>
                  <select
                    value={vencimientoData.recordatorio_dias}
                    onChange={(e) => setVencimientoData({ ...vencimientoData, recordatorio_dias: e.target.value })}
                    className="input-field"
                  >
                    <option value="0">Sin recordatorio</option>
                    <option value="1">1 día antes</option>
                    <option value="2">2 días antes</option>
                    <option value="3">3 días antes</option>
                    <option value="5">5 días antes</option>
                    <option value="7">7 días antes</option>
                    <option value="10">10 días antes</option>
                    <option value="15">15 días antes</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Se creará un evento de recordatorio automático
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={vencimientoData.observaciones}
                    onChange={(e) => setVencimientoData({ ...vencimientoData, observaciones: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgente_vencimiento"
                  checked={vencimientoData.urgente}
                  onChange={(e) => setVencimientoData({ ...vencimientoData, urgente: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="urgente_vencimiento" className="ml-2 text-sm font-medium text-gray-700">
                  Marcar como urgente
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Importante:</p>
                    <p>Los vencimientos judiciales son plazos críticos. El incumplimiento puede acarrear consecuencias procesales adversas como la pérdida de derechos o sanciones.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVencimientoModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Crear Vencimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nuevo Evento</h2>
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
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Ej: Reunión con cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Detalles del evento..."
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
                    required
                    className="input-field"
                  >
                    <option value="reunion">Reunión</option>
                    <option value="llamada">Llamada</option>
                    <option value="revision">Revisión</option>
                    <option value="audiencia">Audiencia</option>
                    <option value="vencimiento">Vencimiento</option>
                    <option value="otro">Otro</option>
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expediente (opcional)
                  </label>
                  <select
                    value={formData.expediente_id}
                    onChange={(e) => setFormData({ ...formData, expediente_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sin expediente</option>
                    {expedientes.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.numero_expediente} - {exp.caratula.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.rol === 'abogado' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar a Usuario
                  </label>
                  <input
                    type="number"
                    value={formData.usuario_id}
                    onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                    className="input-field"
                    placeholder="ID de usuario (opcional)"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgente"
                  checked={formData.urgente}
                  onChange={(e) => setFormData({ ...formData, urgente: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="urgente" className="ml-2 text-sm font-medium text-gray-700">
                  Marcar como urgente
                </label>
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
                  Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
