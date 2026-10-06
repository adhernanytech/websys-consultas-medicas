import { Link } from "react-router-dom"

import { obterMedicoAutenticado } from "../../data/medicos"
import { obterConsultasDoMedico } from "../../data/consultas"

function obterDataHoje() {
  const hoje = new Date()

  const ano = hoje.getFullYear()
  const mes = String(
    hoje.getMonth() + 1
  ).padStart(2, "0")
  const dia = String(
    hoje.getDate()
  ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function formatarData(data) {
  if (!data) {
    return "Data não disponível"
  }

  const partes = String(data).split("-")

  if (partes.length !== 3) {
    return data
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

function EstadoConsulta({ estado }) {
  const classes = {
    Agendada:
      "bg-blue-100 text-blue-700",
    Realizada:
      "bg-green-100 text-green-700",
    Cancelada:
      "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        classes[estado] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {estado}
    </span>
  )
}

function CartaoConsulta({ consulta }) {
  return (
    <Link
      to={`/medico/agenda/${consulta.id}`}
      className="block rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              {consulta.pacienteNome ||
                "Paciente"}
            </h3>

            <EstadoConsulta
              estado={consulta.estado}
            />
          </div>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <strong>Data:</strong>{" "}
              {formatarData(consulta.data)}
            </p>

            <p>
              <strong>Horário:</strong>{" "}
              {consulta.horario ||
                "Não informado"}
              {consulta.horaFim
                ? ` - ${consulta.horaFim}`
                : ""}
            </p>

            {consulta.pacienteEmail && (
              <p>
                <strong>Email:</strong>{" "}
                {consulta.pacienteEmail}
              </p>
            )}

            {consulta.motivo && (
              <p>
                <strong>Motivo:</strong>{" "}
                {consulta.motivo}
              </p>
            )}
          </div>
        </div>

        <span className="text-sm font-semibold text-primaria">
          Ver detalhes →
        </span>

      </div>
    </Link>
  )
}

function MinhaAgendaMedico() {
  const medico = obterMedicoAutenticado()

  if (!medico) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Médico não encontrado
          </h1>
        </div>
      </main>
    )
  }

  const consultas =
    obterConsultasDoMedico(medico.id)

  const hoje = obterDataHoje()

  /*
   * Consultas de hoje.
   */
  const consultasHoje = consultas
    .filter(
      (consulta) =>
        consulta.data === hoje &&
        consulta.estado !== "Cancelada"
    )
    .sort((a, b) =>
      String(a.horario || "").localeCompare(
        String(b.horario || "")
      )
    )

  /*
   * Consultas futuras.
   */
  const proximasConsultas = consultas
    .filter(
      (consulta) =>
        consulta.data > hoje &&
        consulta.estado === "Agendada"
    )
    .sort((a, b) =>
      `${a.data} ${a.horario}`.localeCompare(
        `${b.data} ${b.horario}`
      )
    )

  /*
   * Consultas anteriores:
   *
   * - Realizadas
   * - Canceladas
   * - Agendadas cuja data já passou
   *
   * Assim nenhuma consulta fica "perdida".
   */
  const historico = consultas
    .filter((consulta) => {
      if (consulta.data < hoje) {
        return true
      }

      return (
        consulta.estado === "Realizada" ||
        consulta.estado === "Cancelada"
      )
    })
    .sort((a, b) =>
      `${b.data} ${b.horario}`.localeCompare(
        `${a.data} ${a.horario}`
      )
    )

  const totalAgendadas = consultas.filter(
    (consulta) =>
      consulta.estado === "Agendada"
  ).length

  const totalRealizadas = consultas.filter(
    (consulta) =>
      consulta.estado === "Realizada"
  ).length

  const totalCanceladas = consultas.filter(
    (consulta) =>
      consulta.estado === "Cancelada"
  ).length

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            to="/medico/dashboard"
            className="text-sm font-medium text-primaria hover:underline"
          >
            ← Voltar ao dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Minha agenda
          </h1>

          <p className="mt-2 text-gray-600">
            Consulte e acompanhe as suas consultas.
          </p>
        </div>

        {/* Estatísticas */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Hoje
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {consultasHoje.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Agendadas
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalAgendadas}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Realizadas
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {totalRealizadas}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Canceladas
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {totalCanceladas}
            </p>
          </div>

        </section>

        {/* Hoje */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Consultas de hoje
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Atendimentos previstos para hoje.
            </p>
          </div>

          {consultasHoje.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                Não existem consultas para hoje.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultasHoje.map(
                (consulta) => (
                  <CartaoConsulta
                    key={consulta.id}
                    consulta={consulta}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* Próximas */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Próximas consultas
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Consultas agendadas para os próximos dias.
            </p>
          </div>

          {proximasConsultas.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                Não existem próximas consultas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proximasConsultas.map(
                (consulta) => (
                  <CartaoConsulta
                    key={consulta.id}
                    consulta={consulta}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* Histórico */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Histórico
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Consultas anteriores e atendimentos já encerrados.
            </p>
          </div>

          {historico.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                Ainda não existem consultas no histórico.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map(
                (consulta) => (
                  <CartaoConsulta
                    key={consulta.id}
                    consulta={consulta}
                  />
                )
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

export default MinhaAgendaMedico