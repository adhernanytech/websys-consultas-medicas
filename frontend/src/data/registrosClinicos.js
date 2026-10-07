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

export function obterRegistoClinicoPorConsulta(consultaId) {
  const registos = obterRegistosClinicos()

  return (
    registos.find(
      (registo) =>
        String(registo.consultaId) === String(consultaId)
    ) || null
  )
}

export function obterRegistosClinicosDoPaciente(pacienteId) {
  const registos = obterRegistosClinicos()

  return registos.filter(
    (registo) =>
      String(registo.pacienteId) === String(pacienteId)
  )
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