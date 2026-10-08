import { useNavigate, useParams, Link } from "react-router-dom"

import { obterConsultaPorId, cancelarConsulta } from "../../data/consultas"
import { obterUsuarioAutenticado } from "../../data/usuarios"
import { obterRegistoClinicoPorConsulta } from "../../data/registrosClinicos"
import { useStorageSync } from "../../hooks/useStorageSync"

export default function DetalhesConsulta() {
  const { id } = useParams()
  const navegar = useNavigate()

  // Forçar re-render quando consultas ou registos mudam
  useStorageSync("consultas")
  useStorageSync("registosClinicos")

  const usuario = obterUsuarioAutenticado()

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

  const consulta = obterConsultaPorId(id)

  if (!consulta) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-texto">Consulta não encontrada</h1>
        <Link
          to="/paciente/minhas-consultas"
          className="mt-4 inline-block rounded-lg bg-primaria px-4 py-2 text-white"
        >
          Voltar a minhas consultas
        </Link>
      </main>
    )
  }

  if (String(consulta.pacienteId) !== String(usuario.id)) {
    navegar("/")
    return null
  }

  const registo = obterRegistoClinicoPorConsulta(id, consulta.medicoId)

  function tratarCancelamento() {
    const confirmar = window.confirm(
      "Tem a certeza de que pretende cancelar esta consulta?"
    )

    if (!confirmar) return

    try {
      cancelarConsulta(id, usuario.id)
      navegar("/paciente/minhas-consultas")
    } catch (erro) {
      alert("Erro ao cancelar consulta: " + erro.message)
    }
  }

  const podeCancelar =
    consulta.estado === "Agendada" ||
    consulta.estado === "Confirmada"

  const classeEstado = {
    Agendada: "bg-blue-50 border-blue-200 text-blue-800",
    Confirmada: "bg-green-50 border-green-200 text-green-800",
    Realizada: "bg-purple-50 border-purple-200 text-purple-800",
    Concluída: "bg-cyan-50 border-cyan-200 text-cyan-800",
    Cancelada: "bg-red-50 border-red-200 text-red-800",
  }[consulta.estado] || "bg-gray-50 border-gray-200 text-gray-800"

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <section className="border-b border-borda bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            to="/paciente/minhas-consultas"
            className="text-sm text-primaria hover:underline"
          >
            ← Voltar
          </Link>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-texto">Detalhes da Consulta</h1>
              <p className="mt-2 text-texto-secundario">
                Consulta com {consulta.medicoNome || "Médico"}
              </p>
            </div>

            <span
              className={`rounded-full border px-4 py-2 font-semibold ${classeEstado}`}
            >
              {consulta.estado}
            </span>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Informação principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados da consulta */}
            <div className="rounded-2xl border border-borda bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-texto">Informação da Consulta</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-texto-secundario">Data</p>
                  <p className="mt-1 text-lg text-texto">
                    {new Date(`${consulta.data}T12:00:00`).toLocaleDateString(
                      "pt-PT",
                      { weekday: "long", day: "numeric", month: "long", year: "numeric" }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-texto-secundario">Horário</p>
                  <p className="mt-1 text-lg text-texto">{consulta.horario}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-texto-secundario">Motivo</p>
                  <p className="mt-1 whitespace-pre-line text-texto">{consulta.motivo}</p>
                </div>
              </div>
            </div>

            {/* Registo clínico */}
            {(consulta.estado === "Realizada" || consulta.estado === "Concluída") && (
              <div className="rounded-2xl border border-borda bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-texto">Registo Clínico</h2>

                {registo ? (
                  <div className="mt-4 space-y-4">
                    {registo.queixa && (
                      <div>
                        <h3 className="font-semibold text-texto">Queixa</h3>
                        <p className="mt-1 text-texto-secundario">{registo.queixa}</p>
                      </div>
                    )}

                    {registo.observacoes && (
                      <div>
                        <h3 className="font-semibold text-texto">Observações</h3>
                        <p className="mt-1 text-texto-secundario">{registo.observacoes}</p>
                      </div>
                    )}

                    {registo.diagnostico && (
                      <div>
                        <h3 className="font-semibold text-texto">Diagnóstico</h3>
                        <p className="mt-1 text-texto-secundario">{registo.diagnostico}</p>
                      </div>
                    )}

                    {registo.tratamento && (
                      <div>
                        <h3 className="font-semibold text-texto">Tratamento</h3>
                        <p className="mt-1 whitespace-pre-line text-texto-secundario">
                          {registo.tratamento}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-texto-secundario">
                    O médico ainda não adicionou um registo clínico para esta consulta.
                  </p>
                )}
              </div>
            )}

            {consulta.estado === "Cancelada" && (
              <div className="rounded-2xl border-l-4 border-red-400 bg-red-50 p-6">
                <p className="text-red-700">Esta consulta foi cancelada.</p>
              </div>
            )}
          </div>

          {/* Sidebar com ações */}
          <div className="rounded-2xl border border-borda bg-white p-6 shadow-sm h-fit">
            <h3 className="font-bold text-texto">Ações</h3>

            <div className="mt-4 space-y-2">
              <Link
                to="/paciente/historico-clinico"
                className="block w-full rounded-lg bg-primaria/10 px-4 py-2 text-center font-medium text-primaria hover:bg-primaria/20 transition"
              >
                Ver histórico clínico
              </Link>

              {podeCancelar && (
                <button
                  type="button"
                  onClick={tratarCancelamento}
                  className="w-full rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 transition"
                >
                  Cancelar consulta
                </button>
              )}

              <Link
                to="/paciente/minhas-consultas"
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-center font-medium text-texto hover:bg-gray-200 transition"
              >
                Voltar a minhas consultas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
