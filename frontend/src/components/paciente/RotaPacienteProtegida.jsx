import { Navigate, Outlet, useLocation } from "react-router-dom"
import { obterUsuarioAutenticado } from "../../data/usuarios"

export default function RotaPacienteProtegida() {
  const location = useLocation()
  const usuario = obterUsuarioAutenticado()
  const tipo = String(usuario?.tipo || usuario?.role || "").toLowerCase()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (usuario.ativo === false) {
    return <Navigate to="/login" replace state={{ from: location, motivo: "conta-inactiva" }} />
  }
  if (tipo !== "paciente") {
    if (tipo === "admin" || tipo === "administrador") return <Navigate to="/admin/dashboard" replace />
    if (tipo === "medico" || tipo === "médico") return <Navigate to="/medico/dashboard" replace />
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
