
import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  obterUsuarioAutenticado,
  usuarioIsMedico,
} from "../../data/usuarios";

import { obterMedicoDaConta } from "../../data/medicos";

function RotaMedicoProtegida() {
  const location = useLocation();
  const usuario = obterUsuarioAutenticado();

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!usuarioIsMedico(usuario)) {
    return <Navigate to="/" replace />;
  }

  if (usuario.ativo === false) {
    return <Navigate to="/login" replace />;
  }

  const estaNaPaginaAlterarSenha =
    location.pathname === "/medico/alterar-senha-inicial";

  // Impede o acesso às restantes páginas até à alteração da senha.
  if (usuario.deveAlterarSenha === true) {
    if (!estaNaPaginaAlterarSenha) {
      return (
        <Navigate
          to="/medico/alterar-senha-inicial"
          replace
        />
      );
    }

    // A página de alteração deve funcionar mesmo se o perfil
    // médico ainda não estiver associado.
    return <Outlet />;
  }

  // Se a alteração já foi concluída, não permite voltar à página
  // obrigatória através do endereço directo.
  if (estaNaPaginaAlterarSenha) {
    return (
      <Navigate
        to="/medico/dashboard"
        replace
      />
    );
  }

  const medico = obterMedicoDaConta(usuario.id);
  const estaNaPaginaPendente =
    location.pathname === "/medico/perfil-pendente";

  if (!medico && !estaNaPaginaPendente) {
    return (
      <Navigate
        to="/medico/perfil-pendente"
        replace
      />
    );
  }

  if (medico && estaNaPaginaPendente) {
    return (
      <Navigate
        to="/medico/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default RotaMedicoProtegida;