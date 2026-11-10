import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { obterConsultasDoPaciente, cancelarConsulta } from "../../data/consultas"
import { obterUsuarioAutenticado } from "../../data/usuarios"
import { registarAccaoUtilizador } from "../../data/auditoriaAdmin"
import { useStorageSync } from "../../hooks/useStorageSync"
import { exportarCSV, exportarPDF } from "../../utils/exportacaoAdmin"
import AppIcon from "../../components/ui/AppIcon"

function formatarData(data) {
  if (!data) return "Data por definir"
  const valor = new Date(`${data}T12:00:00`)
  return Number.isNaN(valor.getTime()) ? data : valor.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
}
function Estado({ estado }) {
  const classes = { Agendada: "bg-blue-50 text-blue-700", Confirmada: "bg-green-50 text-green-700", Cancelada: "bg-red-50 text-red-700", Concluída: "bg-violet-50 text-violet-700", Realizada: "bg-violet-50 text-violet-700", "Não compareceu": "bg-amber-50 text-amber-800" }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[estado] || "bg-gray-100 text-gray-700"}`}>{estado || "Sem estado"}</span>
}

export default function MinhasConsultasPaciente() {
  const navigate = useNavigate()
  useStorageSync("consultas")
  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [filtro, setFiltro] = useState("Todas")
  const [pesquisa, setPesquisa] = useState("")
  const [ordem, setOrdem] = useState("recentes")
  const paciente = obterUsuarioAutenticado()

  if (!paciente) { navigate("/login", { replace: true }); return null }
  if ((paciente.tipo || paciente.role) !== "paciente") { navigate("/", { replace: true }); return null }
  if (paciente.ativo === false) { navigate("/login", { replace: true }); return null }

  const consultas = obterConsultasDoPaciente(paciente.id)
  const termo = pesquisa.trim().toLocaleLowerCase("pt-PT")
  const consultasFiltradas = consultas.filter((consulta) => {
    const correspondeEstado = filtro === "Todas" || consulta.estado === filtro || (filtro === "Realizada" && consulta.estado === "Concluída")
    const texto = [consulta.medicoNome, consulta.especialidade, consulta.motivo, consulta.estado, consulta.data].join(" ").toLocaleLowerCase("pt-PT")
    return correspondeEstado && (!termo || texto.includes(termo))
  }).sort((a, b) => {
    const aData = `${a.data || ""} ${a.horario || ""}`
    const bData = `${b.data || ""} ${b.horario || ""}`
    return ordem === "antigas" ? aData.localeCompare(bData) : bData.localeCompare(aData)
  })

  const filtros = [
    { nome: "Todas", quantidade: consultas.length },
    { nome: "Agendada", quantidade: consultas.filter((c) => c.estado === "Agendada").length },
    { nome: "Confirmada", quantidade: consultas.filter((c) => c.estado === "Confirmada").length },
    { nome: "Realizada", quantidade: consultas.filter((c) => ["Realizada", "Concluída"].includes(c.estado)).length },
    { nome: "Cancelada", quantidade: consultas.filter((c) => c.estado === "Cancelada").length },
  ]

  function tratarCancelamento(consulta) {
    if (!window.confirm(`Tem a certeza de que pretende cancelar a consulta com ${consulta.medicoNome || "o médico"}, marcada para ${formatarData(consulta.data)} às ${consulta.horario || "hora não definida"}?`)) return
    try {
      cancelarConsulta(consulta.id, paciente.id)
      setErro("")
      setMensagem("A consulta foi cancelada com sucesso.")
    } catch (error) { setErro(error.message || "Não foi possível cancelar a consulta.") }
  }

  function linhasExportacao() {
    return consultasFiltradas.map((c) => [c.id, c.medicoNome || "Médico", c.especialidade || "", c.data || "", c.horario || "", c.estado || "", c.motivo || ""])
  }
  function exportar(tipo) {
    const cabecalhos = ["N.º", "Médico", "Especialidade", "Data", "Hora", "Estado", "Motivo"]
    try {
      if (tipo === "csv") exportarCSV("wenji-maka-minhas-consultas.csv", cabecalhos, linhasExportacao())
      else exportarPDF("As minhas consultas", `Paciente: ${paciente.nome || "Paciente"} · Centro Médico Wenji Maka`, cabecalhos, linhasExportacao(), "minhas-consultas")
      registarAccaoUtilizador(`Consultas exportadas para ${tipo.toUpperCase()}`, "exportação", `${consultasFiltradas.length} consulta(s) no relatório do paciente`)
    } catch (error) { setErro(error.message || "Não foi possível exportar o relatório.") }
  }

  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primaria">Wenji Maka · Área do paciente</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Minhas consultas</h1><p className="mt-2 text-sm text-gray-600">Consulte os estados das suas marcações, pesquise o histórico e exporte uma cópia pessoal.</p></div><Link to="/paciente/marcar-consulta" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primaria px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"><AppIcon name="calendar" size={18}/> Marcar consulta</Link></header>

    {erro && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>}
    {mensagem && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{mensagem}</div>}

    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{filtros.map((item) => <button key={item.nome} type="button" onClick={() => setFiltro(item.nome)} className={`rounded-2xl border p-4 text-left transition ${filtro === item.nome ? "border-primaria bg-blue-50 ring-1 ring-blue-100" : "border-gray-200 bg-white hover:border-gray-300"}`}><span className="block text-sm text-gray-500">{item.nome}</span><strong className="mt-1 block text-2xl text-gray-900">{item.quantidade}</strong></button>)}</section>

    <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-end"><div><label htmlFor="pesquisa-consultas-paciente" className="mb-1.5 block text-sm font-semibold text-gray-700">Pesquisar consultas</label><div className="relative"><AppIcon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input id="pesquisa-consultas-paciente" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Médico, especialidade, motivo ou data" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-primaria focus:ring-2 focus:ring-blue-100"/></div></div><div><label htmlFor="ordem-consultas-paciente" className="mb-1.5 block text-sm font-semibold text-gray-700">Ordenação</label><select id="ordem-consultas-paciente" value={ordem} onChange={(e) => setOrdem(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-primaria"><option value="recentes">Mais recentes</option><option value="antigas">Mais antigas</option></select></div><div className="flex gap-2"><button type="button" onClick={() => exportar("csv")} disabled={!consultasFiltradas.length} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"><AppIcon name="download" size={16}/> CSV</button><button type="button" onClick={() => exportar("pdf")} disabled={!consultasFiltradas.length} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"><AppIcon name="file" size={16}/> PDF</button></div></div></section>

    {consultasFiltradas.length === 0 ? <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500"><AppIcon name="calendar" size={25}/></span><h2 className="mt-4 text-lg font-semibold text-gray-900">Não foram encontradas consultas</h2><p className="mt-2 text-sm text-gray-500">Altere os filtros ou marque uma nova consulta.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => { setFiltro("Todas"); setPesquisa("") }} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Limpar filtros</button><Link to="/paciente/medicos" className="rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Encontrar médico</Link></div></section> : <section className="space-y-4">{consultasFiltradas.map((consulta) => <article key={consulta.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primaria"><AppIcon name="stethoscope" size={22}/></span><div className="min-w-0"><h2 className="text-lg font-bold text-gray-900">{consulta.medicoNome || "Médico"}</h2><p className="mt-1 text-sm text-gray-500">{consulta.especialidade || "Especialidade não indicada"}</p></div></div><Estado estado={consulta.estado}/></div><div className="mt-5 grid gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2"><p className="flex items-start gap-2 text-gray-700"><AppIcon name="calendar" size={17} className="mt-0.5 shrink-0 text-gray-400"/><span><strong>Data:</strong> {formatarData(consulta.data)}</span></p><p className="flex items-start gap-2 text-gray-700"><AppIcon name="clock" size={17} className="mt-0.5 shrink-0 text-gray-400"/><span><strong>Horário:</strong> {consulta.horario || "Não definido"}{consulta.horaFim ? ` – ${consulta.horaFim}` : ""}</span></p></div>{consulta.motivo && <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Motivo indicado</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{consulta.motivo}</p></div>}<div className="mt-5 flex flex-wrap gap-2"><Link to={`/paciente/minhas-consultas/${consulta.id}`} className="inline-flex items-center gap-2 rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Ver detalhes <AppIcon name="file" size={16}/></Link>{["Agendada", "Confirmada"].includes(consulta.estado) && <button type="button" onClick={() => tratarCancelamento(consulta)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"><AppIcon name="close" size={16}/> Cancelar consulta</button>}</div></article>)}</section>}
    <p className="mt-5 text-xs leading-5 text-gray-500">As opções de cancelamento estão sujeitas às regras e aos prazos do centro médico. Os ficheiros exportados podem conter dados pessoais; guarde-os num local seguro.</p>
  </main>
}
