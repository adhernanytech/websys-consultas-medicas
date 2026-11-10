import { useMemo, useState } from "react"
import PageHeader from "../../components/ui/PageHeader"
import StatusBadge from "../../components/ui/StatusBadge"
import { obterUsuarios } from "../../data/usuarios"
import { actualizarEstadoUtilizador } from "../../data/gestaoAdministrativa"
import { exportarCSV, exportarPDF } from "../../utils/exportacaoAdmin"

function tipoUsuario(usuario) {
  const tipo = String(usuario?.tipo || usuario?.role || "não definido").trim().toLocaleLowerCase("pt-PT")
  if (["admin", "administrador"].includes(tipo)) return "Administrador"
  if (tipo === "medico" || tipo === "médico") return "Médico"
  if (tipo === "paciente") return "Paciente"
  return tipo.charAt(0).toLocaleUpperCase("pt-PT") + tipo.slice(1)
}
function ContasUtilizadoresAdmin() {
  const [usuarios, setUsuarios] = useState(() => obterUsuarios())
  const [pesquisa, setPesquisa] = useState("")
  const [tipo, setTipo] = useState("todos")
  const [estado, setEstado] = useState("todos")
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  function recarregar() { setUsuarios(obterUsuarios()); setMensagem(""); setErro("") }
  const filtrados = useMemo(() => usuarios.filter(u => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-PT")
    const correspondeTexto = !termo || `${u.id} ${u.nome || ""} ${u.email || ""}`.toLocaleLowerCase("pt-PT").includes(termo)
    const correspondeTipo = tipo === "todos" || tipoUsuario(u).toLocaleLowerCase("pt-PT") === tipo
    const correspondeEstado = estado === "todos" || (estado === "activos" ? u.ativo !== false : u.ativo === false)
    return correspondeTexto && correspondeTipo && correspondeEstado
  }).sort((a,b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-PT")), [usuarios,pesquisa,tipo,estado])
  function mudarEstado(usuario) {
    const activar = usuario.ativo === false
    const acao = activar ? "activar" : "desactivar"
    if (!window.confirm(`Tem a certeza de que pretende ${acao} a conta de ${usuario.nome || usuario.email}?`)) return
    try {
      actualizarEstadoUtilizador(usuario.id, activar)
      setMensagem(`Conta ${activar ? "activada" : "desactivada"} com sucesso.`); setErro(""); setUsuarios(obterUsuarios())
    } catch (e) { setErro(e?.message || "Não foi possível alterar o estado da conta.") }
  }
  const cabecalhos = ["ID", "Nome", "Email", "Tipo", "Estado", "Criado em"]
  const linhas = filtrados.map(u => [u.id,u.nome || "—",u.email || "—",tipoUsuario(u),u.ativo === false ? "Desactivada" : "Activa",u.criadoEm ? new Date(u.criadoEm).toLocaleDateString("pt-PT") : "—"])
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><PageHeader eyebrow="Administração" title="Contas de utilizadores" description="Consulte as contas registadas, filtre por perfil e active ou desactive acessos respeitando as regras de segurança." actions={<><button onClick={recarregar} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold">Actualizar</button><button onClick={()=>exportarCSV("contas-utilizadores.csv",cabecalhos,linhas)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold">Exportar CSV</button><button onClick={()=>exportarPDF("Contas de utilizadores","Relatório administrativo de contas",cabecalhos,linhas,"contas-utilizadores")} className="rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white">Exportar PDF</button></>} />
    {mensagem && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{mensagem}</p>}{erro && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
    <section className="mb-5 grid gap-3 sm:grid-cols-3">{[{t:"Total de contas",v:usuarios.length},{t:"Activas",v:usuarios.filter(u=>u.ativo!==false).length},{t:"Desactivadas",v:usuarios.filter(u=>u.ativo===false).length}].map(c=><article key={c.t} className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">{c.t}</p><p className="mt-1 text-2xl font-bold text-gray-900">{c.v}</p></article>)}</section>
    <section className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3"><label className="text-sm font-medium text-gray-700">Pesquisar<input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder="Nome, email ou ID" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Perfil<select value={tipo} onChange={e=>setTipo(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="todos">Todos os perfis</option><option value="administrador">Administradores</option><option value="médico">Médicos</option><option value="paciente">Pacientes</option></select></label><label className="text-sm font-medium text-gray-700">Estado<select value={estado} onChange={e=>setEstado(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="todos">Todos</option><option value="activos">Activas</option><option value="desactivados">Desactivadas</option></select></label></section>
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-200 p-4"><h2 className="font-bold text-gray-900">Contas encontradas</h2><p className="mt-1 text-sm text-gray-500">{filtrados.length} conta(s)</p></div><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Conta","Email","Perfil","Estado","Data de criação","Acção"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtrados.map(u=><tr key={u.id}><td className="px-4 py-4"><p className="font-semibold text-gray-900">{u.nome || "Sem nome"}</p><p className="text-xs text-gray-500">ID: {u.id}</p></td><td className="px-4 py-4">{u.email || "—"}</td><td className="px-4 py-4">{tipoUsuario(u)}</td><td className="px-4 py-4"><StatusBadge estado={u.ativo===false?"Inactiva":"Activa"}/></td><td className="px-4 py-4">{u.criadoEm ? new Date(u.criadoEm).toLocaleDateString("pt-PT") : "—"}</td><td className="px-4 py-4">{u.ativo===false?<button onClick={()=>mudarEstado(u)} className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">Activar conta</button>:<button onClick={()=>mudarEstado(u)} className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100">Desactivar conta</button>}</td></tr>)}</tbody></table></div>{filtrados.length===0&&<p className="p-8 text-center text-sm text-gray-500">Nenhuma conta corresponde aos filtros.</p>}</section>
  </main>
}
export default ContasUtilizadoresAdmin
