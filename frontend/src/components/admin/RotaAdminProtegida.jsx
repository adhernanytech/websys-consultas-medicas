import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function RotaAdminProtegida() {
  const location = useLocation()
  const { usuario, eAdmin } = useAuth()

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (!eAdmin) {
    return <Navigate to="/" replace />
  }

  if (usuario.ativo === false) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RotaAdminProtegida