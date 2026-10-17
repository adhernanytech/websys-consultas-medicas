import { useState } from "react"
import {
  Link,
  useParams,
} from "react-router-dom"

import {
  obterMedicoAutenticado,
} from "../../data/medicos"

import {
  obterConsultasDoMedico,
  confirmarConsultaPeloMedico,
  marcarConsultaComoRealizada,
  cancelarConsultaPeloMedico,
} from "../../data/consultas"

function formatarData(data) {
  if (!data) {
    return "Data não definida"
  }

  const partes =
    String(data).split("-")

  if (partes.length !== 3) {
    return data
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

function EstadoConsulta({ estado }) {
  const estilos = {
    Agendada:
      "bg-blue-50 text-blue-700",

    Confirmada:
      "bg-indigo-50 text-indigo-700",

    Realizada:
      "bg-green-50 text-green-700",

    Cancelada:
      "bg-red-50 text-red-700",
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[estado] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {estado || "Sem estado"}
    </span>
  )
}

function consultaJaComecou(consulta) {
  if (
    !consulta?.data ||
    !consulta?.horario
  ) {
    return false
  }

  const partesData =
    String(consulta.data).split("-")

  const partesHora =
    String(consulta.horario).split(":")

  if (
    partesData.length !== 3 ||
    partesHora.length < 2
  ) {
    return false
  }

  const ano =
    Number(partesData[0])

  const mes =
    Number(partesData[1]) - 1

  const dia =
    Number(partesData[2])

  const hora =
    Number(partesHora[0])

  const minuto =
    Number(partesHora[1])

  if (
    !Number.isInteger(ano) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia) ||
    !Number.isInteger(hora) ||
    !Number.isInteger(minuto)
  ) {
    return false
  }

  const dataHora =
    new Date(
      ano,
      mes,
      dia,
      hora,
      minuto,
      0,
      0
    )

  if (
    Number.isNaN(
      dataHora.getTime()
    )
  ) {
    return false
  }

  return (
    dataHora.getTime() <=
    Date.now()
  )
}

export default function DetalhesConsultaMedico() {
  const { id } = useParams()

  const medico =
    obterMedicoAutenticado()

  const [mensagem, setMensagem] =
    useState("")

  const [erro, setErro] =
    useState("")

  const [consultaAtualizada, setConsultaAtualizada] =
    useState(null)

  /*
   * Se não existir médico autenticado,
   * mostramos uma mensagem em vez de
   * devolver uma página completamente vazia.
   */
  if (!medico) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Médico não autenticado
          </h1>

          <p className="mt-2 text-gray-600">
            Não foi possível identificar o médico autenticado.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-primaria px-5 py-3 font-semibold text-white"
          >
            Ir para o login
          </Link>

        </div>
      </main>
    )
  }

  /*
   * Buscamos as consultas deste médico.
   *
   * Mantemos este método porque é o mesmo
   * que já está a funcionar na MinhaAgendaMedico.
   */
  const consultas =
    obterConsultasDoMedico(
      medico.id
    ) || []

  /*
   * Procuramos a consulta pelo ID
   * recebido na URL.
   */
  const consultaEncontrada =
    consultas.find(
      (item) =>
        String(item.id) ===
        String(id)
    ) || null

  /*
   * Depois de uma ação, usamos o objeto
   * atualizado imediatamente.
   */
  const consulta =
    consultaAtualizada ||
    consultaEncontrada

  function executarAcao(acao) {
    setMensagem("")
    setErro("")

    if (!consulta) {
      return
    }

    const confirmar =
      window.confirm(
        acao === "realizada"
          ? "Confirmar que esta consulta foi realizada?"
          : acao === "confirmada"
            ? "Confirmar esta consulta?"
            : "Tem a certeza de que deseja cancelar esta consulta?"
      )

    if (!confirmar) {
      return
    }

    try {
      if (acao === "confirmada") {
        const atualizada =
          confirmarConsultaPeloMedico(
            consulta.id,
            medico.id
          )

        setConsultaAtualizada(atualizada)
        setMensagem("Consulta confirmada com sucesso.")
        return
      }

      if (
        acao === "realizada"
      ) {
        const atualizada =
          marcarConsultaComoRealizada(
            consulta.id,
            medico.id
          )

        setConsultaAtualizada(
          atualizada
        )

        setMensagem(
          "Consulta marcada como realizada com sucesso."
        )

        return
      }

      const atualizada =
        cancelarConsultaPeloMedico(
          consulta.id,
          medico.id
        )

      setConsultaAtualizada(
        atualizada
      )

      setMensagem(
        "Consulta cancelada com sucesso."
      )
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível actualizar a consulta."
      )
    }
  }

  /*
   * Consulta inexistente ou que não pertence
   * ao médico autenticado.
   */
  if (!consulta) {
    return (
      <main className="min-h-[70vh] bg-gray-50/70">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

          <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

            <h1 className="text-2xl font-bold text-texto">
              Consulta não encontrada
            </h1>

            <p className="mt-2 text-texto-secundario">
              A consulta não existe ou não pertence à sua agenda.
            </p>

            <p className="mt-2 text-xs text-gray-400">
              ID consultado: {id}
            </p>

            <Link
              to="/medico/agenda"
              className="mt-6 inline-flex rounded-xl bg-primaria px-5 py-3 font-semibold text-white hover:bg-primaria-hover"
            >
              Voltar à agenda
            </Link>

          </section>

        </div>
      </main>
    )
  }

  const podeCancelar =
    consulta.estado ===
      "Agendada" ||
    consulta.estado ===
      "Confirmada"

  const podeConfirmar =
    consulta.estado === "Agendada"

  const podeMarcarRealizada =
    (
      consulta.estado ===
        "Agendada" ||
      consulta.estado ===
        "Confirmada"
    ) &&
    consultaJaComecou(
      consulta
    )

  return (
    <main className="min-h-[70vh] bg-gray-50/70">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <Link
          to="/medico/agenda"
          className="text-sm font-semibold text-primaria hover:underline"
        >
          ← Voltar à agenda
        </Link>

        <header className="mt-5 mb-6">

          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Consulta
          </span>

          <h1 className="mt-3 text-3xl font-bold text-texto">
            Detalhes da consulta
          </h1>

        </header>

        {mensagem && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {erro}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-bold text-texto">
                {consulta.pacienteNome ||
                  "Paciente"}
              </h2>

              <p className="mt-1 text-sm text-texto-secundario">
                {consulta.pacienteEmail ||
                  "E-mail não disponível"}
              </p>

            </div>

            <EstadoConsulta
              estado={consulta.estado}
            />

          </div>

          {/* Informações */}
          <div className="grid gap-5 p-6 sm:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Data
              </p>

              <p className="mt-2 font-semibold text-texto">
                {formatarData(
                  consulta.data
                )}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Horário
              </p>

              <p className="mt-2 font-semibold text-texto">
                {consulta.horario ||
                  "--"}

                {consulta.horaFim
                  ? ` – ${consulta.horaFim}`
                  : ""}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-5 sm:col-span-2">

              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Motivo
              </p>

              <p className="mt-2 leading-7 text-texto">
                {consulta.motivo ||
                  "O paciente não indicou um motivo."}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Especialidade
              </p>

              <p className="mt-2 font-semibold text-texto">
                {consulta.especialidade ||
                  medico.especialidade ||
                  "Não definida"}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Consulta criada em
              </p>

              <p className="mt-2 font-semibold text-texto">
                {consulta.criadaEm
                  ? new Date(
                      consulta.criadaEm
                    ).toLocaleString(
                      "pt-PT"
                    )
                  : "Não disponível"}
              </p>

            </div>

          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 border-t border-gray-100 p-6 sm:flex-row">

            {consulta.pacienteId && (
              <Link
                to={`/medico/pacientes/${consulta.pacienteId}`}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-primaria px-5 py-2.5 font-medium text-white transition hover:opacity-90"
              >
                Ver perfil do paciente
              </Link>
            )}

            {(consulta.estado === "Realizada" ||
              consulta.estado === "Concluída") && (
              <Link
                to={`/medico/agenda/${consulta.id}/registo-clinico`}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-primaria bg-white px-5 py-2.5 font-semibold text-primaria transition hover:bg-gray-50"
              >
                Registo clínico
              </Link>
            )}

          </div>

          {/* Aviso antes da hora */}
          {(consulta.estado ===
            "Agendada" ||
            consulta.estado ===
              "Confirmada") &&
            !podeMarcarRealizada && (
              <div className="border-t border-gray-100 bg-blue-50 px-6 py-4">

                <p className="text-sm text-blue-800">
                  A consulta só poderá ser marcada como realizada depois de chegar o horário agendado.
                </p>

              </div>
            )}

          {/* Botões */}
          {(podeCancelar ||
            podeConfirmar ||
            podeMarcarRealizada) && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-6 sm:flex-row sm:justify-end">

              {podeConfirmar && (
                <button
                  type="button"
                  onClick={() =>
                    executarAcao("confirmada")
                  }
                  className="rounded-xl border border-primaria bg-white px-5 py-3 text-sm font-semibold text-primaria transition hover:bg-blue-50"
                >
                  Confirmar consulta
                </button>
              )}

              {podeCancelar && (
                <button
                  type="button"
                  onClick={() =>
                    executarAcao(
                      "cancelada"
                    )
                  }
                  className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Cancelar consulta
                </button>
              )}

              {podeMarcarRealizada && (
                <button
                  type="button"
                  onClick={() =>
                    executarAcao(
                      "realizada"
                    )
                  }
                  className="rounded-xl bg-primaria px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaria-hover"
                >
                  Marcar como realizada
                </button>
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  )
}