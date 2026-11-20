import { useEffect, useMemo, useState } from "react"
import PageHeader from "../../components/ui/PageHeader"
import { exportarCSV, exportarPDF } from "../../utils/exportacaoAdmin"
import { adminAPI, consultasAPI, especialidadesAPI } from "../../services/api"

function RelatoriosAdmin() {
  const [actualizacao, setActualizacao] = useState(0)
  const [dataDe, setDataDe] = useState("")
  const [dataAte, setDataAte] = useState("")
  const [consultas, setConsultas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [indicadores, setIndicadores] = useState({})
  const [erro, setErro] = useState("")
  useEffect(() => {
    let activo = true
    Promise.all([
      consultasAPI.listar(),
      adminAPI.listarUtilizadores(),
      adminAPI.dashboard(),
      especialidadesAPI.listar(),
    ])
      .then(([consultasResponse, usuariosResponse, dashboardResponse, especialidadesResponse]) => {
        if (!activo) return
        setConsultas(consultasResponse.data.dados || [])
        setUsuarios(usuariosResponse.data.dados || [])
        setIndicadores(dashboardResponse.data.dados || {})
        setEspecialidades(especialidadesResponse.data.dados || [])
      })
      .catch((errorApi) => {
        if (activo) setErro(errorApi.message || "Não foi possível carregar os relatórios.")
      })
    return () => { activo = false }
  }, [actualizacao])
  const filtradas = useMemo(() => consultas.filter(c => (!dataDe || c.data >= dataDe) && (!dataAte || c.data <= dataAte)), [consultas, dataDe, dataAte])
  const contagem = (estado) => filtradas.filter(c => c.estado === estado || (estado === "Realizada" && c.estado === "Concluída")).length
  const resumo = [
    ["Utilizadores registados", usuarios.length],
    ["Pacientes registados", usuarios.filter(u => u.tipo === "paciente").length],
    ["Perfis médicos", usuarios.filter(u => u.tipo === "medico").length],
    ["Especialidades", especialidades.length],
    ["Consultas no período", filtradas.length],
    ["Consultas agendadas", contagem("Agendada")],
    ["Consultas confirmadas", contagem("Confirmada")],
    ["Consultas realizadas", contagem("Realizada")],
    ["Consultas canceladas", contagem("Cancelada")],
    ["Horários registados", indicadores.totalDisponibilidades || 0],
  ]
  const linhasConsultas = filtradas.map(c => [c.id, c.data || "—", c.horario || "—", c.medicoNome || "—", c.especialidade || "—", c.estado || "—"])
  const cabecalhosConsultas = ["ID", "Data", "Hora", "Médico", "Especialidade", "Estado"]
  function exportarResumoPDF() { exportarPDF("Relatório de actividade do sistema", `Período: ${dataDe || "início"} a ${dataAte || "hoje/fim"}`, ["Indicador", "Valor"], resumo, "relatorio-actividade") }
  function exportarConsultasPDF() { exportarPDF("Relatório de consultas", `Período: ${dataDe || "início"} a ${dataAte || "hoje/fim"}`, cabecalhosConsultas, linhasConsultas, "relatorio-consultas") }
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <PageHeader eyebrow="Administração" title="Relatórios e exportações" description="Consulte indicadores actualizados da API e exporte resumos para CSV ou PDF." actions={<button onClick={()=>setActualizacao(v=>v+1)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Actualizar dados</button>} />
    {erro && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-gray-900">Período das consultas</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Data inicial<input type="date" value={dataDe} onChange={e=>setDataDe(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Data final<input type="date" min={dataDe || undefined} value={dataAte} onChange={e=>setDataAte(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label></div><button onClick={()=>{setDataDe("");setDataAte("")}} className="mt-3 text-sm font-semibold text-primaria hover:underline">Remover período</button></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{resumo.map(([nome, valor])=><article key={nome} className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{nome}</p><p className="mt-2 text-3xl font-bold text-gray-900">{valor}</p></article>)}</section>
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5"><h2 className="text-lg font-bold text-gray-900">Exportar relatórios</h2><p className="mt-1 text-sm leading-6 text-gray-600">O PDF abre uma versão pronta para impressão. No diálogo do navegador, seleccione «Guardar como PDF». Os ficheiros exportados podem conter dados pessoais; guarde-os apenas em local autorizado.</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={()=>exportarCSV("resumo-administrativo.csv",["Indicador","Valor"],resumo)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Exportar resumo CSV</button><button onClick={exportarResumoPDF} className="rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaria-hover">Exportar resumo PDF</button><button onClick={()=>exportarCSV("consultas-relatorio.csv",cabecalhosConsultas,linhasConsultas)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Exportar consultas CSV</button><button onClick={exportarConsultasPDF} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Exportar consultas PDF</button></div></section>
    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-200 p-5"><h2 className="font-bold text-gray-900">Consultas no período seleccionado</h2><p className="mt-1 text-sm text-gray-500">{filtradas.length} consulta(s)</p></div>{filtradas.length===0?<p className="p-6 text-sm text-gray-500">Não existem consultas neste período.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["ID","Data","Hora","Médico","Especialidade","Estado"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtradas.slice().sort((a,b)=>`${b.data}`.localeCompare(`${a.data}`)).map(c=><tr key={c.id}><td className="px-4 py-3">{c.id}</td><td className="px-4 py-3">{c.data || "—"}</td><td className="px-4 py-3">{c.horario || "—"}</td><td className="px-4 py-3">{c.medicoNome || "—"}</td><td className="px-4 py-3">{c.especialidade || "—"}</td><td className="px-4 py-3">{c.estado || "—"}</td></tr>)}</tbody></table></div>}</section>
  </main>
}
export default RelatoriosAdmin
