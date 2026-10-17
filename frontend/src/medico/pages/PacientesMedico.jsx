import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { obterMedicoAutenticado } from "../../data/medicos"
import { obterConsultasDoMedico } from "../../data/consultas"
import { obterUsuarios } from "../../data/usuarios"

function formatarData(data) {
  if (!data) return "Data não disponível"

  const [ano, mes, dia] = String(data).split("-")
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

function PacientesMedico() {
  const medico = obterMedicoAutenticado()
  const medicoId = medico?.id
  const [pesquisa, setPesquisa] = useState("")

  const pacientes = useMemo(() => {
    if (medicoId == null) return []

    const consultas = obterConsultasDoMedico(medicoId)
    const usuarios = obterUsuarios()
    const usuariosPorId = new Map(
      usuarios.map((usuario) => [String(usuario.id), usuario])
    )
    const porId = new Map()

    consultas.forEach((consulta) => {
      if (consulta.pacienteId == null) return

      const id = String(consulta.pacienteId)
      const usuario = usuariosPorId.get(id)
      const utilizadorPaciente =
        usuario?.tipo === "paciente" || usuario?.role === "paciente"
      const utilizadorValido = utilizadorPaciente ? usuario : null
      const registo = porId.get(id) || {
        id: consulta.pacienteId,
        nome: utilizadorValido?.nome || consulta.pacienteNome || "Paciente",
        email: utilizadorValido?.email || consulta.pacienteEmail || "",
        telefone: utilizadorValido?.telefone || "",
        fotografia:
          utilizadorValido?.foto ||
          utilizadorValido?.fotografia ||
          utilizadorValido?.imagem ||
          null,
        consultas: [],
      }

      registo.consultas.push(consulta)
      porId.set(id, registo)
    })

    return [...porId.values()]
      .map((paciente) => ({
        ...paciente,
        consultas: paciente.consultas.sort((a, b) =>
          `${b.data || ""} ${b.horario || ""}`.localeCompare(
            `${a.data || ""} ${a.horario || ""}`
          )
        ),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt"))
  }, [medicoId])

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt")
    if (!termo) return true

    return [paciente.nome, paciente.email, paciente.telefone]
      .filter(Boolean)
      .some((valor) =>
        String(valor).toLocaleLowerCase("pt").includes(termo)
      )
  })

  if (!medico) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-bold text-texto">
            Perfil médico não associado
          </h1>
          <p className="mt-2 text-texto-secundario">
            Não foi possível carregar a lista de pacientes desta conta.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <Link
            to="/medico/dashboard"
            className="text-sm font-medium text-primaria hover:underline"
          >
            ← Voltar ao dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Os meus pacientes
          </h1>
          <p className="mt-2 text-gray-600">
            Pacientes com consultas associadas ao seu perfil médico.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="pesquisa-pacientes"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Pesquisar pacientes
          </label>
          <input
            id="pesquisa-pacientes"
            type="search"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Nome, email ou telefone"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primaria focus:outline-none focus:ring-2 focus:ring-primaria/20"
          />
          <p className="mt-3 text-sm text-gray-500" aria-live="polite">
            {pacientesFiltrados.length} de {pacientes.length} paciente(s)
          </p>
        </section>

        {pacientesFiltrados.length === 0 ? (
          <section className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <h2 className="font-semibold text-gray-900">
              {pacientes.length === 0
                ? "Ainda não tem pacientes associados"
                : "Não foram encontrados pacientes"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {pacientes.length === 0
                ? "Os pacientes que marcarem consultas consigo aparecerão aqui."
                : "Experimente pesquisar por outro nome, email ou telefone."}
            </p>
          </section>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {pacientesFiltrados.map((paciente) => {
              const consultaMaisRecente = paciente.consultas[0]

              return (
                <li
                  key={paciente.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        {paciente.fotografia ? (
                          <img
                            src={paciente.fotografia}
                            alt=""
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-primaria">
                            {paciente.nome.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <h2 className="truncate text-lg font-bold text-gray-900">
                          {paciente.nome}
                        </h2>
                      </div>
                      <p className="mt-1 break-all text-sm text-gray-600">
                        {paciente.email || "Email não informado"}
                      </p>
                      {paciente.telefone && (
                        <p className="mt-1 text-sm text-gray-600">
                          {paciente.telefone}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {paciente.consultas.length} consulta(s)
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Consulta mais recente:{" "}
                    <span className="font-medium text-gray-700">
                      {formatarData(consultaMaisRecente?.data)}
                    </span>
                  </p>
                  <Link
                    to={`/medico/pacientes/${paciente.id}`}
                    className="mt-4 inline-flex rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaria-hover"
                  >
                    Ver perfil e histórico
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}

export default PacientesMedico
