import { useMemo, useState } from "react"
import PageHeader from "../../components/ui/PageHeader"
import StatusBadge from "../../components/ui/StatusBadge"
import EmptyState from "../../components/ui/EmptyState"
import { obterConsultas, guardarConsultas } from "../../data/consultas"
import { obterDisponibilidades, guardarDisponibilidades } from "../../data/disponibilidades"
import { registarAccaoAdmin } from "../../data/auditoriaAdmin"
import { exportarCSV, exportarPDF } from "../../utils/exportacaoAdmin"

const ESTADOS = ["Agendada", "Confirmada", "Realizada", "Cancelada", "Falta"]
const formatarData = (data) => {
  if (!data) return "—"
  const [a,m,d] = String(data).split("-")
  return a && m && d ? `${d}/${m}/${a}` : data
}

function GerirConsultasAdmin() {
  const [consultas, setConsultas] = useState(() => obterConsultas())
  const [pesquisa, setPesquisa] = useState("")
  const [estado, setEstado] = useState("todos")
  const [dataDe, setDataDe] = useState("")
  const [dataAte, setDataAte] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  const [seleccionada, setSeleccionada] = useState(null)

  const filtradas = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-PT")
    return consultas.filter((c) => {
      const texto = [c.id, c.pacienteNome, c.pacienteEmail, c.medicoNome, c.especialidade].join(" ").toLocaleLowerCase("pt-PT")
      return (!termo || texto.includes(termo)) && (estado === "todos" || c.estado === estado) && (!dataDe || c.data >= dataDe) && (!dataAte || c.data <= dataAte)
    }).sort((a,b) => `${b.data || ""} ${b.horario || ""}`.localeCompare(`${a.data || ""} ${a.horario || ""}`))
  }, [consultas, pesquisa, estado, dataDe, dataAte])

  function recarregar() { setConsultas(obterConsultas()); setMensagem(""); setErro("") }
  function alterarEstado(consulta, novoEstado) {
    setErro(""); setMensagem("")
    if (consulta.estado === novoEstado) return
    if (consulta.estado === "Cancelada" || consulta.estado === "Realizada" || consulta.estado === "Falta") {
      setErro("Esta consulta já está num estado final e não pode ser alterada por esta página.")
      return
    }
    const verbo = novoEstado === "Cancelada" ? "cancelar" : "confirmar"
    if (!window.confirm(`Confirma que pretende ${verbo} a consulta de ${consulta.pacienteNome || "paciente"} com ${consulta.medicoNome || "médico"}?`)) return
    try {
      const actualizadas = obterConsultas().map((c) => String(c.id) === String(consulta.id) ? { ...c, estado: novoEstado, actualizadaEm: new Date().toISOString(), actualizadoPor: "admin", ...(novoEstado === "Cancelada" ? { canceladaEm: new Date().toISOString(), canceladaPor: "admin" } : {}) } : c)
      guardarConsultas(actualizadas)
      if (novoEstado === "Cancelada" && consulta.disponibilidadeId != null) {
        const disponibilidades = obterDisponibilidades()
        const dispon = disponibilidades.find((d) => String(d.id) === String(consulta.disponibilidadeId))
        if (dispon) guardarDisponibilidades(disponibilidades.map((d) => String(d.id) === String(dispon.id) ? { ...d, estado: "Disponível" } : d))
      }
      registarAccaoAdmin(`Estado da consulta alterado para ${novoEstado}`, "consulta", `Consulta ${consulta.id}; paciente: ${consulta.pacienteNome || consulta.pacienteId}; médico: ${consulta.medicoNome || consulta.medicoId}`)
      setConsultas(obterConsultas())
      setMensagem(`Consulta ${consulta.id}: estado actualizado para «${novoEstado}».`)
    } catch (e) { setErro(e?.message || "Não foi possível actualizar a consulta.") }
  }

  const cabecalhos = ["ID", "Data", "Hora", "Paciente", "Email paciente", "Médico", "Especialidade", "Estado"]
  const linhas = filtradas.map((c) => [c.id, formatarData(c.data), c.horario || "—", c.pacienteNome || "—", c.pacienteEmail || "—", c.medicoNome || "—", c.especialidade || "—", c.estado || "—"])
  function pdf() { try { exportarPDF("Gestão de consultas", "Listagem administrativa de consultas", cabecalhos, linhas, "consultas") } catch(e) { setErro(e.message) } }

  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <PageHeader eyebrow="Administração" title="Gestão de consultas" description="Pesquisar, acompanhar e gerir os estados das marcações. As alterações são guardadas localmente nesta fase do projecto." actions={<><button onClick={recarregar} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Actualizar</button><button onClick={() => exportarCSV("consultas-administrativas.csv", cabecalhos, linhas)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Exportar CSV</button><button onClick={pdf} className="rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaria-hover">Exportar PDF</button></>} />
    {mensagem && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{mensagem}</p>}
    {erro && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
    <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[{t:"Total filtrado",v:filtradas.length},{t:"Agendadas",v:filtradas.filter(c=>c.estado==="Agendada").length},{t:"Confirmadas",v:filtradas.filter(c=>c.estado==="Confirmada").length},{t:"Canceladas",v:filtradas.filter(c=>c.estado==="Cancelada").length}].map(x=><article key={x.t} className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-500">{x.t}</p><p className="mt-1 text-2xl font-bold text-gray-900">{x.v}</p></article>)}
    </section>
    <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-gray-700">Pesquisar<input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder="Paciente, médico, email ou ID" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" /></label>
        <label className="text-sm font-medium text-gray-700">Estado<select value={estado} onChange={e=>setEstado(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal"><option value="todos">Todos os estados</option>{ESTADOS.map(e=><option key={e}>{e}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Data inicial<input type="date" value={dataDe} onChange={e=>setDataDe(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" /></label>
        <label className="text-sm font-medium text-gray-700">Data final<input type="date" min={dataDe || undefined} value={dataAte} onChange={e=>setDataAte(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" /></label>
      </div>
      <button onClick={()=>{setPesquisa("");setEstado("todos");setDataDe("");setDataAte("")}} className="mt-3 text-sm font-semibold text-primaria hover:underline">Limpar filtros</button>
    </section>
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-4"><h2 className="font-bold text-gray-900">Marcações encontradas</h2><span className="text-sm text-gray-500">{filtradas.length} registo(s)</span></div>
      {filtradas.length === 0 ? <EmptyState title="Nenhuma consulta encontrada" description="Altere os filtros ou limpe a pesquisa para ver outras marcações." /> : <div className="overflow-x-auto"><table className="min-w-[1000px] w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr>{["Consulta","Paciente","Médico","Data e hora","Estado","Acções"].map(h=><th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtradas.map(c=><tr key={c.id} className="align-top hover:bg-gray-50/70"><td className="px-4 py-4 font-semibold text-gray-800">#{c.id}<p className="mt-1 text-xs font-normal text-gray-500">{c.especialidade || "Sem especialidade"}</p></td><td className="px-4 py-4"><p className="font-medium text-gray-900">{c.pacienteNome || "Paciente"}</p><p className="text-xs text-gray-500">{c.pacienteEmail || "Email não disponível"}</p></td><td className="px-4 py-4 text-gray-700">{c.medicoNome || "Médico"}</td><td className="px-4 py-4 text-gray-700">{formatarData(c.data)}<p className="text-xs text-gray-500">{c.horario || "Hora não definida"}</p></td><td className="px-4 py-4"><StatusBadge estado={c.estado}/></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2"><button onClick={()=>setSeleccionada(c)} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-white">Detalhes</button>{c.estado === "Agendada" && <button onClick={()=>alterarEstado(c,"Confirmada")} className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">Confirmar</button>}{["Agendada","Confirmada"].includes(c.estado) && <button onClick={()=>alterarEstado(c,"Cancelada")} className="rounded-md bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100">Cancelar</button>}</div></td></tr>)}</tbody></table></div>}
    </section>
    {seleccionada && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSeleccionada(null)}}><section role="dialog" aria-modal="true" aria-labelledby="consulta-modal-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-primaria">Detalhes da marcação</p><h2 id="consulta-modal-title" className="mt-1 text-xl font-bold text-gray-900">Consulta #{seleccionada.id}</h2></div><button onClick={()=>setSeleccionada(null)} aria-label="Fechar" className="rounded-lg px-3 py-1 text-xl hover:bg-gray-100">×</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["Paciente",seleccionada.pacienteNome],["Email",seleccionada.pacienteEmail],["Médico",seleccionada.medicoNome],["Especialidade",seleccionada.especialidade],["Data",formatarData(seleccionada.data)],["Hora",seleccionada.horario],["Estado",seleccionada.estado],["Criada em",seleccionada.criadaEm ? new Date(seleccionada.criadaEm).toLocaleString("pt-PT") : "—"]].map(([label,value])=><div key={label} className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-1 break-words text-sm text-gray-900">{value || "—"}</p></div>)}</div><div className="mt-4 rounded-lg border border-gray-200 p-3"><p className="text-xs font-semibold uppercase text-gray-500">Motivo informado</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{seleccionada.motivo || "Não informado"}</p></div><div className="mt-5 flex justify-end"><button onClick={()=>setSeleccionada(null)} className="rounded-lg bg-primaria px-4 py-2 text-sm font-semibold text-white">Fechar</button></div></section></div>}
  </main>
}
export default GerirConsultasAdmin
