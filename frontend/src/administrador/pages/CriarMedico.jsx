
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  obterEspecialidadesActivas,
} from "../../data/especialidades"

import {
  criarMedicoComConta,
} from "../../data/administracao"

function CriarMedico() {
  const navegar = useNavigate()

  const [especialidades, setEspecialidades] = useState([])
  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    sexo: "",
    especialidadeId: "",
  })

  const [credenciais, setCredenciais] = useState(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    setEspecialidades(obterEspecialidadesActivas())
  }, [])

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
  }

  function submeter(event) {
    event.preventDefault()
    setErro("")
    setCredenciais(null)

    try {
      if (especialidades.length === 0) {
        throw new Error(
          "Crie ou active uma especialidade antes de registar um médico."
        )
      }

      const resultado = criarMedicoComConta({
        ...formulario,
        especialidadeId: formulario.especialidadeId,
      })

      setCredenciais({
        nome: resultado.medico.nome,
        email: resultado.usuario.email,
        senha: resultado.senhaInicial,
      })

      setFormulario({
        nome: "",
        email: "",
        sexo: "",
        especialidadeId: "",
      })
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível criar a conta médica."
      )
    }
  }

  function copiarCredenciais() {
    if (!credenciais) return

    const texto = [
      `Médico: ${credenciais.nome}`,
      `Email: ${credenciais.email}`,
      `Palavra-passe inicial: ${credenciais.senha}`,
      "Estado: Desactivada — aguarda activação do administrador.",
    ].join("\n")

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).catch(() => {
        setErro(
          "Não foi possível copiar automaticamente. Copie as credenciais manualmente."
        )
      })
    } else {
      setErro(
        "A cópia automática não está disponível neste navegador. Copie as credenciais manualmente."
      )
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/admin/contas-medicas"
          className="text-sm font-semibold text-primaria hover:underline"
        >
          ← Voltar às contas médicas
        </Link>

        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-primaria">
          Administração
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Criar conta médica
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Registe um médico e crie a respectiva conta de acesso.
          A conta ficará desactivada até ser activada pelo administrador.
        </p>
      </div>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {erro}
        </div>
      )}

      {credenciais ? (
        <section className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-800">
              <span aria-hidden="true">!</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Conta criada com sucesso
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Guarda estas credenciais e entrega-as ao médico por um
                canal seguro. A palavra-passe inicial só é apresentada
                nesta confirmação.
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">
                Médico
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {credenciais.nome}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">
                Email de acesso
              </dt>
              <dd className="mt-1 break-all font-medium text-gray-900">
                {credenciais.email}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">
                Palavra-passe inicial
              </dt>
              <dd className="mt-1 break-all font-mono font-semibold text-gray-900">
                {credenciais.senha}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">
                Estado da conta
              </dt>
              <dd className="mt-1 font-semibold text-red-700">
                Desactivada — necessita de activação pelo administrador
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copiarCredenciais}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Copiar credenciais
            </button>

            <button
              type="button"
              onClick={() => navegar("/admin/contas-medicas")}
              className="rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Gerir contas médicas
            </button>

            <button
              type="button"
              onClick={() => setCredenciais(null)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"
            >
              Criar outra conta
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={submeter} className="space-y-5">
            <div>
              <label
                htmlFor="nome"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>

              <input
                id="nome"
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                minLength={3}
                maxLength={150}
                required
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                placeholder="Ex.: Dr. João Manuel"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email de acesso
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formulario.email}
                onChange={alterarCampo}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                placeholder="medico@clinica.ao"
              />
            </div>

            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-gray-700">
                Sexo
              </legend>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sexo"
                    value="M"
                    checked={formulario.sexo === "M"}
                    onChange={alterarCampo}
                    required
                  />
                  Masculino (M)
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sexo"
                    value="F"
                    checked={formulario.sexo === "F"}
                    onChange={alterarCampo}
                    required
                  />
                  Feminino (F)
                </label>
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="especialidadeId"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Especialidade
              </label>

              <select
                id="especialidadeId"
                name="especialidadeId"
                value={formulario.especialidadeId}
                onChange={alterarCampo}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
              >
                <option value="">
                  Seleccione uma especialidade
                </option>

                {especialidades.map((especialidade) => (
                  <option
                    key={especialidade.id}
                    value={especialidade.id}
                  >
                    {especialidade.nome}
                  </option>
                ))}
              </select>

              {especialidades.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  Não existem especialidades activas.
                  Registe ou active uma antes de continuar.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">
                Credenciais e segurança
              </p>

              <p className="mt-1">
                O sistema irá gerar uma palavra-passe inicial.
                A conta será criada desactivada e deverá ser activada
                pelo administrador antes de o médico poder iniciar sessão.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Link
                to="/admin/contas-medicas"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={especialidades.length === 0}
                className="rounded-lg bg-primaria px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Criar conta médica
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  )
}

export default CriarMedico