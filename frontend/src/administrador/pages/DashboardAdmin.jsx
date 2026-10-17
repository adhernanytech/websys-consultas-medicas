import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import {
  obterResumoAdministrativo,
  listarEstadoContasMedicas,
} from "../../data/administracao"

import { obterConsultas } from "../../data/consultas"

function formatarData(data) {
  if (!data) return "Data não disponível"

  const partes = String(data).split("-")

  if (partes.length !== 3) {
    return data
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

function CartaoEstatistica({
  titulo,
  valor,
  descricao,
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {valor}
      </p>

      {descricao && (
        <p className="mt-1 text-xs text-gray-500">
          {descricao}
        </p>
      )}
    </article>
  )
}

function DashboardAdmin() {
  const [resumo, setResumo] =
    useState(null)

  const [medicos, setMedicos] = useState([])

  const [erro, setErro] = useState("")

  function carregar() {
    try {
      setErro("")

      setResumo(
        obterResumoAdministrativo()
      )

      setMedicos(
        listarEstadoContasMedicas()
      )
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível carregar o dashboard."
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  if (!resumo && erro) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Erro no dashboard
          </h1>

          <p className="mt-3 text-red-700">
            {erro}
          </p>

          <button
            type="button"
            onClick={carregar}
            className="mt-6 rounded-lg bg-primaria px-5 py-2.5 font-semibold text-white"
          >
            Tentar novamente
          </button>

        </div>
      </main>
    )
  }

  if (!resumo) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 text-gray-600 shadow-sm">
          A carregar o dashboard...
        </div>
      </main>
    )
  }

  const consultas =
    obterConsultas()

  const proximasConsultas =
    [...consultas]
      .filter(
        (consulta) =>
          consulta.estado === "Agendada" ||
          consulta.estado === "Confirmada"
      )
      .sort((a, b) =>
        `${a.data} ${a.horario}`.localeCompare(
          `${b.data} ${b.horario}`
        )
      )
      .slice(0, 5)

  const medicosSemConta =
    medicos.filter(
      (medico) =>
        !medico.temConta
    )

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Área administrativa
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Visão geral do funcionamento do sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={carregar}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Actualizar dados
          </button>

        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <CartaoEstatistica
            titulo="Pacientes"
            valor={
              resumo.totalPacientes
            }
            descricao={`${resumo.pacientesActivos} activos`}
          />

          <CartaoEstatistica
            titulo="Médicos"
            valor={
              resumo.totalMedicos
            }
            descricao={`${resumo.medicosActivos} activos`}
          />

          <CartaoEstatistica
            titulo="Consultas"
            valor={
              resumo.totalConsultas
            }
            descricao={`${resumo.consultasActivas} activas`}
          />

          <CartaoEstatistica
            titulo="Consultas hoje"
            valor={
              resumo.consultasHoje
            }
            descricao="Não canceladas"
          />

        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <CartaoEstatistica
            titulo="Agendadas"
            valor={
              resumo.consultasAgendadas
            }
          />

          <CartaoEstatistica
            titulo="Confirmadas"
            valor={
              resumo.consultasConfirmadas
            }
          />

          <CartaoEstatistica
            titulo="Realizadas"
            valor={
              resumo.consultasRealizadas
            }
          />

          <CartaoEstatistica
            titulo="Canceladas"
            valor={
              resumo.consultasCanceladas
            }
          />

        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">

          <article className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between gap-3">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Próximas consultas
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Próximos atendimentos registados.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {resumo.consultasActivas} activas
              </span>

            </div>

            {proximasConsultas.length === 0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                Não existem próximas consultas.
              </div>

            ) : (

              <div className="mt-5 divide-y divide-gray-100">

                {proximasConsultas.map(
                  (consulta) => (
                    <div
                      key={consulta.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>

                        <p className="font-semibold text-gray-900">
                          {consulta.pacienteNome ||
                            "Paciente"}
                        </p>

                        <p className="text-sm text-gray-600">
                          {consulta.medicoNome ||
                            "Médico"}

                          {consulta.especialidade
                            ? ` · ${consulta.especialidade}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatarData(
                            consulta.data
                          )}
                          {" · "}
                          {consulta.horario ||
                            "Sem horário"}
                        </p>

                      </div>

                      <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {consulta.estado}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}

          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Contas médicas
            </h2>

            <div className="mt-5 space-y-3">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Perfis médicos
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {resumo.totalMedicos}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Com conta
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  {resumo.medicosComConta}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  Sem conta
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-900">
                  {resumo.medicosSemConta}
                </p>
              </div>

            </div>

            <Link
              to="/admin/contas-medicas"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaria-hover"
            >
              Gerir contas médicas
            </Link>

          </article>

        </section>

        {medicosSemConta.length > 0 && (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-amber-900">
                  Médicos sem conta
                </h2>

                <p className="mt-1 text-sm text-amber-800">
                  Existem{" "}
                  {medicosSemConta.length}{" "}
                  perfil(is) médico(s) sem conta.
                </p>
              </div>

              <Link
                to="/admin/contas-medicas"
                className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
              >
                Gerir agora
              </Link>

            </div>

          </section>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Link
            to="/admin/contas-medicas"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-gray-500">
              Gestão
            </p>

            <p className="mt-2 font-bold text-gray-900">
              Contas médicas
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Criar e associar contas.
            </p>
          </Link>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Disponibilidades
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumo.totalDisponibilidades}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {resumo.disponibilidadesLivres} disponíveis
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Registos clínicos
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumo.totalRegistosClinicos}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Administradores
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumo.totalAdministradores}
            </p>
          </div>

        </section>

      </div>
    </main>
  )
}

export default DashboardAdmin