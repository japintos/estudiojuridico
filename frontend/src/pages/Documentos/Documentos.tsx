import { useEffect, useState, useRef } from 'react'
import { FileText, Upload, X, Trash2 } from 'lucide-react'
import api from '../../services/api'
import { toast } from 'react-toastify'

interface Documento {
  id: number
  nombre_original: string
  tipo: string
  tamaño_mb: number
  created_at: string
  expediente_id: number
  descripcion?: string
}

interface Expediente {
  id: number
  numero_expediente: string
  caratula: string
}

export default function Documentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    archivo: null as File | null,
    expediente_id: '',
    tipo: 'otro',
    descripcion: '',
    fecha_documento: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchDocumentos()
    fetchExpedientes()
  }, [])

  const fetchDocumentos = async () => {
    try {
      const response = await api.get('/documentos')
      setDocumentos(response.data)
    } catch (error) {
      toast.error('Error al cargar documentos')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpedientes = async () => {
    try {
      const response = await api.get('/expedientes')
      setExpedientes(response.data)
    } catch (error) {
      console.error('Error al cargar expedientes:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 10MB')
        return
      }
      setFormData({ ...formData, archivo: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.archivo) {
      toast.error('Por favor seleccione un archivo')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('archivo', formData.archivo)
      if (formData.expediente_id) {
        uploadFormData.append('expediente_id', formData.expediente_id)
      }
      uploadFormData.append('tipo', formData.tipo)
      uploadFormData.append('descripcion', formData.descripcion)
      uploadFormData.append('fecha_documento', formData.fecha_documento)

      await api.post('/documentos/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Documento subido exitosamente')
      setShowModal(false)
      setFormData({
        archivo: null,
        expediente_id: '',
        tipo: 'otro',
        descripcion: '',
        fecha_documento: new Date().toISOString().split('T')[0]
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      fetchDocumentos()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al subir documento')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este documento?')) {
      return
    }

    try {
      await api.delete(`/documentos/${id}`)
      toast.success('Documento eliminado exitosamente')
      fetchDocumentos()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar documento')
    }
  }

  const handleDownload = async (id: number, nombre: string) => {
    try {
      const response = await api.get(`/documentos/${id}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', nombre)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Error al descargar documento')
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">Gestión de documentos PDF</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Upload className="w-5 h-5 mr-2" />
          Subir Documento
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">Cargando...</div>
      ) : documentos.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay documentos</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-red-600 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{doc.nombre_original}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-info capitalize">{doc.tipo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.tamaño_mb} MB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(doc.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDownload(doc.id, doc.nombre_original)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Descargar
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de subir documento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Subir Documento</h2>
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
                  Archivo PDF *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className="input-field"
                />
                {formData.archivo && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.archivo.name} ({(formData.archivo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
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
                      {exp.numero_expediente} - {exp.caratula}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="input-field"
                >
                  <option value="demanda">Demanda</option>
                  <option value="contestacion">Contestación</option>
                  <option value="sentencia">Sentencia</option>
                  <option value="resolucion">Resolución</option>
                  <option value="notificacion">Notificación</option>
                  <option value="oficio">Oficio</option>
                  <option value="otro">Otro</option>
                </select>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Documento
                </label>
                <input
                  type="date"
                  value={formData.fecha_documento}
                  onChange={(e) => setFormData({ ...formData, fecha_documento: e.target.value })}
                  className="input-field"
                />
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
                  disabled={uploading || !formData.archivo}
                  className="btn-primary"
                >
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

