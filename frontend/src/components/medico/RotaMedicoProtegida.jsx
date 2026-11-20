
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { medicosAPI } from "../../services/api";

function RotaMedicoProtegida() {
  const location = useLocation();
  const { usuario, deveAlterarSenha } = useAuth();
  const [medicoAssociado, setMedicoAssociado] = useState(false);
  const [verificandoPerfil, setVerificandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState("");

  useEffect(() => {
    if (!usuario || usuario.tipo !== "medico" || deveAlterarSenha) return;
    let activo = true;
    medicosAPI.obterMeu()
      .then(({ data }) => {
        if (activo) setMedicoAssociado(Boolean(data.dados));
      })
      .catch((error) => {
        if (!activo) return;
        if (error.status === 404) setMedicoAssociado(false);
        else setErroPerfil(error.message || "Não foi possível verificar o perfil médico.");
      })
      .finally(() => {
        if (activo) setVerificandoPerfil(false);
      });
    return () => { activo = false; };
  }, [usuario, deveAlterarSenha]);

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (usuario.tipo !== "medico") {
    return <Navigate to="/" replace />;
  }

  if (usuario.ativo === false) {
    return <Navigate to="/login" replace />;
  }

  const estaNaPaginaAlterarSenha =
    location.pathname === "/medico/alterar-senha-inicial";

  // Impede o acesso às restantes páginas até à alteração da senha.
  if (deveAlterarSenha) {
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

  const estaNaPaginaPendente =
    location.pathname === "/medico/perfil-pendente";

  if (erroPerfil) {
    return <main className="p-8 text-center text-red-700">{erroPerfil}</main>;
  }

  if (verificandoPerfil) {
    return <main className="p-8 text-center text-gray-600">A verificar o perfil médico...</main>;
  }

  if (!medicoAssociado && !estaNaPaginaPendente) {
    return (
      <Navigate
        to="/medico/perfil-pendente"
        replace
      />
    );
  }

  if (medicoAssociado && estaNaPaginaPendente) {
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