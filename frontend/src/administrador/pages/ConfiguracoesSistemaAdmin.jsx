import { useEffect, useState } from "react"
import PageHeader from "../../components/ui/PageHeader"
import { registarAccaoAdmin } from "../../data/auditoriaAdmin"

const CHAVE = "configuracoesSistemaClinica"
const PADRAO = {
  nomeClinica: "Wenji Maka",
  emailContacto: "",
  telefoneContacto: "",
  duracaoConsulta: "30",
  antecedenciaMinimaHoras: "2",
  antecedenciaCancelamentoHoras: "24",
  permitirMarcarMesmoDia: true,
  mostrarMedicosInactivos: false,
  notificacoesActivadas: true,
  nomeSistema: "Wenji Maka Online",
  fusoHorario: "Africa/Luanda",
  idioma: "pt-AO",
  formatoData: "dd/MM/yyyy",
  permitirAvaliacoes: true,
  lembreteConsultaHoras: "24",
  maximoConsultasDia: "20",
  exigirConfirmacaoAdmin: true,
}
function lerConfiguracoes() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CHAVE) || "{}")
    const resultado = { ...PADRAO, ...(guardadas && typeof guardadas === "object" ? guardadas : {}) }
    if (["Sistema Médico", "Sistema Médico Online", "Sistema Médico - Online"].includes(resultado.nomeClinica)) resultado.nomeClinica = "Wenji Maka"
    return resultado
  } catch { return PADRAO }
}

