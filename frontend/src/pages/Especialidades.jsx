import { Link } from "react-router-dom"
import { obterEspecialidades } from "../data/especialidades"
import AppIcon from "../components/ui/AppIcon"

function Especialidades() {
  const especialidades = obterEspecialidades().filter((item) => item.ativo !== false)
  const icones = ["activity", "stethoscope", "heart", "clipboard", "users", "shield"]
  return (
    <main className="min-h-screen bg-fundo">
      <section className="border-b border-borda bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primaria">Cuidados especializados</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-3xl"><h1 className="text-4xl font-bold tracking-tight text-texto sm:text-5xl">Explore as especialidades médicas</h1><p className="mt-5 text-lg leading-8 text-texto-secundario">Conheça as áreas de atendimento registadas na plataforma e encontre os profissionais associados à especialidade de que precisa.</p></div><div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-borda bg-fundo px-5 py-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria/10 text-primaria"><AppIcon name="activity" size={22} /></span><div><p className="text-2xl font-bold text-texto">{especialidades.length}</p><p className="text-sm text-texto-secundario">{especialidades.length === 1 ? "especialidade activa" : "especialidades activas"}</p></div></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-bold text-texto">Áreas disponíveis</h2><p className="mt-2 text-texto-secundario">Seleccione uma área para consultar os médicos associados.</p></div><Link to="/medicos" className="inline-flex items-center gap-2 font-semibold text-primaria hover:text-primaria-hover">Ver todos os médicos <AppIcon name="arrow-right" size={17} /></Link></div>
        {especialidades.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{especialidades.map((especialidade, indice) => <article key={especialidade.id ?? especialidade.nome} className="group flex flex-col rounded-2xl border border-borda bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primaria/30 hover:shadow-lg"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria/10 text-primaria transition group-hover:bg-primaria group-hover:text-white"><AppIcon name={icones[indice % icones.length]} size={23} /></span><h3 className="mt-5 text-xl font-bold text-texto">{especialidade.nome}</h3><p className="mt-3 flex-1 leading-7 text-texto-secundario">{especialidade.descricao || "Consulte os profissionais disponíveis nesta área médica."}</p><Link to={`/medicos?especialidade=${encodeURIComponent(especialidade.nome)}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primaria px-4 py-3 font-semibold text-white transition hover:bg-primaria-hover">Ver médicos <AppIcon name="arrow-right" size={17} /></Link></article>)}</div> : <div className="rounded-2xl border border-dashed border-borda bg-white px-6 py-14 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primaria/10 text-primaria"><AppIcon name="activity" size={26} /></span><h2 className="mt-4 text-xl font-bold text-texto">Ainda não há especialidades disponíveis</h2><p className="mx-auto mt-2 max-w-lg text-texto-secundario">Quando forem registadas especialidades activas, poderá consultá-las nesta página.</p></div>}
      </section>
      <section className="px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10"><div className="mx-auto max-w-7xl rounded-3xl border border-borda bg-white px-6 py-9 text-center sm:px-10"><h2 className="text-2xl font-bold text-texto">Procura um profissional específico?</h2><p className="mt-3 text-texto-secundario">Pesquise pelo nome do médico ou consulte a lista de profissionais disponíveis.</p><Link to="/medicos" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primaria px-6 py-3 font-semibold text-white transition hover:bg-primaria-hover">Pesquisar médicos <AppIcon name="search" size={17} /></Link></div></section>
    </main>
  )
}
export default Especialidades
