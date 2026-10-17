import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  listarEstadoContasMedicas,
  criarContaMedica,
  associarContaMedicaExistente,
} from "../../data/administracao"

import {
  obterUsuarios,
} from "../../data/usuarios"

import {
  actualizarEstadoUtilizador,
} from "../../data/gestaoAdministrativa"

import {
  obterMedicoDaConta,
} from "../../data/medicos"

function GerirContasMedicas() {

  const navegar = useNavigate()

  const [medicos, setMedicos] =
    useState(() =>
      listarEstadoContasMedicas()
    )

  const [usuarios, setUsuarios] =
    useState(() =>
      obterUsuarios()
    )

  const [pesquisa, setPesquisa] =
    useState("")

  const [filtro, setFiltro] =
    useState("todos")

  const [mostrarCriar, setMostrarCriar] =
    useState(false)

  const [mostrarAssociar, setMostrarAssociar] =
    useState(false)

  const [medicoSelecionado, setMedicoSelecionado] =
    useState(null)

  const [mensagem, setMensagem] =
    useState("")

  const [erro, setErro] =
    useState("")

  const [formulario, setFormulario] =
    useState({
      nome: "",
      email: "",
      senha: "",
    })

  const [contaSelecionada, setContaSelecionada] =
    useState("")

  function recarregar() {
    setMedicos(
      listarEstadoContasMedicas()
    )

    setUsuarios(
      obterUsuarios()
    )
  }

  function limparMensagens() {
    setMensagem("")
    setErro("")
  }

  function abrirCriarConta(medico) {
    limparMensagens()

    setMedicoSelecionado(medico)

    setFormulario({
      nome: medico.nome || "",
      email: "",
      senha: "",
    })

    setMostrarCriar(true)
  }

  function abrirAssociarConta(medico) {
    limparMensagens()

    setMedicoSelecionado(medico)
    setContaSelecionada("")

    setMostrarAssociar(true)
  }

  function fecharFormularios() {
    setMostrarCriar(false)
    setMostrarAssociar(false)
    setMedicoSelecionado(null)
    setContaSelecionada("")

    setFormulario({
      nome: "",
      email: "",
      senha: "",
    })
  }

  function alterarFormulario(event) {
    const {
      name,
      value,
    } = event.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
  }

  function submeterCriacao(event) {
    event.preventDefault()

    limparMensagens()

    try {
      criarContaMedica({
        medicoId:
          medicoSelecionado.id,

        nome:
          formulario.nome,

        email:
          formulario.email,

        senha:
          formulario.senha,
      })

      fecharFormularios()

      setMensagem(
        `A conta médica de ${medicoSelecionado.nome} foi criada e associada com sucesso.`
      )

      recarregar()
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível criar a conta médica."
      )
    }
  }

  function submeterAssociacao(event) {
    event.preventDefault()

    limparMensagens()

    if (!contaSelecionada) {
      setErro(
        "Seleccione uma conta médica."
      )

      return
    }

    try {
      associarContaMedicaExistente(
        contaSelecionada,
        medicoSelecionado.id
      )

      fecharFormularios()

      setMensagem(
        "A conta médica foi associada ao perfil com sucesso."
      )

      recarregar()
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível associar a conta."
      )
    }
  }

  function alterarEstadoConta(medico) {
    if (!medico.temConta) {
      return
    }

    limparMensagens()

    try {
      actualizarEstadoUtilizador(
        medico.usuarioId,
        !medico.contaAtiva
      )

      setMensagem(
        medico.contaAtiva
          ? "Conta médica desactivada."
          : "Conta médica activada."
      )

      recarregar()
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível alterar o estado da conta."
      )
    }
  }

  const contasMedicasSemPerfil =
    useMemo(() => {
      return usuarios.filter(
        (usuario) => {
          const tipo =
            String(
              usuario.tipo ||
                usuario.role ||
                ""
            )
              .trim()
              .toLowerCase()

          if (
            tipo !== "medico" &&
            tipo !== "médico"
          ) {
            return false
          }

          return (
            !obterMedicoDaConta(
              usuario.id
            )
          )
        }
      )
    }, [usuarios])

  const contasMedicasDisponiveis =
    useMemo(() => {
      return contasMedicasSemPerfil.filter(
        (usuario) =>
          usuario.ativo !== false
      )
    }, [
      contasMedicasSemPerfil,
    ])

  const medicosFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase()

      return medicos.filter(
        (medico) => {
          const correspondePesquisa =
            !termo ||
            String(
              medico.nome || ""
            )
              .toLowerCase()
              .includes(termo) ||
            String(
              medico.especialidade ||
                ""
            )
              .toLowerCase()
              .includes(termo) ||
            String(
              medico.contaEmail || ""
            )
              .toLowerCase()
              .includes(termo)

          if (
            !correspondePesquisa
          ) {
            return false
          }

          if (
            filtro ===
            "com-conta"
          ) {
            return medico.temConta
          }

          if (
            filtro ===
            "sem-conta"
          ) {
            return !medico.temConta
          }

          if (
            filtro ===
            "activa"
          ) {
            return (
              medico.temConta &&
              medico.contaAtiva
            )
          }

          if (
            filtro ===
            "desactivada"
          ) {
            return (
              medico.temConta &&
              !medico.contaAtiva
            )
          }

          return true
        }
      )
    }, [
      medicos,
      pesquisa,
      filtro,
    ])

  const totalMedicos =
    medicos.length

  const medicosComConta =
    medicos.filter(
      (item) =>
        item.temConta
    ).length

  const medicosSemConta =
    medicos.filter(
      (item) =>
        !item.temConta
    ).length

  const contasActivas =
    medicos.filter(
      (item) =>
        item.temConta &&
        item.contaAtiva
    ).length

  const contasDesactivadas =
    medicos.filter(
      (item) =>
        item.temConta &&
        !item.contaAtiva
    ).length

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primaria">
            Administração
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Contas médicas
          </h1>

          <p className="mt-2 max-w-3xl text-gray-600">
            Crie e administre as contas de acesso dos médicos.
            Cada conta é associada a um perfil médico existente.
          </p>
        </div>

        
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navegar("/admin/especialidades")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Gerir especialidades
        </button>

        <button
          type="button"
          onClick={() => navegar("/admin/medicos/criar")}
          className="rounded-lg bg-primaria px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Criar novo médico
        </button>

        <button
          type="button"
          onClick={recarregar}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Actualizar
        </button>
      </div>

      </div>

      {mensagem && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {erro}
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Perfis médicos
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalMedicos}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Com conta
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {medicosComConta}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Sem conta
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {medicosSemConta}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Contas activas
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700">
            {contasActivas}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Contas desactivadas
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {contasDesactivadas}
          </p>
        </div>

      </section>

      {contasMedicasSemPerfil.length > 0 && (
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">

          <h2 className="text-lg font-bold text-amber-900">
            Contas médicas sem perfil
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            Existem contas do tipo médico que ainda não
            estão ligadas a um perfil profissional.
          </p>

          <div className="mt-4 space-y-2">

            {contasMedicasSemPerfil.map(
              (conta) => (
                <div
                  key={conta.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-amber-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {conta.nome}
                    </p>

                    <p className="text-sm text-gray-600">
                      {conta.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Sem perfil
                  </span>
                </div>
              )
            )}

          </div>

        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row">

            <input
              type="search"
              value={pesquisa}
              onChange={(event) =>
                setPesquisa(
                  event.target.value
                )
              }
              placeholder="Pesquisar médico, especialidade ou email..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria lg:flex-1"
            />

            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
            >
              <option value="todos">
                Todos
              </option>

              <option value="com-conta">
                Com conta
              </option>

              <option value="sem-conta">
                Sem conta
              </option>

              <option value="activa">
                Conta activa
              </option>

              <option value="desactivada">
                Conta desactivada
              </option>
            </select>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Médico
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Especialidade
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Conta
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Acções
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">

              {medicosFiltrados.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Nenhum médico encontrado.
                  </td>
                </tr>

              ) : (

                medicosFiltrados.map(
                  (medico) => (

                    <tr
                      key={medico.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {medico.nome}
                          </p>

                          <p className="text-xs text-gray-500">
                            ID: {medico.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {medico.especialidade ||
                          "Sem especialidade"}
                      </td>

                      <td className="px-5 py-4">

                        {medico.temConta ? (

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {medico.contaEmail}
                            </p>

                            <p className="text-xs text-gray-500">
                              Conta associada
                            </p>
                          </div>

                        ) : (

                          <span className="text-sm text-gray-500">
                            Sem conta
                          </span>

                        )}

                      </td>

                      <td className="px-5 py-4">

                        {!medico.temConta ? (

                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                            Sem conta
                          </span>

                        ) : medico.contaAtiva ? (

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Activa
                          </span>

                        ) : (

                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Desactivada
                          </span>

                        )}

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap justify-end gap-2">

                          {!medico.temConta && (

                            <>

                              <button
                                type="button"
                                onClick={() =>
                                  abrirCriarConta(
                                    medico
                                  )
                                }
                                className="rounded-lg bg-primaria px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                              >
                                Criar conta
                              </button>

                              {contasMedicasDisponiveis.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirAssociarConta(
                                      medico
                                    )
                                  }
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  Associar existente
                                </button>
                              )}

                            </>

                          )}

                          {medico.temConta && (

                            <button
                              type="button"
                              onClick={() =>
                                alterarEstadoConta(
                                  medico
                                )
                              }
                              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                                medico.contaAtiva
                                  ? "border-red-200 text-red-700 hover:bg-red-50"
                                  : "border-green-200 text-green-700 hover:bg-green-50"
                              }`}
                            >
                              {medico.contaAtiva
                                ? "Desactivar"
                                : "Activar"}
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

      {mostrarCriar &&
        medicoSelecionado && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Criar conta médica
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  O administrador está a criar
                  a conta para:
                </p>

                <p className="mt-1 font-semibold text-primaria">
                  {medicoSelecionado.nome}
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  Esta operação não cria um novo
                  perfil médico. A conta será ligada
                  ao perfil seleccionado.
                </p>

              </div>

              <form
                onSubmit={submeterCriacao}
                className="space-y-4"
              >

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nome da conta
                  </label>

                  <input
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarFormulario}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email de acesso
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={alterarFormulario}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Palavra-passe inicial
                  </label>

                  <input
                    type="password"
                    name="senha"
                    value={formulario.senha}
                    onChange={alterarFormulario}
                    minLength="8"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                    required
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo de 8 caracteres.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  <strong>Perfil:</strong>{" "}
                  {medicoSelecionado.nome}
                  <br />
                  <strong>Especialidade:</strong>{" "}
                  {medicoSelecionado.especialidade ||
                    "Não definida"}
                </div>

                <div className="flex justify-end gap-3 pt-4">

                  <button
                    type="button"
                    onClick={
                      fecharFormularios
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-primaria px-4 py-2 text-sm font-semibold text-white"
                  >
                    Criar conta
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      {mostrarAssociar &&
        medicoSelecionado && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="text-xl font-bold text-gray-900">
                Associar conta médica existente
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Esta opção é utilizada apenas para
                uma conta médica que ainda não tenha
                perfil associado.
              </p>

              <p className="mt-3 font-semibold text-primaria">
                Perfil:{" "}
                {medicoSelecionado.nome}
              </p>

              <form
                onSubmit={submeterAssociacao}
                className="mt-6 space-y-5"
              >

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Conta médica
                  </label>

                  <select
                    value={contaSelecionada}
                    onChange={(event) =>
                      setContaSelecionada(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primaria"
                    required
                  >

                    <option value="">
                      Seleccione uma conta
                    </option>

                    {contasMedicasDisponiveis.map(
                      (usuario) => (

                        <option
                          key={usuario.id}
                          value={usuario.id}
                        >
                          {usuario.nome} —{" "}
                          {usuario.email}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  A conta seleccionada continuará
                  a ser a mesma conta. Apenas será
                  ligada ao perfil médico escolhido.
                </div>

                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={
                      fecharFormularios
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-primaria px-4 py-2 text-sm font-semibold text-white"
                  >
                    Associar conta
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </main>
  )
}

export default GerirContasMedicas