import { useState } from "react"
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import AppIcon from "../ui/AppIcon"
import { registarAccaoUtilizador } from "../../data/auditoriaAdmin"
import { obterUsuarioAutenticado, removerUsuarioAutenticado } from "../../data/usuarios"
import { obterNotificacoesPaciente } from "../../data/notificacoesPaciente"
import { useStorageSync } from "../../hooks/useStorageSync"

const links = [
  { to: "/paciente/dashboard", texto: "Visão geral", icon: "dashboard", end: true },
  { to: "/paciente/medicos", texto: "Encontrar médicos", icon: "stethoscope" },
  { to: "/paciente/marcar-consulta", texto: "Marcar consulta", icon: "calendar" },
  { to: "/paciente/minhas-consultas", texto: "Minhas consultas", icon: "clipboard" },
  { to: "/paciente/historico-clinico", texto: "Histórico clínico", icon: "file" },
  { to: "/paciente/notificacoes", texto: "Notificações", icon: "bell" },
  { to: "/paciente/perfil", texto: "Meu perfil", icon: "user" },
]

function Avatar({ paciente, pequeno = false }) {
  const tamanho = pequeno ? "h-9 w-9" : "h-11 w-11"
  if (paciente?.foto) return <img src={paciente.foto} alt={`Fotografia de ${paciente.nome}`} className={`${tamanho} shrink-0 rounded-full object-cover ring-2 ring-white/20`} />
  const iniciais = String(paciente?.nome || "Paciente").trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase()
  return <span className={`${tamanho} flex shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white ring-1 ring-white/20`}>{iniciais || "P"}</span>
}

export default function NavbarPaciente() {
  const navegar = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  useStorageSync("consultas")
  const paciente = obterUsuarioAutenticado()

  if (!paciente || (paciente.tipo !== "paciente" && paciente.role !== "paciente")) return null

  function terminarSessao() {
    setMenuAberto(false)
    if (!window.confirm("Tem a certeza de que deseja terminar a sessão?")) return
    registarAccaoUtilizador("Sessão terminada", "autenticação", "Logout do paciente")
    removerUsuarioAutenticado()
    navegar("/login", { replace: true })
  }

  function fecharMenu() { setMenuAberto(false) }
  const notificacoesPorLer = obterNotificacoesPaciente(paciente.id).filter((item) => !item.lida).length
  const navegacao = (mobile = false) => (
    <nav aria-label="Navegação do paciente" className="space-y-1">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} onClick={mobile ? fecharMenu : undefined}
          className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-white text-primaria shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
          <AppIcon name={link.icon} size={19} className="shrink-0" />
          <span className="flex-1">{link.texto}</span>
          {link.to === "/paciente/notificacoes" && notificacoesPorLer > 0 && <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${location.pathname === link.to ? "bg-primaria text-white" : "bg-white/20 text-white"}`}>{notificacoesPorLer > 99 ? "99+" : notificacoesPorLer}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return <>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primaria px-4 py-5 text-white shadow-xl lg:flex">
      <Link to="/paciente/dashboard" className="mb-8 flex items-center gap-3 rounded-xl px-2" aria-label="Wenji Maka, painel do paciente">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primaria"><AppIcon name="clinic" size={25} /></span>
        <span className="min-w-0"><strong className="block truncate text-lg leading-tight">Wenji Maka</strong><span className="mt-1 block text-xs text-white/70">Área do paciente</span></span>
      </Link>
      <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Menu principal</p>
      {navegacao()}
      <div className="mt-auto border-t border-white/15 pt-4">
        <Link to="/paciente/perfil" className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3 hover:bg-white/15">
          <Avatar paciente={paciente} />
          <span className="min-w-0"><strong className="block truncate text-sm">{paciente.nome}</strong><span className="block truncate text-xs text-white/70">Paciente</span></span>
        </Link>
        <button type="button" onClick={terminarSessao} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/80 transition hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"><AppIcon name="logout" size={19} /> Terminar sessão</button>
      </div>
    </aside>

    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link to="/paciente/dashboard" onClick={fecharMenu} className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaria text-white"><AppIcon name="clinic" size={22} /></span>
          <span className="min-w-0"><strong className="block truncate text-base text-gray-900">Wenji Maka</strong><span className="block text-xs text-gray-500">Área do paciente</span></span>
        </Link>
        <button type="button" onClick={() => setMenuAberto((aberto) => !aberto)} aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} aria-controls="menu-paciente-movel" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primaria"><AppIcon name={menuAberto ? "close" : "menu"} size={22} /></button>
      </div>
    </header>
    {menuAberto && <button type="button" aria-label="Fechar menu" onClick={fecharMenu} className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden" />}
    <aside id="menu-paciente-movel" className={`fixed inset-y-0 right-0 z-50 flex w-[min(86vw,320px)] flex-col overflow-y-auto bg-primaria px-4 py-5 text-white shadow-2xl transition-transform duration-200 lg:hidden ${menuAberto ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!menuAberto}>
      <div className="mb-7 flex items-center justify-between gap-3 border-b border-white/15 pb-5">
        <div className="flex min-w-0 items-center gap-3"><Avatar paciente={paciente} /><div className="min-w-0"><p className="truncate font-semibold">{paciente.nome}</p><p className="truncate text-xs text-white/70">Área do paciente</p></div></div>
        <button type="button" onClick={fecharMenu} aria-label="Fechar menu" className="rounded-lg p-2 hover:bg-white/10"><AppIcon name="close" size={20} /></button>
      </div>
      {navegacao(true)}
      <div className="mt-auto border-t border-white/15 pt-4"><button type="button" onClick={terminarSessao} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/85 hover:bg-red-500/20"><AppIcon name="logout" size={19} /> Terminar sessão</button></div>
    </aside>
  </>
}
