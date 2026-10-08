import { Link, useNavigate } from "react-router-dom"

import ResumoCard from "../../components/paciente/ResumoCard"
import ProximaConsulta from "../../components/paciente/ProximaConsulta"
import AcoesRapidas from "../../components/paciente/AcoesRapidas"

import {
  obterUsuarioAutenticado
} from "../../data/usuarios"

function PacienteDashboard() {

  const navegar = useNavigate()

  const usuario =
    obterUsuarioAutenticado()

  if (!usuario) {
    navegar("/login")
    return null
  }

  if (usuario.tipo !== "paciente" && usuario.role !== "paciente") {
    navegar("/")
    return null
  }

  if (usuario.ativo === false) {
    navegar("/login")
    return null
  }

  const consultasGuardadas =
    JSON.parse(
      localStorage.getItem("consultas")
    ) || []

  const consultasDoPaciente =
    consultasGuardadas.filter(
      (consulta) =>
        consulta.pacienteId === usuario.id
    )

  const consultasAtivas =
    consultasDoPaciente.filter(
      (consulta) =>
        consulta.estado === "Agendada" ||
        consulta.estado === "Confirmada"
    )

  const consultasRealizadas =
    consultasDoPaciente.filter(
      (consulta) =>
        consulta.estado === "Concluída"
    )

  const consultasCanceladas =
    consultasDoPaciente.filter(
      (consulta) =>
        consulta.estado === "Cancelada"
    )

  const proximaConsulta =
    consultasAtivas.length > 0
      ? [...consultasAtivas].sort((a, b) => {
          const dataA =
            new Date(
              `${a.data}T${a.horario}`
            )

          const dataB =
            new Date(
              `${b.data}T${b.horario}`
            )

          return dataA - dataB
        })[0]
      : null

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Cabeçalho */}

      <section className="bg-white border-b border-borda">

        <div className="max-w-7xl mx-auto px-6 py-8">

          <p className="text-sm text-texto-secundario">
            Área do paciente
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">

            {usuario.foto ? (

              <img
                src={usuario.foto}
                alt={`Fotografia de ${usuario.nome}`}
                className="
                  w-16
                  h-16
                  rounded-full
                  object-cover
                  border
                  border-borda
                "
              />

            ) : (

              <div
                className="
                  w-16
                  h-16
                  rounded-full
                  bg-primaria/10
                  flex
                  items-center
                  justify-center
                "
              >
                <span className="text-primaria font-bold text-xl">
                  {usuario.nome
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>

            )}

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-texto">
                Olá, {usuario.nome}
              </h1>

              <p className="text-texto-secundario mt-2">
                Aqui pode consultar e gerir as suas consultas médicas.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Resumo */}

      <section className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <ResumoCard
            titulo="Próximas consultas"
            valor={consultasAtivas.length}
            descricao="Consultas agendadas"
          />

          <ResumoCard
            titulo="Consultas realizadas"
            valor={consultasRealizadas.length}
            descricao="Total de consultas realizadas"
          />

          <ResumoCard
            titulo="Consultas canceladas"
            valor={consultasCanceladas.length}
            descricao="Consultas canceladas"
          />

        </div>

        {/* Próxima consulta + acções */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          <div className="lg:col-span-2">

            {proximaConsulta ? (

              <ProximaConsulta
                consulta={proximaConsulta}
              />

            ) : (

              <div className="bg-white border border-borda rounded-2xl shadow-sm p-6">

                <h2 className="text-xl font-bold text-texto">
                  Próxima consulta
                </h2>

                <p className="text-texto-secundario mt-2">
                  Não possui nenhuma consulta agendada de momento.
                </p>

                <Link
                  to="/paciente/medicos"
                  className="
                    inline-block
                    mt-5
                    bg-primaria
                    text-white
                    px-5
                    py-3
                    rounded-lg
                    font-medium
                    hover:bg-primaria-hover
                    transition
                  "
                >
                  Encontrar médico
                </Link>

              </div>

            )}

          </div>

          <div>
            <AcoesRapidas />
          </div>

        </div>

      </section>

    </main>
  )
}

export default PacienteDashboard