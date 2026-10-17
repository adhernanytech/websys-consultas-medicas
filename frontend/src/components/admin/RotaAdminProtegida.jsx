import { Navigate, Outlet, useLocation } from "react-router-dom"

import {
  obterUsuarioAutenticado,
  usuarioIsAdmin,
} from "../../data/usuarios"

function RotaAdminProtegida() {
  const location = useLocation()
  const usuario = obterUsuarioAutenticado()

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (!usuarioIsAdmin(usuario)) {
    return <Navigate to="/" replace />
  }

  if (usuario.ativo === false) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RotaAdminProtegida