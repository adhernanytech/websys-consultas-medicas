import { useParams, useNavigate } from "react-router-dom"
import { obterMedicoPorId } from "../data/medicos"
import {
  obterUsuarioAutenticado,
  usuarioIsPaciente,
} from "../data/usuarios"


function PerfilMedico() {

  const { id } = useParams()

  const navegar = useNavigate()
  const usuario = obterUsuarioAutenticado()

  const medico = obterMedicoPorId(id)

  function marcarConsulta() {
    const destino = `/paciente/marcar-consulta/${medico.id}`

    if (usuarioIsPaciente(usuario)) {
      navegar(destino)
      return
    }

    navegar("/login", {
      state: { from: { pathname: destino } },
    })
  }

  if (!medico) {
    return (
      <main className="min-h-screen bg-fundo px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-erro">
            Médico não encontrado
          </h1>

          <p className="mt-4 text-texto-secundario">
            O médico solicitado não existe no sistema
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-fundo px-6 py-12">
      <div className="max-w-4xl mx-auto">

        <div className="bg-fundo rounded-xl shadow-md p-8">
          {medico.foto && (
            <img
              src={medico.foto}
              alt={`Fotografia de ${medico.nome}`}
              className="mb-5 h-28 w-28 rounded-full object-cover"
            />
          )}
          <p className="text-texto-secundario mt-2">
            Código do médico: {medico.id}
          </p>

          <h1 className="text-3xl font-bold text-texto mt-3">
            {medico.nome}
          </h1>

          <p className="text-texto-secundario text-lg mt-3">
            {medico.especialidade}
          </p>

          <p className="text-texto-secundario mt-3">
            {medico.experiencia}
          </p>

          <div className="border-t border-borda mt-6 pt-6">
            <h2 className="text-xl font-semibold text-texto">
              Sobre o médico/a
            </h2>

            <p className="text-texto-secundario mt-2">
              {medico.biografia ||
                "Este médico ainda não adicionou uma biografia profissional."}
            </p>
          </div>

          <section className="mt-8 ">
            <h2 className="text-xl font-semibold text-texto">
              Disponibilidade
            </h2>

            <p className="text-texto-secundario mt-2">
              Consulte os horários disponíveis para marcar uma consulta
            </p>

          </section>

          <button 
            onClick={marcarConsulta}
            className="mt-6 bg-primaria text-white px-5 py-3 rounded-lg hover:bg-primaria-hover cursor-pointer"
          >
            Marcar consulta
          </button>

        </div>

      </div>

    </main>
  )
}

export default PerfilMedico