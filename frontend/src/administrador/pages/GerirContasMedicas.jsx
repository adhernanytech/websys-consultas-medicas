import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listarEstadoContasMedicas, eliminarContaMedica } from "../../data/administracao"
import { actualizarEstadoUtilizador } from "../../data/gestaoAdministrativa"
import { registarAccaoAdmin } from "../../data/auditoriaAdmin"
import AppIcon from "../../components/ui/AppIcon"

export default function GerirContasMedicas() {
  const navegar = useNavigate()
  const [medicos, setMedicos] = useState(() => listarEstadoContasMedicas())
  const [pesquisa, setPesquisa] = useState("")
  const [filtro, setFiltro] = useState("todos")
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  function recarregar() { setMedicos(listarEstadoContasMedicas()) }
  const filtrados = useMemo(() => medicos.filter(m => {
    const q = pesquisa.trim().toLowerCase()
    const match = !q || [m.nome, m.contaEmail, m.especialidade, String(m.id)].some(v => String(v || "").toLowerCase().includes(q))
    const estado = filtro === "todos" || (filtro === "activos" && m.contaAtiva) || (filtro === "desactivados" && !m.contaAtiva)
    return match && estado
  }), [medicos, pesquisa, filtro])
  function alterarEstado(medico) {
    const acao = medico.contaAtiva ? "desactivar" : "activar"
    if (!window.confirm(`Confirma que pretende ${acao} a conta de ${medico.nome}?`)) return
    setMensagem(""); setErro("")
    try {
      actualizarEstadoUtilizador(medico.usuarioId, !medico.contaAtiva)
      registarAccaoAdmin(medico.contaAtiva ? "Conta médica desactivada" : "Conta médica activada", "médico", `${medico.nome} (ID ${medico.id})`)
      setMensagem(`Conta de ${medico.nome} ${medico.contaAtiva ? "desactivada" : "activada"} com sucesso.`); recarregar()
    } catch (e) { setErro(e?.message || "Não foi possível alterar o estado da conta.") }
  }
  function eliminar(medico) {
    if (!window.confirm(`ATENÇÃO: pretende eliminar definitivamente a conta e o perfil de ${medico.nome}? Esta operação não pode ser anulada. Se existirem consultas ou registos clínicos, a eliminação será bloqueada.`)) return
    setMensagem(""); setErro("")
    try { eliminarContaMedica(medico.id); setMensagem(`A conta de ${medico.nome} foi eliminada.`); recarregar() }
    catch (e) { setErro(e?.message || "Não foi possível eliminar a conta médica.") }
  }
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Wenji Maka · Administração</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Médicos e contas</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Crie perfis médicos completos, com fotografia obrigatória, e faça a gestão das respectivas contas de acesso.</p></div><button onClick={() => navegar("/admin/medicos/criar")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-900"><AppIcon name="user"/> Criar conta médica</button></header>
    {mensagem && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{mensagem}</p>}{erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
    <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Perfis médicos</p><p className="mt-2 text-3xl font-extrabold">{medicos.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Contas activas</p><p className="mt-2 text-3xl font-extrabold text-emerald-700">{medicos.filter(m => m.temConta && m.contaAtiva).length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Contas desactivadas</p><p className="mt-2 text-3xl font-extrabold text-amber-700">{medicos.filter(m => m.temConta && !m.contaAtiva).length}</p></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center"><input type="search" value={pesquisa} onChange={e => setPesquisa(e.target.value)} placeholder="Pesquisar médico, email, especialidade ou ID…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"/><select value={filtro} onChange={e => setFiltro(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm"><option value="todos">Todas as contas</option><option value="activos">Activas</option><option value="desactivados">Desactivadas</option></select><button onClick={recarregar} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50">Actualizar lista</button></div>
      {filtrados.length === 0 ? <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><AppIcon name="users" size={24}/></div><h2 className="mt-4 font-bold text-slate-900">{medicos.length ? "Nenhum resultado encontrado" : "Ainda não existem médicos registados"}</h2><p className="mt-1 text-sm text-slate-500">{medicos.length ? "Altere a pesquisa ou os filtros." : "Os perfis médicos são criados exclusivamente através do formulário administrativo."}</p>{!medicos.length && <button onClick={() => navegar("/admin/medicos/criar")} className="mt-4 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white">Registar primeiro médico</button>}</div> : <div className="divide-y divide-slate-100">{filtrados.map(m => <article key={m.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"><div className="flex min-w-0 flex-1 items-center gap-4"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">{m.foto ? <img src={m.foto} alt={`Fotografia de ${m.nome}`} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-400"><AppIcon name="user" size={26}/></div>}</div><div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{m.nome}</h2><p className="mt-0.5 text-sm text-slate-600">{m.especialidade || "Sem especialidade"} · ID {m.id}</p><p className="mt-1 truncate text-sm text-slate-500">{m.contaEmail || "Sem conta de acesso"}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${m.temConta && m.contaAtiva ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{m.temConta ? (m.contaAtiva ? "Conta activa" : "Conta desactivada") : "Sem conta associada"}</span></div></div><div className="flex flex-wrap gap-2 sm:justify-end">{m.temConta && <button onClick={() => alterarEstado(m)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${m.contaAtiva ? "border-amber-200 text-amber-800 hover:bg-amber-50" : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}>{m.contaAtiva ? "Desactivar" : "Activar"}</button>}<button onClick={() => eliminar(m)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><AppIcon name="trash" size={15}/> Eliminar</button></div></article>)}</div>}
    </section><p className="text-xs leading-5 text-slate-500">A eliminação definitiva só é permitida quando não existem consultas nem registos clínicos associados. Quando existe histórico, desactive a conta para preservar a integridade clínica.</p>
  </div>
}
