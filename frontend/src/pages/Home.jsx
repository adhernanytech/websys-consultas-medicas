import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import DoctorCard from "../components/CardMedico"
import { obterMedicos } from "../data/medicos"
import { obterUsuarioPorId } from "../data/usuarios"
import { obterEspecialidades } from "../data/especialidades"
import AppIcon from "../components/ui/AppIcon"

function Home() {
  const [pesquisa, setPesquisa] = useState("")
  const [mensagemPesquisa, setMensagemPesquisa] = useState("")
  const navegar = useNavigate()

  const medicosActivos = obterMedicos().filter((medico) => {
    const conta = obterUsuarioPorId(medico.usuarioId)
    return Boolean(conta) && conta.ativo !== false
  })
  const especialidadesActivas = obterEspecialidades().filter((item) => item.ativo !== false)
  const medicosDestaque = medicosActivos.slice(0, 3)
  const especialidadesDestaque = especialidadesActivas.slice(0, 4)

  function pesquisarMedicos(evento) {
    evento.preventDefault()
    const termo = pesquisa.trim()
    if (termo.length < 2) {
      setMensagemPesquisa(termo ? "Digite pelo menos 2 caracteres." : "Digite o nome de um médico ou uma especialidade.")
      return
    }
    navegar(`/medicos?pesquisa=${encodeURIComponent(termo)}`)
  }

  const passos = [
    { numero: "01", titulo: "Encontre um profissional", texto: "Explore os médicos e as especialidades disponíveis no Centro Médico." },
    { numero: "02", titulo: "Escolha o horário", texto: "Consulte o perfil do médico e os horários que estiverem disponíveis." },
    { numero: "03", titulo: "Acompanhe a consulta", texto: "Aceda à sua conta para consultar e gerir as suas marcações." },
  ]

  return (
    <main className="min-h-screen bg-fundo">
      <section className="relative overflow-hidden bg-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-primaria/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-secundaria/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primaria/15 bg-primaria/5 px-3.5 py-2 text-sm font-semibold text-primaria">
              <AppIcon name="clinic" size={17} /> Centro Médico Wenji Maka
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-texto sm:text-5xl lg:text-6xl">
              Cuidar da sua saúde começa com <span className="text-primaria">uma boa escolha.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-texto-secundario">
              Encontre médicos, conheça as especialidades disponíveis e organize as suas consultas num só lugar — de forma simples e conveniente.
            </p>
            <form onSubmit={pesquisarMedicos} className="mt-8 max-w-xl rounded-2xl border border-borda bg-white p-2 shadow-lg shadow-slate-900/5 sm:flex sm:items-center">
              <label htmlFor="pesquisa-home" className="sr-only">Pesquisar médico ou especialidade</label>
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                <AppIcon name="search" size={21} className="shrink-0 text-texto-suave" />
                <input id="pesquisa-home" type="search" placeholder="Médico ou especialidade" value={pesquisa} onChange={(evento) => { setPesquisa(evento.target.value); setMensagemPesquisa("") }} className="w-full min-w-0 border-0 bg-transparent py-2 text-texto outline-none placeholder:text-texto-suave focus:ring-0" />
              </div>
              <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primaria px-5 py-3.5 font-semibold text-white transition hover:bg-primaria-hover sm:mt-0 sm:w-auto">
                Pesquisar <AppIcon name="search" size={17} />
              </button>
            </form>
            {mensagemPesquisa && <p role="alert" className="mt-2 text-sm text-erro">{mensagemPesquisa}</p>}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/medicos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primaria px-6 py-3.5 font-semibold text-white transition hover:bg-primaria-hover">
                Encontrar um médico <AppIcon name="arrow-right" size={18} />
              </Link>
              <Link to="/sobre" className="inline-flex items-center justify-center rounded-xl border border-borda px-6 py-3.5 font-semibold text-texto transition hover:border-primaria/40 hover:bg-fundo">
                Conhecer o Centro
              </Link>
            </div>
            <p className="mt-5 text-sm text-texto-secundario">Já tem conta? <Link to="/login" className="font-semibold text-primaria hover:underline">Inicie sessão</Link> para gerir as suas consultas.</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2rem] bg-primaria/10 blur-sm" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-primaria/10 bg-gradient-to-br from-primaria/10 via-white to-secundaria/10 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primaria">Saúde mais organizada</p>
                  <h2 className="mt-2 text-2xl font-bold text-texto sm:text-3xl">O próximo passo é seu.</h2>
                  <p className="mt-3 max-w-sm leading-6 text-texto-secundario">Use a plataforma para descobrir profissionais e acompanhar as suas marcações.</p>
                </div>
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primaria text-white shadow-md sm:flex"><AppIcon name="stethoscope" size={28} /></div>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="users" size={21} /></div>
                  <p className="mt-4 text-2xl font-bold text-texto">{medicosActivos.length}</p>
                  <p className="mt-1 text-sm text-texto-secundario">{medicosActivos.length === 1 ? "médico disponível" : "médicos disponíveis"}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secundaria/15 text-primaria"><AppIcon name="activity" size={21} /></div>
                  <p className="mt-4 text-2xl font-bold text-texto">{especialidadesActivas.length}</p>
                  <p className="mt-1 text-sm text-texto-secundario">{especialidadesActivas.length === 1 ? "especialidade" : "especialidades"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-primaria p-4 text-white">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"><AppIcon name="calendar" size={23} /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold">Marcação mais conveniente</p><p className="mt-0.5 text-sm text-white/80">Consulte os profissionais e siga os passos online.</p></div>
                <AppIcon name="arrow-right" size={20} />
              </div>
              <p className="mt-4 text-xs leading-5 text-texto-secundario">A disponibilidade apresentada depende dos dados e horários registados na plataforma.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-borda bg-fundo-terciario/70">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[{ icon: "search", title: "Pesquisa simples", text: "Procure por nome ou especialidade." }, { icon: "users", title: "Perfis profissionais", text: "Conheça os médicos disponíveis." }, { icon: "calendar", title: "Consultas organizadas", text: "Acompanhe as marcações na sua conta." }].map((item) => (
            <div key={item.title} className="flex items-start gap-4 rounded-xl p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primaria shadow-sm"><AppIcon name={item.icon} size={21} /></span>
              <div><h2 className="font-bold text-texto">{item.title}</h2><p className="mt-1 text-sm leading-6 text-texto-secundario">{item.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Especialidades</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">Encontre cuidados adequados às suas necessidades</h2><p className="mt-4 leading-7 text-texto-secundario">Explore as áreas disponíveis e descubra os profissionais associados a cada uma.</p></div>
          <Link to="/especialidades" className="inline-flex items-center gap-2 font-semibold text-primaria hover:text-primaria-hover">Ver todas <AppIcon name="arrow-right" size={18} /></Link>
        </div>
        {especialidadesDestaque.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {especialidadesDestaque.map((especialidade, indice) => (
            <Link key={especialidade.id ?? especialidade.nome} to={`/medicos?especialidade=${encodeURIComponent(especialidade.nome)}`} className="group rounded-2xl border border-borda bg-white p-5 transition hover:-translate-y-1 hover:border-primaria/30 hover:shadow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name={["activity", "stethoscope", "heart", "clipboard"][indice % 4]} size={23} /></span>
              <h3 className="mt-5 text-lg font-bold text-texto group-hover:text-primaria">{especialidade.nome}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-texto-secundario">{especialidade.descricao || "Consulte os profissionais disponíveis nesta especialidade."}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primaria">Ver médicos <AppIcon name="arrow-right" size={16} /></span>
            </Link>
          ))}
        </div> : <div className="mt-8 rounded-2xl border border-dashed border-borda bg-white p-8 text-center"><p className="font-semibold text-texto">As especialidades serão apresentadas aqui.</p><p className="mt-2 text-sm text-texto-secundario">Consulte novamente quando forem disponibilizadas pelo Centro.</p></div>}
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Profissionais</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">Conheça alguns dos nossos médicos</h2><p className="mt-4 max-w-2xl leading-7 text-texto-secundario">Consulte os perfis, a experiência e as informações profissionais disponíveis.</p></div><Link to="/medicos" className="inline-flex items-center gap-2 font-semibold text-primaria hover:text-primaria-hover">Ver todos os médicos <AppIcon name="arrow-right" size={18} /></Link></div>
          {medicosDestaque.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{medicosDestaque.map((medico) => <DoctorCard key={medico.id} id={medico.id} nome={medico.nome} especialidade={medico.especialidade} experiencia={medico.experiencia} foto={medico.foto} />)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-borda bg-fundo p-8 text-center"><p className="font-semibold text-texto">Ainda não existem perfis médicos públicos.</p><p className="mt-2 text-sm text-texto-secundario">Os perfis serão apresentados aqui quando as contas e os dados profissionais estiverem activos.</p></div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Como funciona</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">Três passos para começar</h2><p className="mt-4 leading-7 text-texto-secundario">A plataforma foi pensada para tornar a procura de profissionais e a gestão das consultas mais claras.</p><Link to="/registro" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primaria px-5 py-3 font-semibold text-white transition hover:bg-primaria-hover">Criar a minha conta <AppIcon name="arrow-right" size={18} /></Link></div>
          <div className="space-y-4">{passos.map((passo) => <article key={passo.numero} className="flex gap-5 rounded-2xl border border-borda bg-white p-5 sm:p-6"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primaria/10 text-sm font-bold text-primaria">{passo.numero}</span><div><h3 className="text-lg font-bold text-texto">{passo.titulo}</h3><p className="mt-2 leading-6 text-texto-secundario">{passo.texto}</p></div></article>)}</div>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primaria px-6 py-10 text-white sm:px-10 sm:py-14 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">Comece agora</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Dê o próximo passo na organização dos seus cuidados.</h2><p className="mt-4 leading-7 text-white/80">Explore os médicos disponíveis ou crie uma conta para acompanhar as suas consultas.</p></div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0"><Link to="/medicos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-primaria transition hover:bg-blue-50">Ver médicos <AppIcon name="arrow-right" size={18} /></Link><Link to="/registro" className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3.5 font-semibold text-white transition hover:bg-white/10">Criar conta</Link></div>
        </div>
      </section>
    </main>
  )
}

export default Home
