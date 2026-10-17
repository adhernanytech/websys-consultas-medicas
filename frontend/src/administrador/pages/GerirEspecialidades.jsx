
import { useEffect, useState } from "react"

import {
  obterEspecialidades,
  criarEspecialidade,
  actualizarEspecialidade,
  actualizarEstadoEspecialidade,
} from "../../data/especialidades"

const formularioInicial = {
  nome: "",
  descricao: "",
}

function GerirEspecialidades() {
  const [especialidades, setEspecialidades] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  function recarregar() {
    setEspecialidades(obterEspecialidades())
  }

  useEffect(() => {
    recarregar()
  }, [])

  function limparMensagens() {
    setMensagem("")
    setErro("")
  }

  function submeter(event) {
    event.preventDefault()
    limparMensagens()

    try {
      if (editandoId !== null) {
        actualizarEspecialidade(editandoId, formulario)
        setMensagem("Especialidade actualizada com sucesso.")
      } else {
        criarEspecialidade(formulario)
        setMensagem("Especialidade criada com sucesso.")
      }

      setFormulario(formularioInicial)
      setEditandoId(null)
      recarregar()
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível guardar a especialidade."
      )
    }
  }

  function editar(especialidade) {
    limparMensagens()
    setEditandoId(especialidade.id)
    setFormulario({
      nome: especialidade.nome,
      descricao: especialidade.descricao || "",
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setFormulario(formularioInicial)
    limparMensagens()
  }

  function alterarEstado(especialidade) {
    limparMensagens()

    try {
      actualizarEstadoEspecialidade(
        especialidade.id,
        especialidade.ativo === false
      )

      setMensagem(
        especialidade.ativo === false
          ? "Especialidade activada."
          : "Especialidade desactivada."
      )

      recarregar()
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível alterar o estado."
      )
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primaria">
          Administração
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Gestão de especialidades
        </h1>

        <p className="mt-2 text-gray-600">
          Registe as especialidades que poderão ser atribuídas
          aos médicos da clínica.
        </p>
      </div>

      {mensagem && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {erro}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            {editandoId !== null
              ? "Editar especialidade"
              : "Nova especialidade"}
          </h2>

          <form onSubmit={submeter} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="nome-especialidade"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nome
              </label>

              <input
                id="nome-especialidade"
                value={formulario.nome}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    nome: event.target.value,
                  }))
                }
                minLength={2}
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                placeholder="Ex.: Cardiologia"
              />
            </div>

            <div>
              <label
                htmlFor="descricao-especialidade"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Descrição (opcional)
              </label>

              <textarea
                id="descricao-especialidade"
                value={formulario.descricao}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    descricao: event.target.value,
                  }))
                }
                maxLength={500}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                placeholder="Descreva brevemente a especialidade..."
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {editandoId !== null
                  ? "Guardar alterações"
                  : "Criar especialidade"}
              </button>

              {editandoId !== null && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Especialidades registadas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {especialidades.length} especialidade(s)
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {especialidades.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">
                Ainda não existem especialidades.
              </p>
            ) : (
              especialidades.map((especialidade) => (
                <div
                  key={especialidade.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {especialidade.nome}
                    </p>

                    {especialidade.descricao && (
                      <p className="mt-1 text-sm text-gray-600">
                        {especialidade.descricao}
                      </p>
                    )}

                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        especialidade.ativo === false
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {especialidade.ativo === false
                        ? "Desactivada"
                        : "Activa"}
                    </span>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editar(especialidade)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => alterarEstado(especialidade)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        especialidade.ativo === false
                          ? "border-green-200 text-green-700 hover:bg-green-50"
                          : "border-red-200 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {especialidade.ativo === false
                        ? "Activar"
                        : "Desactivar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default GerirEspecialidades