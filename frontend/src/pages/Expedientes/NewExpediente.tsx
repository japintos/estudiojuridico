import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface Cliente {
  id: number
  nombre_completo: string
  razon_social: string
  tipo: string
}

interface Usuario {
  id: number
  nombre: string
  apellido: string
}

export default function NewExpediente() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [abogados, setAbogados] = useState<Usuario[]>([])

  const [formData, setFormData] = useState({
    numero_expediente: '',
    numero_carpeta_juridica: '',
    fuero: '',
    jurisdiccion: '',
    juzgado: '',
    secretaria: '',
    caratula: '',
    estado: 'activo',
    fecha_inicio: new Date().toISOString().split('T')[0],
    tipo_accion: '',
    monto_disputa: '',
    observaciones: '',
    cliente_id: '',
    abogado_responsable: ''
  })

  useEffect(() => {
    fetchClientes()
    fetchAbogados()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes', { params: { activo: true } })
      setClientes(response.data)
    } catch (error) {
      toast.error('Error al cargar clientes')
    }
  }

  const fetchAbogados = async () => {
    try {
      const response = await api.get('/usuarios')
      const abogadosFiltered = response.data.filter((u: any) => u.rol === 'abogado')
      setAbogados(abogadosFiltered)
    } catch (error) {
      toast.error('Error al cargar abogados')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/expedientes', {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        abogado_responsable: parseInt(formData.abogado_responsable),
        monto_disputa: formData.monto_disputa ? parseFloat(formData.monto_disputa) : null
      })
      
      toast.success('Expediente creado exitosamente')
      navigate('/expedientes')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear expediente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Expediente</h1>
        <p className="text-gray-600 mt-1">Crear un nuevo expediente judicial</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Expediente *
              </label>
              <input
                type="text"
                name="numero_expediente"
                value={formData.numero_expediente}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="EXP-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carpeta Jurídica
              </label>
              <input
                type="text"
                name="numero_carpeta_juridica"
                value={formData.numero_carpeta_juridica}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuero *
              </label>
              <select
                name="fuero"
                value={formData.fuero}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Seleccionar fuero</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdicción
              </label>
              <input
                type="text"
                name="jurisdiccion"
                value={formData.jurisdiccion}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: CABA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Juzgado
              </label>
              <input
                type="text"
                name="juzgado"
                value={formData.juzgado}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secretaría
              </label>
              <input
                type="text"
                name="secretaria"
                value={formData.secretaria}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="input-field"
              >
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="archivado">Archivado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Expediente</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carátula *
              </label>
              <textarea
                name="caratula"
                value={formData.caratula}
                onChange={handleChange}
                required
                rows={3}
                className="input-field"
                placeholder="Descripción del expediente..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Acción
                </label>
                <input
                  type="text"
                  name="tipo_accion"
                  value={formData.tipo_accion}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: Daños y perjuicios"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto en Disputa
                </label>
                <input
                  type="number"
                  name="monto_disputa"
                  value={formData.monto_disputa}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.tipo === 'persona_fisica' ? cliente.nombre_completo : cliente.razon_social}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abogado Responsable *
              </label>
              <select
                name="abogado_responsable"
                value={formData.abogado_responsable}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Seleccionar abogado</option>
                {abogados.map((abogado) => (
                  <option key={abogado.id} value={abogado.id}>
                    {abogado.nombre} {abogado.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/expedientes')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Guardando...' : 'Guardar Expediente'}
            <Save className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
    </div>
  )
}

