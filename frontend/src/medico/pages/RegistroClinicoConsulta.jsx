import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { obterUsuarioAutenticado } from "../../data/usuarios"
import { obterMedicoDaConta } from "../../data/medicos"
import { obterConsultasDoMedico } from "../../data/consultas"

import {
  obterRegistoClinicoPorConsulta,
  guardarRegistoClinico,
} from "../../data/registrosClinicos"

function formatarData(data) {
  if (!data) return "Data não disponível"

  const partes = String(data).split("-")

  if (partes.length !== 3) {
    return data
  }

  const [ano, mes, dia] = partes

  return `${dia}/${mes}/${ano}`
}

function RegistroClinicoConsulta() {
  const { id } = useParams()

  const usuario = obterUsuarioAutenticado()

  const medico = usuario
    ? obterMedicoDaConta(usuario.id)
    : null

  const [consulta, setConsulta] = useState(null)

  const [queixa, setQueixa] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [diagnostico, setDiagnostico] = useState("")
  const [tratamento, setTratamento] = useState("")

  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  const [aGuardar, setAGuardar] = useState(false)

  useEffect(() => {
    if (!medico) return

    const consultas = obterConsultasDoMedico(medico.id)

    const consultaEncontrada = consultas.find(
      (item) => String(item.id) === String(id)
    )

    setConsulta(consultaEncontrada || null)

    if (consultaEncontrada) {
      const registo = obterRegistoClinicoPorConsulta(
        consultaEncontrada.id
      )

      if (registo) {
        setQueixa(registo.queixa || "")
        setObservacoes(registo.observacoes || "")
        setDiagnostico(registo.diagnostico || "")
        setTratamento(registo.tratamento || "")
      }
    }
  }, [id, medico])

  function guardar() {
    setMensagem("")
    setErro("")

    if (!consulta || !medico) {
      setErro("Não foi possível localizar a consulta.")
      return
    }

    if (consulta.estado !== "Realizada") {
      setErro(
        "O registo clínico só pode ser preenchido depois de a consulta ser marcada como realizada."
      )
      return
    }

    try {
      setAGuardar(true)

      guardarRegistoClinico({
        consultaId: consulta.id,
        pacienteId: consulta.pacienteId,
        medicoId: medico.id,
        queixa,
        observacoes,
        diagnostico,
        tratamento,
      })

      setMensagem(
        "Registo clínico guardado com sucesso."
      )
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível guardar o registo clínico."
      )
    } finally {
      setAGuardar(false)
    }
  }

  if (!usuario || !medico) {
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

  if (!consulta) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Consulta não encontrada
          </h1>

          <Link
            to="/medico/agenda"
            className="mt-6 inline-block rounded-lg bg-primaria px-5 py-2.5 font-medium text-white"
          >
            Voltar à agenda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <Link
            to={`/medico/agenda/${consulta.id}`}
            className="text-sm font-medium text-primaria hover:underline"
          >
            ← Voltar aos detalhes da consulta
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Registo clínico
          </h1>

          <p className="mt-2 text-gray-600">
            Registo clínico referente ao atendimento do paciente.
          </p>
        </div>

        {/* Resumo da consulta */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Paciente
              </p>

              <h2 className="text-xl font-bold text-gray-900">
                {consulta.pacienteNome}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500">
                Data e horário
              </p>

              <p className="font-semibold text-gray-900">
                {formatarData(consulta.data)}
                {" · "}
                {consulta.horario}
              </p>
            </div>

          </div>
        </section>

        {consulta.estado !== "Realizada" && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Esta consulta ainda não está marcada como realizada.
            O registo clínico poderá ser preenchido depois do
            atendimento.
          </div>
        )}

        {/* Formulário */}
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <div className="space-y-6">

            <div>
              <label
                htmlFor="queixa"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Queixa / motivo clínico
              </label>

              <textarea
                id="queixa"
                value={queixa}
                onChange={(event) =>
                  setQueixa(event.target.value)
                }
                disabled={consulta.estado !== "Realizada"}
                rows={4}
                placeholder="Registe a queixa ou motivo clínico apresentado pelo paciente..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primaria focus:ring-2 focus:ring-primaria/20 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="observacoes"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Observações clínicas
              </label>

              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(event) =>
                  setObservacoes(event.target.value)
                }
                disabled={consulta.estado !== "Realizada"}
                rows={6}
                placeholder="Registe as observações relevantes do atendimento..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primaria focus:ring-2 focus:ring-primaria/20 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="diagnostico"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Diagnóstico
              </label>

              <textarea
                id="diagnostico"
                value={diagnostico}
                onChange={(event) =>
                  setDiagnostico(event.target.value)
                }
                disabled={consulta.estado !== "Realizada"}
                rows={5}
                placeholder="Registe o diagnóstico..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primaria focus:ring-2 focus:ring-primaria/20 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="tratamento"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Tratamento / prescrição
              </label>

              <textarea
                id="tratamento"
                value={tratamento}
                onChange={(event) =>
                  setTratamento(event.target.value)
                }
                disabled={consulta.estado !== "Realizada"}
                rows={6}
                placeholder="Registe o tratamento ou prescrição..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primaria focus:ring-2 focus:ring-primaria/20 disabled:bg-gray-100"
              />
            </div>

          </div>

          {mensagem && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {mensagem}
            </div>
          )}

          {erro && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={guardar}
              disabled={
                consulta.estado !== "Realizada" ||
                aGuardar
              }
              className="rounded-lg bg-primaria px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aGuardar
                ? "A guardar..."
                : "Guardar registo clínico"}
            </button>

            <Link
              to={`/medico/agenda/${consulta.id}`}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>

          </div>

        </section>
      </div>
    </main>
  )
}

export default RegistroClinicoConsulta