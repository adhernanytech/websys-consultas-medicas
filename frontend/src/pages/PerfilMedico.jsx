import { Link, useParams, useNavigate } from "react-router-dom"
import { obterMedicoPorId } from "../data/medicos"
import { obterUsuarioAutenticado, usuarioIsPaciente, obterUsuarioPorId } from "../data/usuarios"
import AppIcon from "../components/ui/AppIcon"

function PerfilMedico() {
  const { id } = useParams()
  const navegar = useNavigate()
  const usuario = obterUsuarioAutenticado()
  const perfilMedico = obterMedicoPorId(id)
  const contaMedico = perfilMedico ? obterUsuarioPorId(perfilMedico.usuarioId) : null
  const medico = contaMedico && contaMedico.ativo !== false ? perfilMedico : null

  function marcarConsulta() {
    const destino = `/paciente/marcar-consulta/${medico.id}`
    if (usuarioIsPaciente(usuario)) {
      navegar(destino)
      return
    }
    navegar("/login", { state: { from: { pathname: destino } } })
  }

  if (!medico) {
    return <main className="min-h-[60vh] bg-fundo px-5 py-16 sm:px-8"><div className="mx-auto max-w-3xl rounded-2xl border border-borda bg-white p-8 text-center sm:p-12"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primaria/10 text-primaria"><AppIcon name="users" size={27} /></span><h1 className="mt-5 text-2xl font-bold text-texto">Médico não encontrado</h1><p className="mt-3 leading-7 text-texto-secundario">O perfil solicitado não existe ou não está disponível neste momento.</p><Link to="/medicos" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primaria px-5 py-3 font-semibold text-white transition hover:bg-primaria-hover">Voltar aos médicos <AppIcon name="arrow-right" size={17} /></Link></div></main>
  }

  return (
    <main className="min-h-screen bg-fundo">
      <section className="border-b border-borda bg-white"><div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10"><Link to="/medicos" className="inline-flex items-center gap-2 text-sm font-semibold text-primaria hover:text-primaria-hover"><AppIcon name="arrow-right" size={16} className="rotate-180" /> Voltar à lista de médicos</Link></div></section>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <aside className="overflow-hidden rounded-3xl border border-borda bg-white shadow-sm">
            <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-primaria/10 via-fundo to-secundaria/10 p-8">
              {medico.foto ? <img src={medico.foto} alt={`Fotografia de ${medico.nome}`} className="h-44 w-44 rounded-full border-4 border-white object-cover shadow-md" /> : <span className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-white bg-primaria/10 text-5xl font-bold text-primaria shadow-md">{String(medico.nome || "M").trim().slice(0, 1).toUpperCase()}</span>}
            </div>
            <div className="p-6 sm:p-8"><span className="inline-flex items-center gap-2 rounded-full bg-primaria/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primaria"><AppIcon name="stethoscope" size={14} /> Perfil profissional</span><h1 className="mt-4 text-2xl font-bold leading-tight text-texto sm:text-3xl">{medico.nome}</h1><p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-fundo px-3 py-2 font-semibold text-texto-secundario"><AppIcon name="activity" size={17} className="text-primaria" /> {medico.especialidade || "Especialidade não indicada"}</p>{medico.experiencia && <p className="mt-4 text-sm leading-6 text-texto-secundario">{medico.experiencia}</p>}<div className="mt-6 border-t border-borda pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-texto-suave">Código profissional</p><p className="mt-1 font-semibold text-texto">{medico.id}</p></div><button type="button" onClick={marcarConsulta} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primaria px-5 py-3.5 font-semibold text-white transition hover:bg-primaria-hover"><AppIcon name="calendar" size={18} /> Marcar consulta</button><p className="mt-3 text-center text-xs leading-5 text-texto-secundario">Para solicitar uma consulta, poderá ser necessário iniciar sessão ou criar uma conta.</p></div>
          </aside>
          <div className="space-y-6">
            <article className="rounded-3xl border border-borda bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="user" size={22} /></span><div><p className="text-sm font-semibold text-primaria">Apresentação</p><h2 className="text-xl font-bold text-texto">Sobre o profissional</h2></div></div><p className="mt-5 whitespace-pre-line leading-7 text-texto-secundario">{medico.biografia || "A biografia profissional ainda não foi disponibilizada. Poderá consultar as informações principais deste médico e verificar os horários disponíveis através da plataforma."}</p></article>
            <article className="rounded-3xl border border-borda bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="calendar" size={22} /></span><div><p className="text-sm font-semibold text-primaria">Próximo passo</p><h2 className="text-xl font-bold text-texto">Consulte a disponibilidade</h2></div></div><p className="mt-4 leading-7 text-texto-secundario">A disponibilidade para marcação depende dos horários que o profissional tiver registado na plataforma. Inicie o processo de marcação para consultar as opções disponíveis.</p><button type="button" onClick={marcarConsulta} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primaria px-5 py-3 font-semibold text-primaria transition hover:bg-primaria hover:text-white">Consultar horários <AppIcon name="arrow-right" size={17} /></button></article>
            <div className="rounded-2xl border border-primaria/15 bg-primaria/5 p-5"><div className="flex items-start gap-3"><AppIcon name="shield" size={21} className="mt-0.5 shrink-0 text-primaria" /><p className="text-sm leading-6 text-texto-secundario">As informações apresentadas correspondem aos dados profissionais registados na plataforma. Em caso de dúvida, confirme os detalhes antes de concluir uma marcação.</p></div></div>
          </div>
        </div>
      </section>
    </main>
  )
}
export default PerfilMedico
