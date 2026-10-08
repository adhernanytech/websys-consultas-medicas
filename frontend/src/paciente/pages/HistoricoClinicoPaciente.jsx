import { useNavigate } from "react-router-dom"

import { obterUsuarioAutenticado } from "../../data/usuarios"
import {
  obterRegistosClinicosDoPaciente,
} from "../../data/registrosClinicos"
import { useStorageSync } from "../../hooks/useStorageSync"

export default function HistoricoClinicoPaciente() {
  const navegar = useNavigate()

  // Forçar re-render quando registos clínicos ou consultas mudam
  useStorageSync("registosClinicos")
  useStorageSync("consultas")

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

  const registosClinicosDoUtilizador =
    obterRegistosClinicosDoPaciente(usuario.id)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <section className="border-b border-borda bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm text-texto-secundario">
            Área do paciente / Histórico clínico
          </p>

          <h1 className="mt-3 text-3xl font-bold text-texto md:text-4xl">
            Histórico Clínico
          </h1>

          <p className="mt-2 text-texto-secundario">
            Todos os registos clínicos das suas consultas realizadas
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {registosClinicosDoUtilizador.length === 0 ? (
          <div className="rounded-2xl border border-borda bg-white p-6 shadow-sm">
            <p className="text-texto-secundario">
              Ainda não possui registos clínicos. Quando tiver consultas
              realizadas, os seus registos clínicos aparecerão aqui.
            </p>

            <button
              type="button"
              onClick={() => navegar("/paciente/minhas-consultas")}
              className="
                mt-4
                rounded-lg
                bg-primaria
                px-4
                py-2
                font-medium
                text-white
                transition
                hover:bg-primaria-hover
              "
            >
              Ver minhas consultas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registosClinicosDoUtilizador.map((registo) => (
              <div
                key={registo.id}
                className="rounded-2xl border border-borda bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-texto-secundario">
                      {new Date(registo.dataConsulta || registo.dataAtualizacao).toLocaleDateString(
                        "pt-PT",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-texto">
                      {registo.nomeMedico || "Médico"}
                    </h3>

                    {registo.especialidade && (
                      <p className="text-sm text-texto-secundario">
                        {registo.especialidade}
                      </p>
                    )}
                  </div>

                  {registo.diagnostico && (
                    <div className="rounded-lg bg-primaria/10 px-3 py-1">
                      <p className="text-sm font-medium text-primaria">
                        {registo.diagnostico}
                      </p>
                    </div>
                  )}
                </div>

                {/* Queixa */}
                {registo.queixa && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-texto">Queixa</h4>
                    <p className="mt-2 text-texto-secundario">
                      {registo.queixa}
                    </p>
                  </div>
                )}

                {/* Observações */}
                {registo.observacoes && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-texto">Observações</h4>
                    <p className="mt-2 text-texto-secundario">
                      {registo.observacoes}
                    </p>
                  </div>
                )}

                {/* Diagnóstico */}
                {registo.diagnostico && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-texto">Diagnóstico</h4>
                    <p className="mt-2 text-texto-secundario">
                      {registo.diagnostico}
                    </p>
                  </div>
                )}

                {/* Tratamento */}
                {registo.tratamento && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-texto">Tratamento</h4>
                    <p className="mt-2 whitespace-pre-line text-texto-secundario">
                      {registo.tratamento}
                    </p>
                  </div>
                )}

                {/* Data de atualização */}
                <p className="border-t border-borda pt-4 text-xs text-texto-secundario">
                  Registado em{" "}
                  {new Date(
                    registo.dataAtualizacao || registo.dataCriacao
                  ).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
