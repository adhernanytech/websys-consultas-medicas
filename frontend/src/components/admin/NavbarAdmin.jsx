import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { obterUsuarioAutenticado, removerUsuarioAutenticado } from "../../data/usuarios"
import { registarAccaoAdmin, registarAccaoUtilizador } from "../../data/auditoriaAdmin"
import AppIcon from "../ui/AppIcon"

const links = [
  { to: "/admin/dashboard", texto: "Visão geral", icon: "dashboard", end: true },
  { to: "/admin/contas-medicas", texto: "Médicos e contas", icon: "stethoscope" },
  { to: "/admin/utilizadores", texto: "Pacientes", icon: "users" },
  { to: "/admin/contas-utilizadores", texto: "Contas de utilizadores", icon: "user" },
  { to: "/admin/especialidades", texto: "Especialidades", icon: "list" },
  { to: "/admin/consultas", texto: "Consultas", icon: "calendar" },
  { to: "/admin/relatorios", texto: "Relatórios", icon: "chart" },
  { to: "/admin/actividade", texto: "Registo de actividade", icon: "activity" },
  { to: "/admin/configuracoes", texto: "Configurações", icon: "settings" },
]

export default function NavbarAdmin({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const usuario = obterUsuarioAutenticado()
  const [mobileOpen, setMobileOpen] = useState(false)
  function sair() {
    if (!window.confirm("Tem a certeza de que pretende terminar a sessão?")) return
    registarAccaoUtilizador("Sessão terminada", "autenticação", "Logout do administrador")
    removerUsuarioAutenticado()
    navigate("/login", { replace: true })
  }
  const navItems = (mobile = false) => <>
    {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} onClick={() => mobile && setMobileOpen(false)} title={collapsed && !mobile ? link.texto : undefined} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-teal-700 text-white shadow-sm" : "text-slate-600 hover:bg-teal-50 hover:text-teal-900"}`}>
      <AppIcon name={link.icon} size={19} /> <span className={collapsed && !mobile ? "hidden" : "block"}>{link.texto}</span>
    </NavLink>)}
    <NavLink to="/" onClick={() => mobile && setMobileOpen(false)} title={collapsed ? "Site público" : undefined} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"><AppIcon name="clinic" size={19}/><span className={collapsed ? "hidden" : "block"}>Site público</span></NavLink>
  </>
  return <>
    <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${collapsed ? "w-[84px]" : "w-[270px]"}`}>
      <div className={`flex h-[82px] items-center border-b border-slate-100 ${collapsed ? "justify-center px-2" : "gap-3 px-5"}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-800 text-white"><AppIcon name="clinic" size={24}/></div>
        {!collapsed && <div className="min-w-0"><p className="truncate text-base font-extrabold tracking-tight text-slate-900">Wenji Maka</p><p className="text-xs font-medium text-slate-500">Centro Médico · Administração</p></div>}
      </div>
      <div className={`px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 ${collapsed ? "text-center" : "px-5"}`}>{collapsed ? "Menu" : "Gestão clínica"}</div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">{navItems()}</nav>
      <div className={`border-t border-slate-100 p-3 ${collapsed ? "items-center" : ""}`}>
        {!collapsed && <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-900">{(usuario?.nome || "A").slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{usuario?.nome || "Administrador"}</p><p className="truncate text-xs text-slate-500">Administrador principal</p></div></div>}
        <button type="button" onClick={sair} title="Terminar sessão" className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 ${collapsed ? "justify-center" : ""}`}><AppIcon name="logout"/><span className={collapsed ? "hidden" : "block"}>Terminar sessão</span></button>
        <button type="button" onClick={onToggle} className={`mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 lg:flex ${collapsed ? "justify-center" : ""}`}><AppIcon name="menu"/><span className={collapsed ? "hidden" : "block"}>Recolher menu</span></button>
      </div>
    </aside>
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-white"><AppIcon name="clinic"/></div><div><p className="font-bold text-slate-900">Wenji Maka</p><p className="text-[11px] text-slate-500">Painel administrativo</p></div></div>
      <button type="button" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><AppIcon name={mobileOpen ? "close" : "menu"} size={23}/></button>
    </header>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)}/><aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-white shadow-xl"><div className="flex h-[76px] items-center gap-3 border-b px-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white"><AppIcon name="clinic" size={22}/></div><div><p className="font-bold">Wenji Maka</p><p className="text-xs text-slate-500">Centro Médico</p></div></div><nav className="flex-1 space-y-1 overflow-y-auto p-3">{navItems(true)}</nav><button onClick={sair} className="m-3 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"><AppIcon name="logout"/>Terminar sessão</button></aside></div>}
  </>
}
