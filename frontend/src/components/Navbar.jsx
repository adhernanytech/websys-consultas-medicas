import { useState } from "react"
import { Link, NavLink } from "react-router-dom"

import estiloLink from "./EstiloLink"

function Navbar() {

  const [menuAberto, setMenuAberto] = useState(false)

  function fecharMenu() {
    setMenuAberto(false)
  }

  return (

    <nav className="bg-primaria text-white px-4 sm:px-6 py-4 shadow-md">

      <div className="max-w-6xl mx-auto">

        {/* Cabeçalho da Navbar */}

        <div className="flex items-center justify-between">

          {/* Logo */}

          <Link
            to="/"
            onClick={fecharMenu}
            className="
              text-lg
              sm:text-xl
              font-bold
              tracking-tight
              hover:opacity-90
              transition
            "
          >
            Consultas Médicas
          </Link>


          {/* Menu Desktop */}

          <div className="hidden lg:flex items-center gap-5">

            <NavLink
              to="/"
              end
              className={estiloLink}
            >
              Início
            </NavLink>


            <NavLink
              to="/medicos"
              className={estiloLink}
            >
              Médicos
            </NavLink>


            <NavLink
              to="/especialidades"
              className={estiloLink}
            >
              Especialidades
            </NavLink>


            <NavLink
              to="/sobre"
              className={estiloLink}
            >
              Sobre
            </NavLink>


            <NavLink
              to="/login"
              className={estiloLink}
            >
              Login
            </NavLink>


            <NavLink
              to="/registro"
              className={estiloLink}
            >
              Criar conta
            </NavLink>

          </div>


          {/* Botão do menu */}

          <button
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={
              menuAberto
                ? "Fechar menu"
                : "Abrir menu"
            }
            aria-expanded={menuAberto}
            aria-controls="menu-navegacao"
            className="
              lg:hidden
              w-11
              h-11
              flex
              items-center
              justify-center
              rounded-lg
              hover:bg-white/10
              active:bg-white/20
              transition
              cursor-pointer
              text-2xl
            "
          >
            {menuAberto ? "✕" : "☰"}
          </button>

        </div>


        {/* Menu Tablet e Mobile */}

        <div
          id="menu-navegacao"
          className={`
            lg:hidden
            overflow-hidden
            transition-all
            duration-300
            ease-in-out
            ${
              menuAberto
                ? "max-h-[600px] opacity-100 mt-4 pt-4 border-t border-white/20"
                : "max-h-0 opacity-0"
            }
          `}
        >

          <div className="flex flex-col gap-1">


            <NavLink
              to="/"
              end
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Início
              </span>
            </NavLink>


            <NavLink
              to="/medicos"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Médicos
              </span>
            </NavLink>


            <NavLink
              to="/especialidades"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Especialidades
              </span>
            </NavLink>


            <NavLink
              to="/sobre"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Sobre
              </span>
            </NavLink>


            <NavLink
              to="/login"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Login
              </span>
            </NavLink>


            <NavLink
              to="/registro"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Criar conta
              </span>
            </NavLink>

          </div>

        </div>

      </div>

    </nav>
  )
}

export default Navbar