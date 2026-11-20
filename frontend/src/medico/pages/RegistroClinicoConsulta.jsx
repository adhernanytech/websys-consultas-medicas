import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { useAuth } from "../../context/AuthContext"
import { consultasAPI, medicosAPI } from "../../services/api"

function formatarData(data) {
  if (!data) return "Data não disponível"

  const partes = String(data).split("-")

  if (partes.length !== 3) {
    return data
  }

  const [ano, mes, dia] = partes

  return `${dia}/${mes}/${ano}`
}

function obterFormularioRegisto(consultaId, registo) {
  return {
    consultaId,
    queixa: registo?.queixa || "",
    observacoes: registo?.observacoes || "",
    diagnostico: registo?.diagnostico || "",
    tratamento: registo?.tratamento || "",
  }
}

function RegistroClinicoConsulta() {
  const { id } = useParams()

  const { usuario } = useAuth()
  const [medico, setMedico] = useState(null)
  const [consulta, setConsulta] = useState(null)
  const [registo, setRegisto] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [formulario, setFormulario] = useState(() =>
    obterFormularioRegisto(id, null)
  )

  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  const [aGuardar, setAGuardar] = useState(false)
  const consultaRealizada =
    consulta?.estado === "Realizada" ||
    consulta?.estado === "Concluída"

  useEffect(() => {
    let activo = true
    Promise.all([
      medicosAPI.obterMeu(),
      consultasAPI.obter(id),
      consultasAPI.obterRegistoClinico(id).catch((error) => {
        if (error.status === 404) return { data: { dados: null } }
        throw error
      }),
    ])
      .then(([medicoResponse, consultaResponse, registoResponse]) => {
        if (!activo) return
        setMedico(medicoResponse.data.dados)
        setConsulta(consultaResponse.data.dados)
        setRegisto(registoResponse.data.dados)
        setFormulario(obterFormularioRegisto(id, registoResponse.data.dados))
      })
      .catch((error) => { if (activo) setErro(error.message || "Não foi possível carregar os dados da consulta.") })
      .finally(() => { if (activo) setCarregando(false) })
    return () => { activo = false }
  }, [id])

  async function guardar() {
    setMensagem("")
    setErro("")

    if (!consulta || !medico) {
      setErro("Não foi possível localizar a consulta.")
      return
    }

    if (!consultaRealizada) {
      setErro(
        "O registo clínico só pode ser preenchido depois de a consulta ser marcada como realizada."
      )
      return
    }

    try {
      setAGuardar(true)

      const payload = {
        queixa_principal: formulario.queixa,
        observacoes: formulario.observacoes,
        diagnostico: formulario.diagnostico,
        tratamento: formulario.tratamento,
      }
      const { data } = registo
        ? await consultasAPI.actualizarRegistoClinico(consulta.id, payload)
        : await consultasAPI.criarRegistoClinico(consulta.id, payload)
      setRegisto(data.dados)

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

  if (carregando) {
    return <main className="min-h-[70vh] bg-gray-50 px-4 py-12 text-center text-gray-600">A carregar consulta e registo clínico...</main>
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

        {!consultaRealizada && (
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
                value={formulario.queixa}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    queixa: event.target.value,
                  }))
                }
                disabled={!consultaRealizada}
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
                value={formulario.observacoes}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    observacoes: event.target.value,
                  }))
                }
                disabled={!consultaRealizada}
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
                value={formulario.diagnostico}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    diagnostico: event.target.value,
                  }))
                }
                disabled={!consultaRealizada}
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
                value={formulario.tratamento}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    tratamento: event.target.value,
                  }))
                }
                disabled={!consultaRealizada}
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
                !consultaRealizada ||
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