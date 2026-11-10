import { useNavigate } from "react-router-dom"
import { obterUsuarioAutenticado } from "../../data/usuarios"
import { obterRegistosClinicosDoPaciente } from "../../data/registrosClinicos"
import { obterConsultasDoPaciente } from "../../data/consultas"
import { registarAccaoUtilizador } from "../../data/auditoriaAdmin"
import { useStorageSync } from "../../hooks/useStorageSync"
import { exportarPDF } from "../../utils/exportacaoAdmin"
import AppIcon from "../../components/ui/AppIcon"

function dataBonita(data) {
  if (!data) return "Data não disponível"
  const texto = String(data)
  const valor = new Date(texto.includes("T") ? texto : `${texto}T12:00:00`)
  return Number.isNaN(valor.getTime()) ? data : valor.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
}

export default function HistoricoClinicoPaciente() {
  const navegar = useNavigate()
  useStorageSync("registosClinicos")
  useStorageSync("consultas")
  const usuario = obterUsuarioAutenticado()

  if (!usuario) { navegar("/login", { replace: true }); return null }
  if ((usuario.tipo || usuario.role) !== "paciente") { navegar("/", { replace: true }); return null }
  if (usuario.ativo === false) { navegar("/login", { replace: true }); return null }

  const registos = obterRegistosClinicosDoPaciente(usuario.id)
  const consultas = obterConsultasDoPaciente(usuario.id)
  const consultaPorId = new Map(consultas.map((consulta) => [String(consulta.id), consulta]))

  function exportarHistorico() {
    const linhas = registos.map((registo) => {
      const consulta = consultaPorId.get(String(registo.consultaId))
      return [
        dataBonita(consulta?.data || registo.criadoEm || registo.atualizadoEm),
        consulta?.medicoNome || "Médico",
        consulta?.especialidade || "",
        registo.queixa || "",
        registo.diagnostico || "",
        registo.observacoes || "",
        registo.tratamento || "",
      ]
    })
    try {
      exportarPDF("Histórico clínico pessoal", `Paciente: ${usuario.nome || "Paciente"} · Centro Médico Wenji Maka`, ["Data", "Médico", "Especialidade", "Queixa", "Diagnóstico", "Observações", "Tratamento"], linhas, "historico-clinico-pessoal")
      registarAccaoUtilizador("Histórico clínico exportado para PDF", "registo clínico", `${registos.length} registo(s) exportado(s) pelo paciente ID ${usuario.id}`)
    } catch (erro) {
      window.alert(erro.message || "Não foi possível gerar o PDF.")
    }
  }

  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primaria">Wenji Maka · Área do paciente</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Histórico clínico</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Consulte os registos clínicos que os profissionais disponibilizaram após as suas consultas realizadas.</p></div><button type="button" onClick={exportarHistorico} disabled={!registos.length} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"><AppIcon name="download" size={18}/> Exportar PDF</button></header>

    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><AppIcon name="shield" size={20} className="mt-0.5 shrink-0"/><p>Este histórico apresenta apenas os registos associados à sua conta. O documento exportado pode conter informação de saúde sensível; guarde-o num local seguro e partilhe-o apenas com quem autorizar.</p></div>

    {registos.length === 0 ? <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500"><AppIcon name="file" size={25}/></span><h2 className="mt-4 text-lg font-semibold text-gray-900">Ainda não existem registos clínicos</h2><p className="mx-auto mt-2 max-w-md text-sm text-gray-500">Quando o médico guardar e disponibilizar o registo de uma consulta realizada, poderá consultá-lo nesta página.</p><button type="button" onClick={() => navegar("/paciente/minhas-consultas")} className="mt-5 rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Ver minhas consultas</button></section> : <div className="space-y-4">{registos.map((registo) => {
      const consulta = consultaPorId.get(String(registo.consultaId))
      const data = consulta?.data || registo.criadoEm || registo.atualizadoEm || registo.dataAtualizacao
      return <article key={registo.id || registo.consultaId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div><p className="text-sm text-gray-500">{dataBonita(data)}</p><h2 className="mt-1 text-lg font-bold text-gray-900">{consulta?.medicoNome || registo.nomeMedico || "Consulta médica"}</h2><p className="mt-1 text-sm text-gray-500">{consulta?.especialidade || registo.especialidade || "Especialidade não indicada"}</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800"><AppIcon name="check" size={14}/> Registo disponibilizado</span></div><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">{[{titulo:"Queixa",valor:registo.queixa},{titulo:"Diagnóstico",valor:registo.diagnostico},{titulo:"Observações",valor:registo.observacoes},{titulo:"Tratamento e plano",valor:registo.tratamento}].filter((campo)=>campo.valor).map((campo)=><div key={campo.titulo}><h3 className="text-sm font-bold text-gray-800">{campo.titulo}</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{campo.valor}</p></div>)}</div><div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 sm:px-6">Actualizado em {dataBonita(registo.atualizadoEm || registo.criadoEm)}</div></article>
    })}</div>}
  </main>
}
