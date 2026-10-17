import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

import {
  obterUsuarioAutenticado,
  removerUsuarioAutenticado,
} from "../../data/usuarios"

const links = [
  {
    to: "/admin/dashboard",
    texto: "Dashboard",
    end: true,
  },
  {
    to: "/admin/contas-medicas",
    texto: "Contas médicas",
  },
  {
    to: "/admin/utilizadores",
    texto: "Pacientes",
  },
]

function NavbarAdmin() {
  const navegar = useNavigate()
  const usuario = obterUsuarioAutenticado()

  const [menuAberto, setMenuAberto] = useState(false)

  function fecharMenu() {
    setMenuAberto(false)
  }

  function sair() {
    fecharMenu()
    removerUsuarioAutenticado()

    navegar("/login", {
      replace: true,
    })
  }

  function obterEstiloLink(isActive) {
    return `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-primaria text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Administração
            </p>

            <p className="text-lg font-bold text-gray-900">
              Sistema Médico
            </p>
          </div>

          {/* Menu desktop */}
          <nav className="hidden lg:flex items-center gap-2">

            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  obterEstiloLink(isActive)
                }
              >
                {link.texto}
              </NavLink>
            ))}

            <NavLink
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Site
            </NavLink>

            <button
              type="button"
              onClick={sair}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Sair
            </button>

          </nav>

          {/* Botão hambúrguer: mobile e tablet */}
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu-admin-mobile"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl text-gray-700 transition hover:bg-gray-100 active:bg-gray-200 lg:hidden"
          >
            {menuAberto ? "✕" : "☰"}
          </button>

        </div>

        {/* Informação do administrador */}
        {usuario && (
          <div className="mt-3 text-sm text-gray-600 lg:hidden">
            Administrador:{" "}
            <span className="font-semibold text-gray-900">
              {usuario.nome}
            </span>
          </div>
        )}

        {/* Menu mobile/tablet */}
        <div
          id="menu-admin-mobile"
          className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
            menuAberto
              ? "mt-4 max-h-[500px] border-t border-gray-100 pt-4 opacity-100"
              : "max-h-0 border-t-0 pt-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1">

            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={fecharMenu}
                className={({ isActive }) =>
                  obterEstiloLink(isActive)
                }
              >
                {link.texto}
              </NavLink>
            ))}

            <NavLink
              to="/"
              onClick={fecharMenu}
              className={({ isActive }) =>
                obterEstiloLink(isActive)
              }
            >
              Site
            </NavLink>

            <button
              type="button"
              onClick={sair}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Sair
            </button>

          </nav>
        </div>

      </div>
    </header>
  )
}

export default NavbarAdmin

