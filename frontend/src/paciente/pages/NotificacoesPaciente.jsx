import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AppIcon from "../../components/ui/AppIcon"
import { useAuth } from "../../context/AuthContext"
import { consultasAPI, notificacoesAPI } from "../../services/api"

export default function NotificacoesPaciente() {
  const navegar = useNavigate()
  const [actualizacao, setActualizacao] = useState(0)
  const [consultas, setConsultas] = useState([])
  const [notificacoes, setNotificacoes] = useState([])
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const { usuario: paciente } = useAuth()

  useEffect(() => {
    if (!paciente) return
    let activo = true
    Promise.all([consultasAPI.listar(), notificacoesAPI.listar()])
      .then(([consultasResponse, notificacoesResponse]) => {
        if (!activo) return
        setConsultas((consultasResponse.data.dados || []).filter(
          (consulta) => String(consulta.pacienteId) === String(paciente.id)
        ))
        setNotificacoes(notificacoesResponse.data.dados || [])
      })
      .catch((error) => { if (activo) setErro(error.message || "Não foi possível carregar notificações.") })
      .finally(() => { if (activo) setCarregando(false) })
    return () => { activo = false }
  }, [paciente, actualizacao])

  if (!paciente) { navegar("/login", { replace: true }); return null }
  if ((paciente.tipo || paciente.role) !== "paciente") { navegar("/", { replace: true }); return null }

  const naoLidas = notificacoes.filter((item) => !item.lida).length

  async function marcarTodas() {
    try {
      await notificacoesAPI.marcarTodasLidas()
      setErro("")
    } catch (error) {
      setErro(error.message || "Não foi possível actualizar as notificações.")
    }
    setActualizacao((n) => n + 1)
  }
  async function abrirNotificacao(item) {
    if (!item.lida) {
      try {
        await notificacoesAPI.marcarLida(item.id)
        setActualizacao((n) => n + 1)
      } catch (error) {
        setErro(error.message || "Não foi possível marcar a notificação.")
        return
      }
    }
    navegar(item.link || "/paciente/minhas-consultas")
  }

  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold text-primaria">Wenji Maka · Área do paciente</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Notificações</h1><p className="mt-2 max-w-2xl text-sm text-gray-600">Acompanhe os avisos registados para a sua conta.</p></div>
      {naoLidas > 0 && <button type="button" onClick={marcarTodas} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"><AppIcon name="check" size={17}/> Marcar todas como lidas</button>}
    </header>
    {erro && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
    {carregando && <p role="status" className="mb-5 text-sm text-gray-600">A carregar notificações...</p>}

    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Total de avisos</p><p className="mt-2 text-3xl font-bold text-gray-900">{notificacoes.length}</p></div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Por ler</p><p className="mt-2 text-3xl font-bold text-primaria">{naoLidas}</p></div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Consultas registadas</p><p className="mt-2 text-3xl font-bold text-gray-900">{consultas.length}</p></div>
    </div>

    {notificacoes.length === 0 ? <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primaria"><AppIcon name="bell" size={26}/></span><h2 className="mt-4 text-lg font-semibold text-gray-900">Ainda não tem notificações</h2><p className="mx-auto mt-2 max-w-md text-sm text-gray-600">Quando tiver marcações, os avisos relacionados com o estado das consultas aparecerão aqui.</p><Link to="/paciente/medicos" className="mt-5 inline-flex rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Encontrar um médico</Link></section> : <section className="space-y-3">
      {notificacoes.map((item) => <article key={`${item.id}-${actualizacao}`} className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-start ${item.lida ? "border-gray-200" : "border-blue-200 ring-1 ring-blue-50"}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tipo === "aviso" ? "bg-amber-50 text-amber-700" : item.tipo === "sucesso" ? "bg-green-50 text-green-700" : item.tipo === "lembrete" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}><AppIcon name={item.tipo === "aviso" ? "activity" : item.tipo === "sucesso" ? "check" : item.tipo === "lembrete" ? "clock" : "calendar"} size={21}/></span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-gray-900">{item.titulo}</h2>{!item.lida && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Nova</span>}</div><p className="mt-1 text-sm leading-6 text-gray-600">{item.mensagem}</p><p className="mt-2 text-xs text-gray-400">{item.data && !Number.isNaN(new Date(item.data).getTime()) ? new Date(item.data).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" }) : "Data não disponível"}</p></div>
        <button type="button" onClick={() => abrirNotificacao(item)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Ver consulta <AppIcon name="file" size={16}/></button>
      </article>)}
    </section>}
    <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-gray-500"><AppIcon name="shield" size={16} className="mt-0.5 shrink-0"/> As notificações são apresentadas a partir dos registos guardados na API.</p>
  </main>
}
