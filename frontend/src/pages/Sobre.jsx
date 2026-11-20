import { Link } from "react-router-dom"
import AppIcon from "../components/ui/AppIcon"

function SobreNos() {
  const imagensCentro = [
    {
      src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85",
      alt: "Espaço clínico moderno e luminoso",
      titulo: "Espaços de atendimento",
      classe: "md:col-span-2 md:row-span-2",
    },
    {
      src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85",
      alt: "Profissional de saúde a acompanhar um paciente",
      titulo: "Acompanhamento próximo",
      classe: "",
    },
    {
      src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85",
      alt: "Profissional de saúde durante uma consulta",
      titulo: "Cuidado profissional",
      classe: "",
    },
  ]
  const servicos = [
    {
      icon: "users",
      titulo: "Consulta de profissionais",
      texto: "Conheça os perfis, a experiência e as informações profissionais dos médicos disponíveis.",
    },
    {
      icon: "activity",
      titulo: "Acesso a especialidades",
      texto: "Explore as áreas médicas registadas e encontre profissionais associados a cada especialidade.",
    },
    {
      icon: "calendar",
      titulo: "Marcação e acompanhamento",
      texto: "Solicite consultas e acompanhe o estado das suas marcações através da sua conta.",
    },
  ]
  const principios = [
    { icon: "heart", titulo: "Cuidado centrado na pessoa", texto: "Promover uma experiência de atendimento respeitosa, clara e atenta às necessidades de cada paciente." },
    { icon: "shield", titulo: "Responsabilidade e confiança", texto: "Valorizar a responsabilidade profissional, a privacidade e o uso cuidadoso da informação." },
    { icon: "activity", titulo: "Melhoria contínua", texto: "Utilizar ferramentas digitais para tornar a procura e a gestão de consultas mais organizadas." },
  ]
  return <>
    <main className="min-h-screen bg-fundo">
      <section className="relative overflow-hidden border-b border-borda bg-white">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primaria/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Sobre nós</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-texto sm:text-5xl">Conheça o Centro Médico Wenji Maka</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-texto-secundario">
            Esta plataforma aproxima os pacientes dos profissionais de saúde, facilitando a consulta de médicos,
            a descoberta de especialidades e a organização das marcações.
          </p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-texto-secundario">
           Localização: <b >Calemba 2, Camama </b>
          </p>
            
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/medicos"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primaria px-5 py-3.5 
                font-semibold text-white transition hover:bg-primaria-hover">
              Conhecer os médicos <AppIcon name="arrow-right" size={18} />
            </Link>
            <Link to="/especialidades" className="inline-flex items-center justify-center rounded-xl border 
              border-borda px-5 py-3.5 font-semibold text-texto transition hover:border-primaria/40 hover:bg-fundo">
              Ver especialidades
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Quem somos</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">
              Um espaço dedicado à saúde e ao acompanhamento dos pacientes
            </h2>
            <p className="mt-5 leading-7 text-texto-secundario">
              O Centro Médico Wenji Maka disponibiliza nesta plataforma um ponto de acesso digital para 
              consultar os profissionais e as especialidades registadas, bem como para gerir marcações 
              através de uma conta de paciente.
            </p>

          </div>
          <div className="rounded-3xl bg-primaria p-7 text-white sm:p-9">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <AppIcon name="clinic" size={28} />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-white/70">O nosso propósito</p>
            <h3 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">
              Tornar a procura de cuidados médicos mais clara e organizada.
            </h3>
            <p className="mt-4 leading-7 text-white/80">
              Uma experiência digital simples para descobrir profissionais e 
              acompanhar as suas consultas.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-borda bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">O que pode fazer</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">Serviços disponíveis na plataforma</h2>
            <p className="mt-4 leading-7 text-texto-secundario">
              Consulte os serviços digitais actualmente disponíveis. A oferta clínica específica deve ser confirmada directamente com o Centro.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {servicos.map((servico) => (
              <article key={servico.titulo} className="rounded-2xl border border-borda bg-fundo p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria/10 text-primaria">
                  <AppIcon name={servico.icon} size={23} />
                </span>
                <h3 className="mt-5 text-xl font-bold text-texto">{servico.titulo}</h3>
                <p className="mt-3 leading-7 text-texto-secundario">{servico.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Galeria</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">Um ambiente dedicado ao cuidado</h2>
            <p className="mt-4 leading-7 text-texto-secundario">
              Imagens ilustrativas de espaços e momentos de atendimento. Serão substituídas por fotografias oficiais do Centro quando estiverem disponíveis.
            </p>
          </div>
          <Link to="/medicos" className="inline-flex items-center gap-2 font-semibold text-primaria">
            Conhecer os médicos <AppIcon name="arrow-right" size={18} />
          </Link>
        </div>
        <div className="mt-8 grid auto-rows-[220px] gap-4 sm:grid-cols-2 md:grid-cols-3">
          {imagensCentro.map((imagem) => (
            <figure key={imagem.src} className={`group relative overflow-hidden rounded-2xl bg-fundo-terciario ${imagem.classe}`}>
              <img
                src={imagem.src}
                alt={imagem.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-5 pb-5 pt-14 text-lg font-semibold text-white">
                {imagem.titulo}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-borda bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">
              Os nossos princípios
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-texto sm:text-4xl">
              O que orienta esta experiência
            </h2>
            <p className="mt-4 leading-7 text-texto-secundario">
              Estes princípios descrevem a intenção da plataforma e poderão 
              ser ajustados à missão e aos valores oficiais do Centro.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {principios.map((item) => 
            <article key={item.titulo} 
              className="rounded-2xl border border-borda bg-fundo p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl 
                bg-primaria/10 text-primaria">
                <AppIcon name={item.icon} size={23} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-texto">{item.titulo}</h3>
              <p className="mt-3 leading-7 text-texto-secundario">{item.texto}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10"><div className="grid gap-5 md:grid-cols-3"><article className="rounded-2xl border border-borda bg-white p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="users" size={22} /></span><h3 className="mt-4 text-lg font-bold text-texto">Profissionais</h3><p className="mt-2 leading-6 text-texto-secundario">Consulte os perfis dos médicos activos e as informações profissionais disponíveis.</p><Link to="/medicos" className="mt-4 inline-flex items-center gap-2 font-semibold text-primaria">Ver médicos <AppIcon name="arrow-right" size={16} /></Link></article><article className="rounded-2xl border border-borda bg-white p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="activity" size={22} /></span><h3 className="mt-4 text-lg font-bold text-texto">Especialidades</h3><p className="mt-2 leading-6 text-texto-secundario">Explore as áreas médicas que se encontram registadas e activas na plataforma.</p><Link to="/especialidades" className="mt-4 inline-flex items-center gap-2 font-semibold text-primaria">Explorar áreas <AppIcon name="arrow-right" size={16} /></Link></article><article className="rounded-2xl border border-borda bg-white p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="calendar" size={22} /></span><h3 className="mt-4 text-lg font-bold text-texto">Marcação online</h3><p className="mt-2 leading-6 text-texto-secundario">Crie uma conta para solicitar e acompanhar as suas marcações através da plataforma.</p><Link to="/registro" className="mt-4 inline-flex items-center gap-2 font-semibold text-primaria">Criar conta <AppIcon name="arrow-right" size={16} /></Link></article></div></section>
      <section className="px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10"><div className="mx-auto max-w-7xl rounded-3xl bg-fundo-secundario px-6 py-10 text-white sm:px-10 sm:py-12"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-white/60">Em actualização</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Esta página será enriquecida com a informação oficial do Centro.</h2><p className="mt-4 leading-7 text-white/70">Os dados institucionais, contactos, localização, horário e descrição dos serviços serão acrescentados quando forem disponibilizados, evitando publicar informação não confirmada.</p></div></div></section>
    </main>
  </>
}
export default SobreNos