function ConfiguracoesSistemaAdmin() {
  const [formulario, setFormulario] = useState(lerConfiguracoes)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  useEffect(() => { setFormulario(lerConfiguracoes()) }, [])
  function alterar(evento) {
    const { name, value, type, checked } = evento.target
    setFormulario(atual => ({ ...atual, [name]: type === "checkbox" ? checked : value }))
    setMensagem(""); setErro("")
  }
  function guardar(evento) {
    evento.preventDefault(); setMensagem(""); setErro("")
    if (!window.confirm("Confirma que pretende guardar as configurações do sistema Wenji Maka?")) return
    if (Number(formulario.lembreteConsultaHoras) < 0 || Number(formulario.lembreteConsultaHoras) > 720) { setErro("O lembrete deve estar entre 0 e 720 horas."); return }
    if (Number(formulario.maximoConsultasDia) < 1 || Number(formulario.maximoConsultasDia) > 500) { setErro("O limite de consultas deve estar entre 1 e 500."); return }
    if (Number(formulario.duracaoConsulta) < 10 || Number(formulario.duracaoConsulta) > 240) { setErro("A duração da consulta deve estar entre 10 e 240 minutos."); return }
    if (Number(formulario.antecedenciaMinimaHoras) < 0 || Number(formulario.antecedenciaCancelamentoHoras) < 0) { setErro("As antecedências não podem ser negativas."); return }
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ ...formulario, duracaoConsulta: Number(formulario.duracaoConsulta), lembreteConsultaHoras: Number(formulario.lembreteConsultaHoras), maximoConsultasDia: Number(formulario.maximoConsultasDia), antecedenciaMinimaHoras: Number(formulario.antecedenciaMinimaHoras), antecedenciaCancelamentoHoras: Number(formulario.antecedenciaCancelamentoHoras), actualizadoEm: new Date().toISOString() }))
      registarAccaoAdmin("Configurações gerais actualizadas", "configurações", `Duração padrão: ${formulario.duracaoConsulta} min`)
      setMensagem("Configurações guardadas neste navegador.")
    } catch { setErro("Não foi possível guardar as configurações no armazenamento local.") }
  }
  function repor() {
    if (!window.confirm("Repor os valores padrão das configurações?")) return
    setFormulario(PADRAO); localStorage.setItem(CHAVE, JSON.stringify(PADRAO)); setMensagem("Valores padrão repostos."); setErro("")
    registarAccaoAdmin("Configurações repostas", "configurações", "Valores padrão")
  }
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><PageHeader eyebrow="Administração" title="Configurações do sistema" description="Defina os parâmetros gerais que poderão ser utilizados pelas páginas e, futuramente, pela API. Nesta fase, os valores ficam guardados no navegador." actions={<button onClick={repor} type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold">Repor padrão</button>} />
    {mensagem && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{mensagem}</p>}{erro && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
    <form onSubmit={guardar} className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold text-gray-900">Identificação da clínica</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Nome da clínica/sistema<input name="nomeClinica" value={formulario.nomeClinica} onChange={alterar} required maxLength={120} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Email de contacto<input name="emailContacto" type="email" value={formulario.emailContacto} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Telefone de contacto<input name="telefoneContacto" value={formulario.telefoneContacto} onChange={alterar} maxLength={40} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label></div></section>
      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold text-gray-900">Regras de marcação</h2><p className="mt-1 text-sm text-gray-500">São parâmetros de configuração; as páginas de marcação ainda precisam de os consumir explicitamente para produzirem efeito.</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium text-gray-700">Duração padrão (minutos)<input name="duracaoConsulta" type="number" min="10" max="240" step="5" required value={formulario.duracaoConsulta} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Antecedência mínima (horas)<input name="antecedenciaMinimaHoras" type="number" min="0" max="8760" required value={formulario.antecedenciaMinimaHoras} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Prazo de cancelamento (horas)<input name="antecedenciaCancelamentoHoras" type="number" min="0" max="8760" required value={formulario.antecedenciaCancelamentoHoras} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label></div><div className="mt-4 space-y-3">{[["permitirMarcarMesmoDia","Permitir marcação no próprio dia"],["mostrarMedicosInactivos","Mostrar médicos inactivos nas listas administrativas"],["notificacoesActivadas","Activar notificações da interface"]].map(([name,label])=><label key={name} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"><input type="checkbox" name={name} checked={Boolean(formulario[name])} onChange={alterar} className="mt-0.5 h-4 w-4 rounded border-gray-300"/><span>{label}</span></label>)}</div></section>
      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-bold text-gray-900">Experiência e preferências</h2><p className="mt-1 text-sm text-gray-500">Preferências preparadas para serem consumidas pelos fluxos da aplicação e futuramente pela API.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Nome apresentado no sistema<input name="nomeSistema" value={formulario.nomeSistema} onChange={alterar} required maxLength={120} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Fuso horário<select name="fusoHorario" value={formulario.fusoHorario} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="Africa/Luanda">África/Luanda</option><option value="UTC">UTC</option><option value="Europe/Lisbon">Europa/Lisboa</option></select></label><label className="text-sm font-medium text-gray-700">Idioma<select name="idioma" value={formulario.idioma} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="pt-AO">Português (Angola)</option><option value="pt-PT">Português (Portugal)</option><option value="en">English</option></select></label><label className="text-sm font-medium text-gray-700">Formato de data<select name="formatoData" value={formulario.formatoData} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="dd/MM/yyyy">DD/MM/AAAA</option><option value="yyyy-MM-dd">AAAA-MM-DD</option></select></label><label className="text-sm font-medium text-gray-700">Lembrete antes da consulta (horas)<input name="lembreteConsultaHoras" type="number" min="0" max="720" value={formulario.lembreteConsultaHoras} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-gray-700">Limite de consultas por médico/dia<input name="maximoConsultasDia" type="number" min="1" max="500" value={formulario.maximoConsultasDia} onChange={alterar} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label></div><div className="mt-4 space-y-3">{[["permitirAvaliacoes","Permitir avaliações após consultas realizadas"],["exigirConfirmacaoAdmin","Pedir confirmação antes de operações administrativas" ]].map(([name,label])=><label key={name} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"><input type="checkbox" name={name} checked={Boolean(formulario[name])} onChange={alterar} className="mt-0.5 h-4 w-4 rounded border-gray-300"/><span>{label}</span></label>)}</div></section>
      <div className="flex justify-end"><button type="submit" className="rounded-lg bg-primaria px-5 py-3 text-sm font-semibold text-white hover:bg-primaria-hover">Guardar configurações</button></div>
    </form>
  </main>
}
export default ConfiguracoesSistemaAdmin
