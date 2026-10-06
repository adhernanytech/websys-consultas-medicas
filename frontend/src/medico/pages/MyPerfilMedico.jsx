import { Link } from "react-router-dom"

import {
  obterUsuarioAutenticado,
} from "../../data/usuarios"

import {
  obterMedicoDaConta,
} from "../../data/medicos"

function PerfilMedico() {
  const usuario = obterUsuarioAutenticado()

  const medico = usuario
    ? obterMedicoDaConta(usuario.id)
    : null

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
            Consulte as informações associadas ao seu perfil médico.
          </p>
        </div>

        {/* Cartão principal */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Cabeçalho do perfil */}
          <div className="bg-primaria px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold text-primaria shadow">
                {inicialNome}
              </div>

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

            {medico.telefone && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Telefone
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {medico.telefone}
                </p>
              </div>
            )}

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

          {/* Ações */}
          <div className="flex flex-wrap gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">

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