
import { Navigate, Outlet } from "react-router-dom";

import {
  obterUsuarioAutenticado,
  usuarioIsMedico,
} from "../../data/usuarios";

import {
  obterMedicoAutenticado,
} from "../../data/medicos";

export default function RotaMedicoProtegida() {
  const usuario = obterUsuarioAutenticado();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!usuarioIsMedico(usuario)) {
    return <Navigate to="/" replace />;
  }

  if (!obterMedicoAutenticado()) {
    return <Navigate to="/medico/perfil-pendente" replace />;
  }

  return <Outlet />;
}
