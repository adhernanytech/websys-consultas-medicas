import { Link, useParams } from "react-router-dom"

import { obterUsuarioAutenticado, obterUsuarios } from "../../data/usuarios"
import { obterMedicoDaConta } from "../../data/medicos"
import { obterConsultasDoMedico } from "../../data/consultas"
import { obterRegistosClinicosDoMedicoEPaciente } from "../../data/registrosClinicos"

function formatarData(data) {
  if (!data) return "Data não disponível"

  const partes = String(data).split("-")

  if (partes.length !== 3) {
    return data
  }

  const [ano, mes, dia] = partes

  return `${dia}/${mes}/${ano}`
}

function obterClasseEstado(estado) {
  switch (estado) {
    case "Agendada":
      return "bg-blue-100 text-blue-700"

    case "Realizada":
    case "Concluída":
      return "bg-green-100 text-green-700"

    case "Confirmada":
      return "bg-indigo-100 text-indigo-700"

    case "Cancelada":
      return "bg-red-100 text-red-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

function PerfilPacienteMedico() {
  const { pacienteId } = useParams()

  const usuarioMedico = obterUsuarioAutenticado()

  const medico = usuarioMedico
    ? obterMedicoDaConta(usuarioMedico.id)
    : null

  if (!usuarioMedico || !medico) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Médico não encontrado
          </h1>

          <p className="mt-3 text-gray-600">
            Não foi possível identificar o médico autenticado.
          </p>
        </div>
      </main>
    )
  }

  /*
   * Obtemos apenas as consultas deste médico.
   */
  const consultasDoMedico = obterConsultasDoMedico(medico.id)

  /*
   * Procuramos as consultas deste médico com o paciente.
   */
  const consultasDoPaciente = consultasDoMedico.filter(
    (consulta) =>
      String(consulta.pacienteId) === String(pacienteId)
  )
  const registosClinicos = obterRegistosClinicosDoMedicoEPaciente(
    medico.id,
    pacienteId
  )

  /*
   * Segurança:
   * se este paciente nunca teve consulta com este médico,
   * o médico não pode consultar o perfil.
   */
  if (consultasDoPaciente.length === 0) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Paciente não encontrado
            </h1>

            <p className="mt-3 text-gray-600">
              Este paciente não possui consultas associadas ao seu
              perfil médico.
            </p>

            <Link
              to="/medico/agenda"
              className="mt-6 inline-block rounded-lg bg-primaria px-5 py-2.5 font-medium text-white hover:opacity-90"
            >
              Voltar à agenda
            </Link>

          </div>
        </div>
      </main>
    )
  }

  /*
   * Procuramos os dados do paciente na tabela de utilizadores.
   */
  const usuarios = obterUsuarios()

  const paciente = usuarios.find(
    (usuario) =>
      String(usuario.id) === String(pacienteId) &&
      (
        usuario.tipo === "paciente" ||
        usuario.role === "paciente"
      )
  )

  /*
   * Mantemos alguns dados da própria consulta como fallback.
   */
  const primeiraConsulta = consultasDoPaciente[0]

  const nomePaciente =
    paciente?.nome ||
    primeiraConsulta?.pacienteNome ||
    "Paciente"

  const emailPaciente =
    paciente?.email ||
    primeiraConsulta?.pacienteEmail ||
    "Não informado"

  const telefonePaciente =
    paciente?.telefone ||
    "Não informado"

  const fotografia =
    paciente?.foto ||
    paciente?.fotografia ||
    paciente?.imagem ||
    null

  /*
   * Histórico mais recente primeiro.
   */
  const historico = [...consultasDoPaciente].sort((a, b) => {
    const dataA = `${a.data || ""} ${a.horario || ""}`
    const dataB = `${b.data || ""} ${b.horario || ""}`

    return dataB.localeCompare(dataA)
  })

  const totalConsultas = historico.length

  const consultasRealizadas = historico.filter(
    (consulta) =>
      consulta.estado === "Realizada" ||
      consulta.estado === "Concluída"
  ).length

  const consultasAgendadas = historico.filter(
    (consulta) => consulta.estado === "Agendada"
  ).length

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            to="/medico/agenda"
            className="text-sm font-medium text-primaria hover:underline"
          >
            ← Voltar à agenda
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Perfil do paciente
          </h1>

          <p className="mt-2 text-gray-600">
            Informação do paciente e histórico das consultas consigo.
          </p>
        </div>

        {/* Perfil */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="bg-primaria px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">

              {fotografia ? (
                <img
                  src={fotografia}
                  alt={`Fotografia de ${nomePaciente}`}
                  className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-white/30"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-4xl font-bold text-primaria shadow-lg">
                  {nomePaciente.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="text-center text-white sm:text-left">
                <h2 className="text-2xl font-bold">
                  {nomePaciente}
                </h2>

                <p className="mt-1 text-white/80">
                  Paciente
                </p>
              </div>

            </div>
          </div>

          {/* Dados */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Nome completo
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {nomePaciente}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Email
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {emailPaciente}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Telefone
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {telefonePaciente}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                ID do paciente
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {pacienteId}
              </p>
            </div>

          </div>
        </section>

        {/* Estatísticas */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total de consultas
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalConsultas}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Realizadas
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {consultasRealizadas}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Agendadas
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {consultasAgendadas}
            </p>
          </div>

        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Histórico clínico
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Registos de consultas realizadas consigo, do mais recente para o mais antigo.
            </p>
          </div>

          {registosClinicos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              Ainda não existem registos clínicos para este paciente.
            </div>
          ) : (
            <ol className="space-y-4">
              {registosClinicos.map((registo) => {
                const consulta = historico.find(
                  (item) =>
                    String(item.id) === String(registo.consultaId)
                )

                return (
                  <li
                    key={registo.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Consulta de {formatarData(consulta?.data)}
                          {consulta?.horario
                            ? ` · ${consulta.horario}`
                            : ""}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Actualizado:{" "}
                          {registo.atualizadoEm
                            ? new Date(registo.atualizadoEm).toLocaleString("pt-PT")
                            : "Data não disponível"}
                        </p>
                      </div>
                      <Link
                        to={`/medico/agenda/${registo.consultaId}/registo-clinico`}
                        className="text-sm font-semibold text-primaria hover:underline"
                      >
                        Consultar / editar registo
                      </Link>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      {[
                        ["Queixa / motivo clínico", registo.queixa],
                        ["Observações clínicas", registo.observacoes],
                        ["Diagnóstico", registo.diagnostico],
                        ["Tratamento / prescrição", registo.tratamento],
                      ].map(([titulo, conteudo]) => (
                        <div key={titulo}>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {titulo}
                          </dt>
                          <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-800">
                            {conteudo || "Não registado"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        {/* Histórico */}
        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Histórico de consultas
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Consultas deste paciente com o seu perfil médico.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

            {historico.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Não existem consultas no histórico.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">

                {historico.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="p-5 transition hover:bg-gray-50 sm:p-6"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="font-semibold text-gray-900">
                            {formatarData(consulta.data)}
                          </h3>

                          <span className="font-medium text-gray-700">
                            {consulta.horario || "Horário não informado"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${obterClasseEstado(
                              consulta.estado
                            )}`}
                          >
                            {consulta.estado}
                          </span>

                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          Especialidade:{" "}
                          <span className="font-medium text-gray-800">
                            {consulta.especialidade ||
                              medico.especialidade ||
                              "Não informada"}
                          </span>
                        </p>

                        {consulta.motivo && (
                          <p className="mt-1 text-sm text-gray-600">
                            Motivo:{" "}
                            <span className="text-gray-800">
                              {consulta.motivo}
                            </span>
                          </p>
                        )}
                      </div>

                      <Link
                        to={`/medico/agenda/${consulta.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        Ver consulta
                      </Link>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  )
}

export default PerfilPacienteMedico