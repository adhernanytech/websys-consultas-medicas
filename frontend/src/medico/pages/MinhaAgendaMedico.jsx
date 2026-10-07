import { useState } from "react"
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

    Confirmada:
      "bg-indigo-100 text-indigo-700",

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
      {estado || "Sem estado"}
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
  const [pesquisa, setPesquisa] = useState("")
  const [dataFiltro, setDataFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("todos")
  const medico =
    obterMedicoAutenticado()

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
    obterConsultasDoMedico(
      medico.id
    )

  const hoje = obterDataHoje()
  const consultasFiltradas = consultas.filter((consulta) => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt")
    const correspondePesquisa =
      !termo ||
      [consulta.pacienteNome, consulta.pacienteEmail, consulta.motivo]
        .filter(Boolean)
        .some((valor) =>
          String(valor).toLocaleLowerCase("pt").includes(termo)
        )

    return (
      correspondePesquisa &&
      (!dataFiltro || consulta.data === dataFiltro) &&
      (estadoFiltro === "todos" || consulta.estado === estadoFiltro)
    )
  })

  /*
   * Consultas de hoje:
   *
   * Incluímos:
   * - Agendadas
   * - Confirmadas
   * - Realizadas
   *
   * Não mostramos canceladas.
   */
  const consultasHoje =
    consultasFiltradas
      .filter(
        (consulta) =>
          consulta.data === hoje &&
          consulta.estado !==
            "Cancelada"
      )
      .sort((a, b) =>
        String(
          a.horario || ""
        ).localeCompare(
          String(
            b.horario || ""
          )
        )
      )

  /*
   * Próximas consultas:
   *
   * Somente consultas futuras.
   */
  const proximasConsultas =
    consultasFiltradas
      .filter(
        (consulta) =>
          consulta.data > hoje &&
          (
            consulta.estado ===
              "Agendada" ||
            consulta.estado ===
              "Confirmada"
          )
      )
      .sort((a, b) =>
        `${a.data} ${a.horario}`
          .localeCompare(
            `${b.data} ${b.horario}`
          )
      )

  /*
   * Histórico:
   *
   * - consultas realizadas
   * - consultas canceladas
   * - consultas antigas cuja data passou
   *
   * Uma consulta de hoje permanece
   * na secção "Hoje".
   */
  const historico =
    consultasFiltradas
      .filter((consulta) => {
        return consulta.data < hoje ||
          consulta.estado === "Cancelada" ||
          (
            consulta.data !== hoje &&
            (
              consulta.estado === "Realizada" ||
              consulta.estado === "Concluída" ||
              consulta.estado === "Cancelada"
            )
          )
      })
      .sort((a, b) =>
        `${b.data} ${b.horario}`
          .localeCompare(
            `${a.data} ${a.horario}`
          )
      )

  const totalAgendadas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Agendada"
    ).length

  const totalConfirmadas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Confirmada"
    ).length

  const totalRealizadas =
    consultas.filter(
      (consulta) =>
        consulta.estado === "Realizada" ||
        consulta.estado === "Concluída"
    ).length

  const totalCanceladas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Cancelada"
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
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

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
              Confirmadas
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {totalConfirmadas}
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

        <section
          aria-label="Filtros da agenda"
          className="mb-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label
              htmlFor="pesquisa-agenda-medico"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Paciente ou motivo
            </label>
            <input
              id="pesquisa-agenda-medico"
              type="search"
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
              placeholder="Pesquisar na agenda"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>
          <div>
            <label
              htmlFor="data-agenda-medico"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Dia
            </label>
            <input
              id="data-agenda-medico"
              type="date"
              value={dataFiltro}
              onChange={(event) => setDataFiltro(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>
          <div>
            <label
              htmlFor="estado-agenda-medico"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Estado da consulta
            </label>
            <select
              id="estado-agenda-medico"
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="todos">Todos os estados</option>
              <option value="Agendada">Agendada</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Realizada">Realizada</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          {(pesquisa || dataFiltro || estadoFiltro !== "todos") && (
            <button
              type="button"
              onClick={() => {
                setPesquisa("")
                setDataFiltro("")
                setEstadoFiltro("todos")
              }}
              className="text-left text-sm font-semibold text-primaria hover:underline sm:col-span-2 lg:col-span-3"
            >
              Limpar filtros
            </button>
          )}
        </section>
        <p className="mb-6 text-sm text-gray-500" aria-live="polite">
          A mostrar {consultasFiltradas.length} de {consultas.length} consulta(s).
        </p>

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
                Não existem próximas consultas com estes filtros.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                proximasConsultas.reduce((porData, consulta) => {
                  porData[consulta.data] ||= []
                  porData[consulta.data].push(consulta)
                  return porData
                }, {})
              ).map(([data, consultasDoDia]) => (
                <section key={data} aria-label={`Consultas de ${formatarData(data)}`}>
                  <h3 className="mb-3 rounded-lg bg-blue-50 px-4 py-2 font-semibold text-blue-900">
                    {new Date(`${data}T12:00:00`).toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    <span className="ml-2 text-sm font-normal">
                      ({consultasDoDia.length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {consultasDoDia.map((consulta) => (
                      <CartaoConsulta key={consulta.id} consulta={consulta} />
                    ))}
                  </div>
                </section>
              ))}
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