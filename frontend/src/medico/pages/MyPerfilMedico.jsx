import { useState } from "react"
import { Link } from "react-router-dom"
import { prepararImagem } from "../../utils/imagem"

import {
  obterUsuarioAutenticado,
} from "../../data/usuarios"

import {
  obterMedicoDaConta,
  actualizarPerfilMedico,
} from "../../data/medicos"

function PerfilMedico() {
  const [medicoActualizado, setMedicoActualizado] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [formulario, setFormulario] = useState({
    telefone: "",
    biografia: "",
    foto: "",
  })
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [processandoFoto, setProcessandoFoto] = useState(false)

  const usuario = obterUsuarioAutenticado()

  const medicoAssociado = usuario
    ? obterMedicoDaConta(usuario.id)
    : null
  const medico = medicoActualizado || medicoAssociado

  function iniciarEdicao() {
    setFormulario({
      telefone: medico.telefone || "",
      biografia: medico.biografia || "",
      foto: medico.foto || "",
    })
    setErro("")
    setSucesso("")
    setModoEdicao(true)
  }

  async function alterarFoto(event) {
    const ficheiro = event.target.files?.[0]
    if (!ficheiro) return

    if (!ficheiro.type.startsWith("image/")) {
      setErro("Seleccione um ficheiro de imagem válido.")
      event.target.value = ""
      return
    }

    if (ficheiro.size > 8 * 1024 * 1024) {
      setErro("A fotografia não pode ultrapassar 8 MB.")
      event.target.value = ""
      return
    }

    setErro("")
    setProcessandoFoto(true)

    try {
      const foto = await prepararImagem(ficheiro)
      setFormulario((actual) => ({ ...actual, foto }))
    } catch (error) {
      setErro(
        error.message || "Não foi possível processar a fotografia."
      )
    } finally {
      setProcessandoFoto(false)
      event.target.value = ""
    }
  }

  function guardarPerfil(event) {
    event.preventDefault()
    setErro("")
    setSucesso("")

    try {
      const actualizado = actualizarPerfilMedico(
        medico.id,
        usuario.id,
        formulario
      )
      setMedicoActualizado(actualizado)
      setModoEdicao(false)
      setSucesso("Perfil actualizado com sucesso.")
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível actualizar o perfil."
      )
    }
  }

  if (!usuario || !medico) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Perfil médico não encontrado
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              Não foi possível localizar o perfil médico associado à
              conta atualmente autenticada.
            </p>

            <Link
              to="/medico/dashboard"
              className="mt-6 inline-block rounded-lg bg-primaria px-5 py-2.5 font-medium text-white transition hover:opacity-90"
            >
              Voltar ao dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const inicialNome =
    medico.nome?.trim()?.charAt(0)?.toUpperCase() || "M";
  const especialidade =
    medico.especialidade || "Especialidade não definida"

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Cabeçalho */}
        <div className="mb-8">
          <Link
            to="/medico/dashboard"
            className="text-sm font-medium text-primaria hover:underline"
          >
            ← Voltar ao dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Meu perfil
          </h1>

          <p className="mt-2 text-gray-600">
            Edite os dados do seu perfil. Nome e especialidade são geridos pela administração; email e telefone são privados, enquanto biografia e fotografia aparecem no perfil público.
          </p>
        </div>

        {/* Cartão principal */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Cabeçalho do perfil */}
          <div className="bg-primaria px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">

              {medico.foto ? (
                <img
                  src={medico.foto}
                  alt={`Fotografia de ${medico.nome}`}
                  className="h-24 w-24 shrink-0 rounded-full bg-white object-cover shadow"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold text-primaria shadow">
                  {inicialNome}
                </div>
              )}

              <div className="text-center text-white sm:text-left">
                <h2 className="text-2xl font-bold">
                  {medico.nome}
                </h2>

                <p className="mt-1 text-white/80">
                  {especialidade}
                </p>
              </div>

            </div>
          </div>

          {sucesso && (
            <div
              role="status"
              className="mx-6 mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 sm:mx-8"
            >
              {sucesso}
            </div>
          )}

          {erro && (
            <div
              role="alert"
              className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:mx-8"
            >
              {erro}
            </div>
          )}

          {modoEdicao ? (
            <form
              onSubmit={guardarPerfil}
              className="space-y-6 p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-4">
                {formulario.foto ? (
                  <img
                    src={formulario.foto}
                    alt="Pré-visualização da fotografia do médico"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-primaria">
                    {inicialNome}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="fotografia-medico"
                    className="cursor-pointer font-medium text-primaria hover:underline"
                  >
                    {formulario.foto
                      ? "Alterar fotografia"
                      : "Adicionar fotografia"}
                    <input
                      id="fotografia-medico"
                      type="file"
                      accept="image/*"
                      onChange={alterarFoto}
                      disabled={processandoFoto}
                      className="sr-only"
                    />
                  </label>
                  {formulario.foto && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormulario((actual) => ({
                          ...actual,
                          foto: "",
                        }))
                      }
                      className="ml-4 text-sm text-red-700 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                  {processandoFoto && (
                    <p className="mt-1 text-xs text-gray-500" role="status">
                      A processar fotografia...
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    A fotografia é apresentada no perfil público.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="telefone-medico"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Telefone de contacto
                </label>
                <input
                  id="telefone-medico"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  value={formulario.telefone}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      telefone: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-primaria focus:outline-none focus:ring-2 focus:ring-primaria/20"
                />
              </div>

              <div>
                <label
                  htmlFor="biografia-medico"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Biografia profissional
                </label>
                <textarea
                  id="biografia-medico"
                  rows={6}
                  maxLength={1200}
                  value={formulario.biografia}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      biografia: event.target.value,
                    }))
                  }
                  aria-describedby="contador-biografia-medico"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-primaria focus:outline-none focus:ring-2 focus:ring-primaria/20"
                />
                <p
                  id="contador-biografia-medico"
                  className="mt-1 text-right text-xs text-gray-500"
                >
                  {formulario.biografia.length}/1200
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={processandoFoto}
                  className="rounded-lg bg-primaria px-5 py-2.5 font-medium text-white transition hover:opacity-90"
                >
                  Guardar alterações
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoEdicao(false)
                    setErro("")
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Dados */}
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Nome
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {medico.nome}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Especialidade
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {especialidade}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Email
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {medico.email || usuario.email || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Telefone
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {medico.telefone || "Não informado"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Biografia
                  </p>
                  <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">
                    {medico.biografia ||
                      "Este médico ainda não adicionou uma biografia."}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 px-6 py-5 sm:px-8">
                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="rounded-lg border border-primaria px-5 py-2.5 font-medium text-primaria transition hover:bg-blue-50"
                >
                  Editar perfil
                </button>
              </div>
            </>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">

            <Link
              to={`/medicos/${medico.id}`}
              className="rounded-lg border border-primaria bg-white px-5 py-2.5 font-medium text-primaria transition hover:bg-blue-50"
            >
              Ver perfil público
            </Link>

            <Link
              to="/medico/agenda"
              className="rounded-lg bg-primaria px-5 py-2.5 font-medium text-white transition hover:opacity-90"
            >
              Ver minha agenda
            </Link>

            <Link
              to="/medico/disponibilidades"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Gerir disponibilidades
            </Link>

          </div>

        </section>
      </div>
    </main>
  )
}

export default PerfilMedico