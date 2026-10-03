import { useParams, useNavigate } from "react-router-dom"

import medicos from "../data/medicos"


function PerfilMedico() {

  const { id } = useParams()

  const navegar = useNavigate()

  
  const medicoId = Number(id)

  const medico = medicos.find((item) => item.id === medicoId)

  function marcarConsulta() {
    navegar(`/marcar-consulta/${medico.id}`)
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
              Este espaço apresentará informações detalhadas
              sobre o médico/a, a sua experiência e os seus serviços.
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
            className="mt-4 mr-4 border border-gray-300 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Voltar
          </button>

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