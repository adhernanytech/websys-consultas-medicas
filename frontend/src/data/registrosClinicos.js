import { obterConsultasDoMedico } from "./consultas"

const CHAVE_REGISTOS_CLINICOS = "registosClinicos"

export function obterRegistosClinicos() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_REGISTOS_CLINICOS))
    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

export function guardarRegistosClinicos(registos) {
  if (!Array.isArray(registos)) {
    throw new Error("A lista de registos clínicos é inválida.")
  }

  localStorage.setItem(
    CHAVE_REGISTOS_CLINICOS,
    JSON.stringify(registos)
  )
}

export function obterRegistoClinicoPorConsulta(
  consultaId,
  medicoId
) {
  if (consultaId == null || medicoId == null) return null

  const consulta = obterConsultasDoMedico(medicoId).find(
    (item) => String(item.id) === String(consultaId)
  )

  if (
    !consulta ||
    (consulta.estado !== "Realizada" &&
      consulta.estado !== "Concluída")
  ) {
    return null
  }

  return (
    obterRegistosClinicos().find(
      (registo) =>
        String(registo.consultaId) === String(consultaId) &&
        String(registo.medicoId) === String(medicoId) &&
        String(registo.pacienteId) === String(consulta.pacienteId)
    ) || null
  )
}

export function obterRegistosClinicosDoMedicoEPaciente(
  medicoId,
  pacienteId
) {
  if (medicoId == null || pacienteId == null) return []

  const consultasValidas = obterConsultasDoMedico(medicoId)
    .filter(
      (consulta) =>
        String(consulta.pacienteId) === String(pacienteId) &&
        (consulta.estado === "Realizada" ||
          consulta.estado === "Concluída")
    )
  const idsConsultas = new Set(
    consultasValidas.map((consulta) => String(consulta.id))
  )
  const consultaPorId = new Map(
    consultasValidas.map((consulta) => [
      String(consulta.id),
      consulta,
    ])
  )

  const registos = obterRegistosClinicos()

  return registos
    .filter(
      (registo) =>
        String(registo.medicoId) === String(medicoId) &&
        String(registo.pacienteId) === String(pacienteId) &&
        idsConsultas.has(String(registo.consultaId))
    )
    .sort((a, b) => {
      const consultaA = consultaPorId.get(String(a.consultaId))
      const consultaB = consultaPorId.get(String(b.consultaId))
      const dataA = `${consultaA?.data || ""} ${consultaA?.horario || ""}`
      const dataB = `${consultaB?.data || ""} ${consultaB?.horario || ""}`

      return dataB.localeCompare(dataA)
    })
}

export function guardarRegistoClinico({
  consultaId,
  pacienteId,
  medicoId,
  queixa,
  observacoes,
  diagnostico,
  tratamento,
}) {
  if (!consultaId || !pacienteId || !medicoId) {
    throw new Error(
      "É necessário associar o registo a uma consulta, paciente e médico."
    )
  }

  const consulta = obterConsultasDoMedico(medicoId).find(
    (item) => String(item.id) === String(consultaId)
  )

  if (
    !consulta ||
    String(consulta.pacienteId) !== String(pacienteId) ||
    (consulta.estado !== "Realizada" && consulta.estado !== "Concluída")
  ) {
    throw new Error(
      "O registo clínico deve pertencer a uma consulta realizada deste médico e paciente."
    )
  }

  const registos = obterRegistosClinicos()

  const agora = new Date().toISOString()

  const indice = registos.findIndex(
    (registo) =>
      String(registo.consultaId) === String(consultaId)
  )

  if (
    indice !== -1 &&
    (
      String(registos[indice].medicoId) !== String(medicoId) ||
      String(registos[indice].pacienteId) !== String(pacienteId)
    )
  ) {
    throw new Error(
      "O registo clínico existente não pertence a esta consulta, médico e paciente."
    )
  }

  const registo = {
    id:
      indice !== -1
        ? registos[indice].id
        : Date.now(),

    consultaId,
    pacienteId,
    medicoId,

    queixa: queixa?.trim() || "",
    observacoes: observacoes?.trim() || "",
    diagnostico: diagnostico?.trim() || "",
    tratamento: tratamento?.trim() || "",

    atualizadoEm: agora,

    criadoEm:
      indice !== -1
        ? registos[indice].criadoEm
        : agora,
  }

  if (indice !== -1) {
    registos[indice] = {
      ...registos[indice],
      ...registo,
    }
  } else {
    registos.push(registo)
  }

  guardarRegistosClinicos(registos)

  return registo
}