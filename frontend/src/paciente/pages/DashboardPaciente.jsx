import { Link, useNavigate } from "react-router-dom"
import { obterUsuarioAutenticado } from "../../data/usuarios"
import { obterConsultasDoPaciente } from "../../data/consultas"
import { obterNotificacoesPaciente } from "../../data/notificacoesPaciente"
import { useStorageSync } from "../../hooks/useStorageSync"
import AppIcon from "../../components/ui/AppIcon"

function formatarData(data, horario) {
  if (!data) return "Data por definir"
  const valor = new Date(`${data}T${horario || "12:00"}:00`)
  if (Number.isNaN(valor.getTime())) return data
  return valor.toLocaleString("pt-PT", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
function Estado({ estado }) {
  const classes = { Agendada: "bg-blue-50 text-blue-700", Confirmada: "bg-green-50 text-green-700", Cancelada: "bg-red-50 text-red-700", Concluída: "bg-violet-50 text-violet-700", Realizada: "bg-violet-50 text-violet-700", "Não compareceu": "bg-amber-50 text-amber-800" }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[estado] || "bg-gray-100 text-gray-700"}`}>{estado || "Sem estado"}</span>
}
function Resumo({ titulo, valor, descricao, icon, href }) {
  const conteudo = <div className="flex h-full items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primaria"><AppIcon name={icon} size={21}/></span><div className="min-w-0"><p className="text-sm font-medium text-gray-500">{titulo}</p><p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{valor}</p><p className="mt-1 text-xs text-gray-500">{descricao}</p></div></div>
  return href ? <Link to={href} className="block">{conteudo}</Link> : conteudo
}

export default function DashboardPaciente() {
  const navegar = useNavigate()
  useStorageSync("consultas")
  useStorageSync("registosClinicos")
  const usuario = obterUsuarioAutenticado()

  if (!usuario) { navegar("/login", { replace: true }); return null }
  if ((usuario.tipo || usuario.role) !== "paciente") { navegar("/", { replace: true }); return null }
  if (usuario.ativo === false) { navegar("/login", { replace: true }); return null }

  const consultas = obterConsultasDoPaciente(usuario.id)
  const agora = Date.now()
  const futuras = consultas.filter((consulta) => ["Agendada", "Confirmada"].includes(consulta.estado) && new Date(`${consulta.data}T${consulta.horario || "00:00"}:00`).getTime() >= agora).sort((a, b) => `${a.data} ${a.horario || ""}`.localeCompare(`${b.data} ${b.horario || ""}`))
  const realizadas = consultas.filter((consulta) => ["Concluída", "Realizada"].includes(consulta.estado))
  const canceladas = consultas.filter((consulta) => consulta.estado === "Cancelada")
  const notificacoes = obterNotificacoesPaciente(usuario.id)
  const naoLidas = notificacoes.filter((item) => !item.lida).length
  const proxima = futuras[0]
  const perfilCompleto = Boolean(usuario.nome && usuario.email && usuario.telefone)
  const iniciais = String(usuario.nome || "P").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()

  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--cor-primaria,#145a72)] to-slate-800 p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {usuario.foto ? <img src={usuario.foto} alt={`Fotografia de ${usuario.nome}`} className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover"/> : <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20">{iniciais || "P"}</span>}
          <div><p className="text-sm font-medium text-white/70">Centro Médico Wenji Maka</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Olá, {usuario.nome?.split(" ")[0] || "Paciente"}</h1><p className="mt-2 max-w-xl text-sm text-white/75">Acompanhe as suas consultas, consulte os registos disponibilizados e mantenha os seus dados actualizados.</p></div>
        </div>
        <Link to="/paciente/marcar-consulta" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-primaria shadow-sm transition hover:bg-blue-50"><AppIcon name="calendar" size={18}/> Marcar consulta</Link>
      </div>
    </section>

    {!perfilCompleto && <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AppIcon name="user" size={21} className="mt-0.5 shrink-0 text-amber-700"/><div><h2 className="font-semibold text-amber-900">Complete o seu perfil</h2><p className="mt-1 text-sm text-amber-800">Adicionar o seu contacto telefónico facilita a comunicação sobre as consultas.</p></div></div><Link to="/paciente/perfil" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 underline">Actualizar perfil <AppIcon name="user" size={15}/></Link></section>}

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Resumo titulo="Próximas consultas" valor={futuras.length} descricao="Marcações futuras" icon="calendar" href="/paciente/minhas-consultas"/>
      <Resumo titulo="Realizadas" valor={realizadas.length} descricao="Consultas concluídas" icon="check" href="/paciente/minhas-consultas"/>
      <Resumo titulo="Canceladas" valor={canceladas.length} descricao="Consultas canceladas" icon="activity" href="/paciente/minhas-consultas"/>
      <Resumo titulo="Notificações por ler" valor={naoLidas} descricao="Avisos sobre as suas marcações" icon="bell" href="/paciente/notificacoes"/>
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5 sm:p-6"><div><h2 className="text-lg font-bold text-gray-900">Próxima consulta</h2><p className="mt-1 text-sm text-gray-500">A sua marcação futura mais próxima.</p></div><Link to="/paciente/minhas-consultas" className="text-sm font-semibold text-primaria hover:underline">Ver todas</Link></div>
        {proxima ? <div className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-primaria"><span className="text-xs font-semibold uppercase">{new Date(`${proxima.data}T12:00:00`).toLocaleDateString("pt-PT", { month: "short" })}</span><strong className="text-xl">{new Date(`${proxima.data}T12:00:00`).getDate()}</strong></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-gray-900">{proxima.medicoNome || "Médico"}</h3><Estado estado={proxima.estado}/></div><p className="mt-1 text-sm text-gray-500">{proxima.especialidade || "Especialidade não indicada"}</p><p className="mt-3 flex items-center gap-2 text-sm text-gray-700"><AppIcon name="clock" size={16}/>{formatarData(proxima.data, proxima.horario)}</p>{proxima.motivo && <p className="mt-2 line-clamp-2 text-sm text-gray-500">Motivo: {proxima.motivo}</p>}<Link to={`/paciente/minhas-consultas/${proxima.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Ver detalhes <AppIcon name="file" size={16}/></Link></div></div></div> : <div className="p-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500"><AppIcon name="calendar" size={22}/></span><h3 className="mt-3 font-semibold text-gray-900">Não tem consultas futuras</h3><p className="mt-1 text-sm text-gray-500">Pode procurar um médico e marcar uma consulta quando precisar.</p><Link to="/paciente/medicos" className="mt-4 inline-flex rounded-xl bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Encontrar médicos</Link></div>}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-gray-900">Acesso rápido</h2><p className="mt-1 text-sm text-gray-500">As principais ferramentas da sua área.</p><div className="mt-5 space-y-3">
        {[{to:"/paciente/medicos",icon:"stethoscope",titulo:"Encontrar médicos",texto:"Consultar médicos e especialidades"},{to:"/paciente/minhas-consultas",icon:"clipboard",titulo:"Minhas consultas",texto:"Ver estados e gerir marcações"},{to:"/paciente/historico-clinico",icon:"file",titulo:"Histórico clínico",texto:"Consultar registos disponibilizados"},{to:"/paciente/notificacoes",icon:"bell",titulo:"Notificações",texto:naoLidas ? `${naoLidas} aviso(s) por ler` : "Consultar avisos e lembretes"},{to:"/paciente/perfil",icon:"user",titulo:"Meu perfil",texto:"Actualizar os seus dados pessoais"}].map((item)=><Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><AppIcon name={item.icon} size={19}/></span><span className="min-w-0 flex-1"><strong className="block text-sm text-gray-900">{item.titulo}</strong><span className="mt-0.5 block text-xs text-gray-500">{item.texto}</span></span><AppIcon name="file" size={16} className="text-gray-400"/></Link>)}
      </div></div>
    </section>

    <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 sm:p-6"><div><h2 className="text-lg font-bold text-gray-900">Consultas recentes</h2><p className="mt-1 text-sm text-gray-500">Histórico das últimas marcações.</p></div><Link to="/paciente/minhas-consultas" className="text-sm font-semibold text-primaria hover:underline">Ver histórico</Link></div>{consultas.length === 0 ? <p className="p-6 text-sm text-gray-500">Ainda não existem consultas associadas à sua conta.</p> : <div className="divide-y divide-gray-100">{[...consultas].sort((a,b)=>`${b.data || ""} ${b.horario || ""}`.localeCompare(`${a.data || ""} ${a.horario || ""}`)).slice(0,4).map((consulta)=><Link key={consulta.id} to={`/paciente/minhas-consultas/${consulta.id}`} className="flex flex-col gap-2 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{consulta.medicoNome || "Médico"}</p><p className="mt-1 text-sm text-gray-500">{formatarData(consulta.data, consulta.horario)} · {consulta.especialidade || "Especialidade não indicada"}</p></div><Estado estado={consulta.estado}/></Link>)}</div>}</section>
  </main>
}
