import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"

import estiloLink from "../EstiloLink"

import {
  obterUsuarioAutenticado,
  removerUsuarioAutenticado
} from "../../data/usuarios"


function NavbarPaciente() {

  const navegar = useNavigate()

  const [menuAberto, setMenuAberto] = useState(false)
  const [paciente, setPaciente] = useState(null)


  useEffect(() => {

    const usuario = obterUsuarioAutenticado()

    if (!usuario || usuario.tipo !== "paciente") {
      navegar("/login", { replace: true })
      return
    }

    setPaciente(usuario)

  }, [navegar])


  function fecharMenu() {
    setMenuAberto(false)
  }


  function terminarSessao() {

    fecharMenu()

    const confirmar = window.confirm(
      "Tem certeza que deseja terminar sessão?"
    )

    if (!confirmar)
      return

    removerUsuarioAutenticado()

    navegar("/login", {
      replace: true
    })
  }


  if (!paciente) {
    return null
  }


  const inicialNome =
    paciente.nome?.charAt(0)?.toUpperCase() || "P"


  return (
    <nav className="bg-primaria text-white px-4 sm:px-6 py-4 shadow-md">

      <div className="max-w-6xl mx-auto">

        {/* 
            CABEÇALHO
        */}

        <div className="flex items-center justify-between gap-4">

          {/* Logo */}

          <Link
            to="/paciente/dashboard"
            onClick={fecharMenu}
            className="
              text-lg sm:text-xl
              font-bold
              tracking-tight
              hover:opacity-90
              transition
              shrink-0
            "
          >
            Consultas Médicas
          </Link>


          {/* 
              MENU DESKTOP
          */}

          <div className="hidden lg:flex items-center gap-5">

            <NavLink
              to="/paciente/dashboard"
              end
              className={estiloLink}
            >
              Dashboard
            </NavLink>


            <NavLink
              to="/paciente/medicos"
              className={estiloLink}
            >
              Encontrar médicos
            </NavLink>


            <NavLink
              to="/paciente/marcar-consulta"
              className={estiloLink}
            >
              Marcar consulta
            </NavLink>


            <NavLink
              to="/paciente/minhas-consultas"
              className={estiloLink}
            >
              Minhas consultas
            </NavLink>


            {/* Perfil */}

            <Link
              to="/paciente/perfil"
              className="
                flex items-center gap-2
                hover:opacity-90
                transition
              "
            >

              {paciente.foto ? (

                <img
                  src={paciente.foto}
                  alt=""
                  className="
                    w-8 h-8
                    rounded-full
                    object-cover
                    border-2
                    border-white/70
                  "
                />

              ) : (

                <div
                  className="
                    w-8 h-8
                    rounded-full
                    bg-white
                    text-primaria
                    flex items-center justify-center
                    font-bold
                    text-sm
                  "
                >
                  {inicialNome}
                </div>

              )}

              <span className="text-sm ">
                {paciente.nome}
              </span>

            </Link>


            {/* Sair */}

            <button
              type="button"
              onClick={terminarSessao}
              className="
                text-white
                text-sm
                rounded-lg
                p-1
                border border-borda
                hover:text-texto-terciario
                hover:border-2
                transition
                cursor-pointer
              "
            >
              Sair
            </button>

          </div>


          {/* 
              MOBILE / TABLET
          = */}

          <div className="lg:hidden flex items-center gap-3">

            {/* Mini perfil */}

            <Link
              to="/paciente/perfil"
              onClick={fecharMenu}
              className="
                flex items-center
                hover:opacity-90
                transition
              "
              aria-label="Meu perfil"
            >

              {paciente.foto ? (

                <img
                  src={paciente.foto}
                  alt=""
                  className="
                    w-9 h-9
                    rounded-full
                    object-cover
                    border-2
                    border-white/70
                  "
                />

              ) : (

                <div
                  className="
                    w-9 h-9
                    rounded-full
                    bg-white
                    text-primaria
                    flex items-center justify-center
                    font-bold
                  "
                >
                  {inicialNome}
                </div>

              )}

            </Link>


            {/* Botão Hamburguer */}

            <button
              type="button"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label={
                menuAberto
                  ? "Fechar menu"
                  : "Abrir menu"
              }
              aria-expanded={menuAberto}
              aria-controls="menu-paciente"
              className="
                w-11 h-11
                flex items-center justify-center
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

        </div>


        {/* 
            MENU MOBILE / TABLET
        = */}

        <div
          id="menu-paciente"
          className={`
            lg:hidden
            overflow-hidden
            transition-all
            duration-300
            ease-in-out

            ${
              menuAberto
                ? "max-h-[700px] opacity-100 mt-4 pt-4 border-t border-white/20"
                : "max-h-0 opacity-0"
            }
          `}
        >

          <div className="flex flex-col gap-1">

            <NavLink
              to="/paciente/dashboard"
              end
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Dashboard
              </span>
            </NavLink>


            <NavLink
              to="/paciente/medicos"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Encontrar médicos
              </span>
            </NavLink>


            <NavLink
              to="/paciente/marcar-consulta"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Marcar consulta
              </span>
            </NavLink>


            <NavLink
              to="/paciente/minhas-consultas"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Minhas consultas
              </span>
            </NavLink>


            <NavLink
              to="/paciente/perfil"
              onClick={fecharMenu}
              className={estiloLink}
            >
              <span className="block py-2">
                Meu perfil
              </span>
            </NavLink>


            {/* Sair */}

            <button
              type="button"
              onClick={terminarSessao}
              className="
                text-left
                py-2
                text-red-100
                hover:text-white
                transition
                cursor-pointer
              "
            >
              Sair
            </button>

          </div>

        </div>

      </div>

    </nav>
  )
}

export default NavbarPaciente