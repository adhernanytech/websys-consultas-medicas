import { useLocation, useNavigate } from "react-router-dom"

function DoctorCard({
  id,
  nome,
  especialidade,
  experiencia
}) {
  const navegar = useNavigate()
  const location = useLocation()

  const estaNaAreaPaciente =
    location.pathname.startsWith("/paciente")

  function verPerfil() {
    if (estaNaAreaPaciente) {
      navegar(`/paciente/medicos/${id}`)
      return
    }

    navegar(`/medicos/${id}`)
  }

  function marcarConsulta() {
    if (estaNaAreaPaciente) {
      navegar(`/paciente/marcar-consulta/${id}`)
      return
    }
  }

  return (
    <div className="bg-white border border-borda-1 rounded-xl p-5 shadow-md">

      <h3 className="text-xl font-bold text-gray-800">
        {nome}
      </h3>

      <p className="text-texto-secundario mt-2">
        {especialidade}
      </p>

      <p className="text-texto-secundario mt-2">
        {experiencia}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">

        <button
          type="button"
          onClick={verPerfil}
          className="flex-1 border border-borda-1 text-texto px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
        >
          Ver perfil
        </button>

        {estaNaAreaPaciente && (

          <button
            type="button"
            onClick={marcarConsulta}
            className="flex-1 bg-primaria text-white px-4 py-2 rounded-lg hover:bg-primaria-hover cursor-pointer transition"
          >
            Marcar consulta
          </button>
        )}

      </div>

    </div>
  )
}

export default DoctorCard