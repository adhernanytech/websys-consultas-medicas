import { useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  configurarPrimeiroAdministrador,
  existeAdministrador,
} from "../../data/administracao"

import {
  guardarUsuarioAutenticado,
} from "../../data/usuarios"

function ConfigurarAdmin() {
  const navegar = useNavigate()

  const [formulario, setFormulario] =
    useState({
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    })

  const [erro, setErro] =
    useState("")

  const [mensagem, setMensagem] =
    useState("")

  const [carregando, setCarregando] =
    useState(false)

  if (existeAdministrador()) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">

        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Administração já configurada
          </h1>

          <p className="mt-3 text-gray-600">
            Já existe uma conta administrativa.
          </p>

          <button
            type="button"
            onClick={() =>
              navegar("/login")
            }
            className="mt-6 rounded-lg bg-primaria px-5 py-2.5 font-semibold text-white"
          >
            Ir para o login
          </button>

        </div>

      </main>
    )
  }

  function alterarCampo(evento) {
    const {
      name,
      value,
    } = evento.target

    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    )

    setErro("")
    setMensagem("")
  }

  function submeter(evento) {
    evento.preventDefault()

    setErro("")
    setMensagem("")

    if (
      formulario.senha !==
      formulario.confirmarSenha
    ) {
      setErro(
        "As palavras-passe não coincidem."
      )

      return
    }

    setCarregando(true)

    try {
      const admin =
        configurarPrimeiroAdministrador({
          nome: formulario.nome,
          email: formulario.email,
          senha: formulario.senha,
        })

      guardarUsuarioAutenticado(admin)

      setMensagem(
        "Conta administrativa criada com sucesso."
      )

      window.setTimeout(() => {
        navegar(
          "/admin/dashboard",
          { replace: true }
        )
      }, 700)

    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível criar a conta."
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">

      <div className="mx-auto max-w-xl">

        <div className="mb-8 text-center">

          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Configuração inicial
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Criar administrador
          </h1>

          <p className="mt-3 text-gray-600">
            Esta operação só pode ser realizada quando ainda não existe um administrador.
          </p>

        </div>

        <form
          onSubmit={submeter}
          className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >

          {erro && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {mensagem}
            </div>
          )}

          <div className="space-y-5">

            <div>
              <label
                htmlFor="admin-nome"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nome
              </label>

              <input
                id="admin-nome"
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                required
                minLength={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                value={formulario.email}
                onChange={alterarCampo}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="admin-senha"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Palavra-passe
              </label>

              <input
                id="admin-senha"
                name="senha"
                type="password"
                value={formulario.senha}
                onChange={alterarCampo}
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="admin-confirmar"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirmar palavra-passe
              </label>

              <input
                id="admin-confirmar"
                name="confirmarSenha"
                type="password"
                value={formulario.confirmarSenha}
                onChange={alterarCampo}
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-7 w-full rounded-lg bg-primaria px-5 py-3 font-semibold text-white hover:bg-primaria-hover disabled:opacity-60"
          >
            {carregando
              ? "A criar..."
              : "Criar conta administrativa"}
          </button>

        </form>

      </div>

    </main>
  )
}

export default ConfigurarAdmin