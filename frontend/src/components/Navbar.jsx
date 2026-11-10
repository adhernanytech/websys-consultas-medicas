import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import estiloLink from "./EstiloLink"
import AppIcon from "./ui/AppIcon"

function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false)
  function fecharMenu() { setMenuAberto(false) }
  const links = [
    { to: "/", label: "Início", end: true },
    { to: "/medicos", label: "Médicos" },
    { to: "/especialidades", label: "Especialidades" },
    { to: "/sobre", label: "Sobre nós" },
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primaria text-white shadow-md shadow-slate-900/10">
      <nav aria-label="Navegação principal" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          <Link to="/" onClick={fecharMenu} className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primaria shadow-sm"><AppIcon name="clinic" size={24} /></span>
            <span><strong className="block text-lg leading-tight tracking-tight sm:text-xl">Wenji Maka</strong><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">Centro Médico</span></span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={estiloLink}>{link.label}</NavLink>)}
            <Link to="/login" className="ml-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Entrar</Link>
            <Link to="/registro" className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-primaria transition hover:bg-blue-50">Criar conta</Link>
          </div>
          <button type="button" onClick={() => setMenuAberto((aberto) => !aberto)} aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} aria-controls="menu-navegacao-publico" className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"><AppIcon name={menuAberto ? "close" : "menu"} size={24} /></button>
        </div>
        <div id="menu-navegacao-publico" className={`${menuAberto ? "block pb-4" : "hidden"} lg:hidden`}>
          <div className="flex flex-col gap-1 border-t border-white/20 pt-3">
            {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} onClick={fecharMenu} className={estiloLink}>{link.label}</NavLink>)}
            <Link to="/login" onClick={fecharMenu} className="rounded-lg px-4 py-3 font-medium text-white transition hover:bg-white/10">Entrar</Link>
            <Link to="/registro" onClick={fecharMenu} className="mt-1 rounded-lg bg-white px-4 py-3 text-center font-bold text-primaria transition hover:bg-blue-50">Criar conta</Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
export default Navbar
