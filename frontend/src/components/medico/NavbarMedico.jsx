import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import estiloLink from "../EstiloLink";

import {
  obterUsuarioAutenticado,
  removerUsuarioAutenticado,
} from "../../data/usuarios";

function NavbarMedico() {
  const navegar = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);
  const [medico, setMedico] = useState(null);

  useEffect(() => {
    const usuario = obterUsuarioAutenticado();

    if (!usuario || usuario.tipo !== "medico") {
      navegar("/login", { replace: true });
      return;
    }

    setMedico(usuario);
  }, [navegar]);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function terminarSessao() {
    fecharMenu();

    const confirmar = window.confirm(
      "Tem a certeza de que deseja terminar sessão?"
    );

    if (!confirmar) return;

    removerUsuarioAutenticado();

    navegar("/login", { replace: true });
  }

  if (!medico) return null;

  const inicialNome =
    medico.nome?.trim()?.charAt(0)?.toUpperCase() || "M";

  const links = [
    {
      to: "/medico/dashboard",
      texto: "Dashboard",
      end: true,
    },
    {
      to: "/medico/agenda",
      texto: "Minha agenda",
    },
    {
      to: "/medico/disponibilidades",
      texto: "Disponibilidades",
    },
  ];

  return (
    <nav className="relative z-40 bg-primaria px-4 py-4 text-white shadow-md sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/medico/dashboard"
            onClick={fecharMenu}
            className="shrink-0 text-lg font-bold tracking-tight transition hover:opacity-90 sm:text-xl"
          >
            Consultas Médicas
            <span className="ml-2 hidden text-xs font-medium text-white/75 sm:inline">
              | Área médica
            </span>
          </Link>

          {/* Navegação em ecrãs grandes */}

          <div className="hidden items-center gap-4 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={estiloLink}
              >
                {link.texto}
              </NavLink>
            ))}

            <div className="flex items-center gap-2 border-l border-white/25 pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white text-sm font-bold text-primaria">
                {inicialNome}
              </div>

              <div className="max-w-36">
                <p className="truncate text-sm font-semibold">
                  {medico.nome}
                </p>
                <p className="text-xs text-white/75">
                  Profissional de saúde
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={terminarSessao}
              className="rounded-lg border border-white/40 px-3 py-2 text-sm font-semibold transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Sair
            </button>
          </div>

          {/* Navegação móvel */}

          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white text-sm font-bold text-primaria">
              {inicialNome}
            </div>

            <button
              type="button"
              onClick={() => setMenuAberto((aberto) => !aberto)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              aria-controls="menu-medico"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            >
              {menuAberto ? "×" : "☰"}
            </button>
          </div>
        </div>

        {/* Menu móvel expandido */}

        <div
          id="menu-medico"
          className={`overflow-hidden transition-all duration-300 lg:hidden ${menuAberto
              ? "mt-4 max-h-96 border-t border-white/20 pt-4 opacity-100"
              : "max-h-0 opacity-0"
            }`}
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={fecharMenu}
                className={estiloLink}
              >
                <span className="block py-2">{link.texto}</span>
              </NavLink>
            ))}

            <div className="my-2 border-t border-white/20 pt-3">
              <p className="mb-3 text-sm text-white/85">
                Sessão de {medico.nome}
              </p>

              <button
                type="button"
                onClick={terminarSessao}
                className="py-2 text-left font-semibold text-white transition hover:text-red-100"
              >
                Terminar sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavbarMedico;
