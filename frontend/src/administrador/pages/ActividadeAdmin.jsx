import { useEffect, useState } from "react"
import PageHeader from "../../components/ui/PageHeader"
import { exportarCSV, exportarPDF } from "../../utils/exportacaoAdmin"
import { auditoriaAPI } from "../../services/api"

function ActividadeAdmin() {
  const [pesquisa, setPesquisa] = useState("")
  const [actualizacao, setActualizacao] = useState(0)
  const [registos, setRegistos] = useState([])
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  useEffect(() => {
    let activo = true
    auditoriaAPI.listar()
      .then(({ data }) => {
        if (activo) setRegistos(data.dados || [])
      })
      .catch((error) => {
        if (activo) setErro(error.message || "Não foi possível carregar a actividade.")
      })
      .finally(() => {
        if (activo) setCarregando(false)
      })
    return () => { activo = false }
  }, [actualizacao])
  const filtrados = registos.filter(r => [r.utilizadorNome, r.acao, r.entidade, r.detalhes].join(" ").toLocaleLowerCase("pt-PT").includes(pesquisa.trim().toLocaleLowerCase("pt-PT")))
  const cabecalhos = ["Data", "Utilizador", "Perfil", "Acção", "Entidade", "Detalhes"]
  const linhas = filtrados.map(r => [new Date(r.data).toLocaleString("pt-PT"), r.utilizadorNome, r.utilizadorTipo || "Administrador", r.acao, r.entidade, r.detalhes])
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><PageHeader eyebrow="Administração" title="Registo de actividade" description="Consulte as operações registadas no servidor. Os detalhes guardados limitam-se às descrições fornecidas pelos módulos da aplicação." actions={<><button onClick={()=>setActualizacao(v=>v+1)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold">Actualizar</button><button onClick={()=>exportarCSV("actividade-administrativa.csv",cabecalhos,linhas)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold">Exportar CSV</button><button onClick={()=>exportarPDF("Registo de actividade administrativa","Histórico de acções registadas na interface",cabecalhos,linhas,"actividade-admin")} className="rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white">Exportar PDF</button></>} /><div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">A actividade é visível apenas a administradores. Os registos anteriores à activação da auditoria no servidor não podem ser reconstruídos.</div>{erro && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}{carregando && <p role="status" className="mb-4 text-sm text-gray-600">A carregar actividade...</p>}<section className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-200 p-4"><label className="block text-sm font-medium text-gray-700">Pesquisar actividade<input value={pesquisa} onChange={e=>setPesquisa(e.target.value)} placeholder="Acção, utilizador, entidade ou detalhes" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><p className="mt-2 text-xs text-gray-500">{filtrados.length} registo(s)</p></div>{filtrados.length===0?<div className="p-8 text-center"><h2 className="font-semibold text-gray-900">Ainda não há registos correspondentes</h2><p className="mt-1 text-sm text-gray-500">As operações começarão a aparecer quando forem registadas por utilizadores autenticados.</p></div>:<div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{cabecalhos.map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtrados.map(r=><tr key={r.id} className="align-top"><td className="whitespace-nowrap px-4 py-3">{new Date(r.data).toLocaleString("pt-PT")}</td><td className="px-4 py-3">{r.utilizadorNome}</td><td className="px-4 py-3">{r.utilizadorTipo || "Administrador"}</td><td className="px-4 py-3 font-medium">{r.acao}</td><td className="px-4 py-3">{r.entidade}</td><td className="max-w-md px-4 py-3 text-gray-600">{r.detalhes || "—"}</td></tr>)}</tbody></table></div>}</section></main>
}
export default ActividadeAdmin
