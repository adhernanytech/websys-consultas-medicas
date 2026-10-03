import { Navigate, Outlet, useLocation } from "react-router-dom"

import {
  obterUsuarioAutenticado
} from "../data/usuarios"

function RotaProtegida() {

  const location = useLocation()

  const usuario = obterUsuarioAutenticado()

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location
        }}
      />
    )
  }

  return <Outlet />
}

export default RotaProtegida