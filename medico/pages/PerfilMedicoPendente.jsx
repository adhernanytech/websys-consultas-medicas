
import { Link, useNavigate } from "react-router-dom";

import {
  obterUsuarioAutenticado,
  removerUsuarioAutenticado,
} from "../../data/usuarios";

function PerfilMedicoPendente() {
  const usuario = obterUsuarioAutenticado();
  const navegar = useNavigate();

  function terminarSessao() {
    removerUsuarioAutenticado();
    navegar("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="max-w-xl w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold text-texto">
          Perfil médico pendente
        </h1>

        <p className="mt-4 text-texto-secundario leading-relaxed">
          Olá, {usuario?.nome || "médico"}. A tua conta foi
          criada, mas ainda não está associada a um perfil
          médico da clínica.
        </p>

        <p className="mt-3 text-texto-secundario leading-relaxed">
          Contacta a administração para que a tua conta seja
          associada ao perfil correcto. Depois da associação,
          poderás gerir as tuas disponibilidades e consultas.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="rounded-lg px-5 py-3 border border-gray-300"
          >
            Página inicial
          </Link>

          <button
            type="button"
            onClick={terminarSessao}
            className="rounded-lg px-5 py-3 bg-primaria text-white"
          >
            Terminar sessão
          </button>
        </div>
      </section>
    </main>
  );
}

export default PerfilMedicoPendente;
