import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import {
  obterUsuarios,
} from "../../data/usuarios"

import {
  obterPacientes,
} from "../../data/paciente"

import {
  obterConsultas,
} from "../../data/consultas"

import {
  actualizarEstadoUtilizador,
} from "../../data/gestaoAdministrativa"

function GerirUtilizadores() {
  const [usuarios, setUsuarios] =
    useState(() => obterUsuarios())

  const [pacientes, setPacientes] =
    useState(() => obterPacientes())

  const [consultas, setConsultas] =
    useState(() => obterConsultas())

  const [pesquisa, setPesquisa] =
    useState("")

  const [filtro, setFiltro] =
    useState("todos")

  const [mensagem, setMensagem] =
    useState("")

  const [erro, setErro] =
    useState("")

  const [pacienteSelecionado, setPacienteSelecionado] =
    useState(null)

  function recarregar() {
    setUsuarios(obterUsuarios())
    setPacientes(obterPacientes())
    setConsultas(obterConsultas())
  }

  function limparMensagens() {
    setMensagem("")
    setErro("")
  }

  function obterTipo(usuario) {
    return String(
      usuario?.tipo ||
      usuario?.role ||
      ""
    )
      .trim()
      .toLowerCase()
  }

  const pacientesComDados =
    useMemo(() => {
      return usuarios
        .filter(
          (usuario) =>
            obterTipo(usuario) ===
            "paciente"
        )
        .map((usuario) => {
          const perfil =
            pacientes.find(
              (paciente) =>
                String(
                  paciente.usuario_id
                ) ===
                String(usuario.id)
            ) || null

          const consultasPaciente =
            consultas.filter(
              (consulta) =>
                String(
                  consulta.pacienteId
                ) ===
                String(usuario.id) ||
                (
                  perfil &&
                  String(
                    consulta.pacienteId
                  ) ===
                    String(perfil.id)
                )
            )

          return {
            usuario,
            perfil,
            consultas:
              consultasPaciente,
          }
        })
    }, [
      usuarios,
      pacientes,
      consultas,
    ])

  const pacientesFiltrados =
    useMemo(() => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase()

      return pacientesComDados.filter(
        (item) => {
          const usuario =
            item.usuario

          const correspondePesquisa =
            !termo ||
            String(
              usuario.nome || ""
            )
              .toLowerCase()
              .includes(termo) ||
            String(
              usuario.email || ""
            )
              .toLowerCase()
              .includes(termo) ||
            String(
              item.perfil?.telefone ||
              ""
            )
              .toLowerCase()
              .includes(termo)

          if (!correspondePesquisa) {
            return false
          }

          if (filtro === "activos") {
            return usuario.ativo !== false
          }

          if (filtro === "desactivados") {
            return usuario.ativo === false
          }

          if (filtro === "sem-perfil") {
            return !item.perfil
          }

          return true
        }
      )
    }, [
      pacientesComDados,
      pesquisa,
      filtro,
    ])

  const total =
    pacientesComDados.length

  const activos =
    pacientesComDados.filter(
      (item) =>
        item.usuario.ativo !== false
    ).length

  const desactivados =
    pacientesComDados.filter(
      (item) =>
        item.usuario.ativo === false
    ).length

  const semPerfil =
    pacientesComDados.filter(
      (item) =>
        !item.perfil
    ).length

  const totalConsultas =
    pacientesComDados.reduce(
      (total, item) =>
        total + item.consultas.length,
      0
    )

  function alterarEstado(item) {
    limparMensagens()

    try {
      actualizarEstadoUtilizador(
        item.usuario.id,
        item.usuario.ativo === false
      )

      setMensagem(
        item.usuario.ativo === false
          ? "Paciente activado com sucesso."
          : "Paciente desactivado com sucesso."
      )

      recarregar()
    } catch (error) {
      setErro(
        error?.message ||
        "Não foi possível alterar o estado do paciente."
      )
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primaria">
            Administração
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Pacientes e utilizadores
          </h1>

          <p className="mt-2 max-w-3xl text-gray-600">
            Consulte e administre as contas de pacientes
            registadas no sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={recarregar}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Actualizar
        </button>

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
            Total de pacientes
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Activos
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700">
            {activos}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Desactivados
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {desactivados}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Sem perfil
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {semPerfil}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Consultas registadas
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {totalConsultas}
          </p>
        </div>

      </section>

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
              placeholder="Pesquisar por nome, email ou telefone..."
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

              <option value="activos">
                Activos
              </option>

              <option value="desactivados">
                Desactivados
              </option>

              <option value="sem-perfil">
                Sem perfil
              </option>
            </select>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Paciente
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Contacto
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Consultas
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Acções
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map(
                  (item) => (
                    <tr
                      key={item.usuario.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-gray-900">
                          {item.usuario.nome}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.usuario.email}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {item.perfil?.telefone ||
                          "Não informado"}
                      </td>

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            setPacienteSelecionado(
                              item
                            )
                          }
                          className="font-semibold text-primaria hover:underline"
                        >
                          {item.consultas.length}
                        </button>

                      </td>

                      <td className="px-5 py-4">

                        {item.usuario.ativo !== false ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Desactivado
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setPacienteSelecionado(
                                item
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Ver detalhes
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              alterarEstado(item)
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                              item.usuario.ativo !== false
                                ? "border-red-200 text-red-700 hover:bg-red-50"
                                : "border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {item.usuario.ativo !== false
                              ? "Desactivar"
                              : "Activar"}
                          </button>

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

      {pacienteSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Detalhes do paciente
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informação administrativa e histórico de consultas.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPacienteSelecionado(
                    null
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Fechar
              </button>

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Nome
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {pacienteSelecionado.usuario.nome}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Email
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {pacienteSelecionado.usuario.email}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Telefone
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {pacienteSelecionado.perfil?.telefone ||
                    "Não informado"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Estado
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {pacienteSelecionado.usuario.ativo !== false
                    ? "Activo"
                    : "Desactivado"}
                </p>
              </div>

            </div>

            <div className="mt-8">

              <h3 className="text-lg font-bold text-gray-900">
                Histórico de consultas
              </h3>

              {pacienteSelecionado.consultas.length === 0 ? (
                <p className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  Este paciente ainda não possui consultas registadas.
                </p>
              ) : (
                <div className="mt-3 space-y-3">

                  {pacienteSelecionado.consultas.map(
                    (consulta) => (
                      <div
                        key={consulta.id}
                        className="rounded-xl border border-gray-200 p-4"
                      >

                        <div className="flex flex-col justify-between gap-2 sm:flex-row">

                          <div>
                            <p className="font-semibold text-gray-900">
                              {consulta.medicoNome ||
                                "Médico não informado"}
                            </p>

                            <p className="text-sm text-gray-600">
                              {consulta.especialidade ||
                                "Especialidade não informada"}
                            </p>
                          </div>

                          <span className="text-sm font-medium text-gray-700">
                            {consulta.data} —{" "}
                            {consulta.horario}
                          </span>

                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">

                          <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                            {consulta.estado}
                          </span>

                          {consulta.motivo && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                              {consulta.motivo}
                            </span>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  )
}

export default GerirUtilizadores