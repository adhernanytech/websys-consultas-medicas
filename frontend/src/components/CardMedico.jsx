import { useLocation, useNavigate } from "react-router-dom"
import AppIcon from "./ui/AppIcon"

function DoctorCard({ id, nome, especialidade, experiencia, foto }) {
  const navegar = useNavigate()
  const location = useLocation()
  const estaNaAreaPaciente = location.pathname.startsWith("/paciente")

  function verPerfil() {
    navegar(estaNaAreaPaciente ? `/paciente/medicos/${id}` : `/medicos/${id}`)
  }

  function marcarConsulta() {
    if (estaNaAreaPaciente) navegar(`/paciente/marcar-consulta/${id}`)
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-borda bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primaria/30 hover:shadow-lg">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-primaria/10 via-fundo to-secundaria/10">
        {foto ? <img src={foto} alt={`Fotografia de ${nome}`} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]" loading="lazy" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primaria/10 text-3xl font-bold text-primaria shadow-sm">{String(nome || "M").trim().slice(0, 1).toUpperCase()}</div>}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-texto shadow-sm"><AppIcon name="stethoscope" size={14} /> Profissional de saúde</span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-texto">{nome}</h3>
        <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primaria/5 px-3 py-1.5 text-sm font-semibold text-primaria"><AppIcon name="activity" size={15} /> {especialidade || "Especialidade não indicada"}</p>
        {experiencia && <p className="mt-3 text-sm leading-6 text-texto-secundario">{experiencia}</p>}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={verPerfil} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-borda px-4 py-2.5 font-semibold text-texto transition hover:border-primaria/40 hover:bg-fundo">Ver perfil <AppIcon name="arrow-right" size={16} /></button>
          {estaNaAreaPaciente && <button type="button" onClick={marcarConsulta} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primaria px-4 py-2.5 font-semibold text-white transition hover:bg-primaria-hover">Marcar consulta <AppIcon name="calendar" size={16} /></button>}
        </div>
      </div>
    </article>
  )
}
export default DoctorCard
