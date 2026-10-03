export const CHAVE_PACIENTES =
  "pacientes"


export function obterPacientes() {
  return (
    JSON.parse(
      localStorage.getItem(
        CHAVE_PACIENTES
      )
    ) || []
  )
}


export function guardarPacientes(
  pacientes
) {
  localStorage.setItem(
    CHAVE_PACIENTES,
    JSON.stringify(pacientes)
  )
}


export function obterPacientePorId(id) {
  const pacientes =
    obterPacientes()

  return (
    pacientes.find(
      (paciente) =>
        String(paciente.id) ===
        String(id)
    ) || null
  )
}


export function obterPacientePorUsuarioId(
  usuarioId
) {
  const pacientes =
    obterPacientes()

  return (
    pacientes.find(
      (paciente) =>
        String(
          paciente.usuario_id
        ) === String(usuarioId)
    ) || null
  )
}


export function criarPaciente(
  dadosPaciente
) {
  const pacientes =
    obterPacientes()

  const novoPaciente = {
    id:
      dadosPaciente.id ||
      Date.now(),

    usuario_id:
      dadosPaciente.usuario_id,

    telefone:
      dadosPaciente.telefone || "",

    fotografia:
      dadosPaciente.fotografia || null
  }

  pacientes.push(novoPaciente)

  guardarPacientes(pacientes)

  return novoPaciente
}


export function actualizarPaciente(
  id,
  dadosActualizados
) {
  const pacientes =
    obterPacientes()

  const indice =
    pacientes.findIndex(
      (paciente) =>
        String(paciente.id) ===
        String(id)
    )

  if (indice === -1) {
    return null
  }

  const pacienteActualizado = {
    ...pacientes[indice],
    ...dadosActualizados
  }

  pacientes[indice] =
    pacienteActualizado

  guardarPacientes(pacientes)

  return pacienteActualizado
}