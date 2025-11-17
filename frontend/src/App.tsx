import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expedientes from './pages/Expedientes/Expedientes'
import ExpedienteDetail from './pages/Expedientes/ExpedienteDetail'
import NewExpediente from './pages/Expedientes/NewExpediente'
import Clientes from './pages/Clientes/Clientes'
import ClienteDetail from './pages/Clientes/ClienteDetail'
import NewCliente from './pages/Clientes/NewCliente'
import Audiencias from './pages/Audiencias/Audiencias'
import Documentos from './pages/Documentos/Documentos'
import Plantillas from './pages/Plantillas/Plantillas'
import Agenda from './pages/Agenda/Agenda'
import Reportes from './pages/Reportes/Reportes'
import Usuarios from './pages/Usuarios/Usuarios'
import Perfil from './pages/Perfil/Perfil'

import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="expedientes" element={<Expedientes />} />
          <Route path="expedientes/new" element={<NewExpediente />} />
          <Route path="expedientes/:id" element={<ExpedienteDetail />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/new" element={<NewCliente />} />
          <Route path="clientes/:id" element={<ClienteDetail />} />
          <Route path="audiencias" element={<Audiencias />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="plantillas" element={<Plantillas />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )
}

export default App

