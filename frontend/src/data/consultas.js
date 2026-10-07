import {
  obterDisponibilidades,
  guardarDisponibilidades,
} from "./disponibilidades"

const CHAVE_CONSULTAS = "consultas"

export function obterConsultas() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_CONSULTAS)
    )

    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

export function guardarConsultas(consultas) {
  if (!Array.isArray(consultas)) {
    throw new Error("A lista de consultas deve ser um array.")
  }

  localStorage.setItem(
    CHAVE_CONSULTAS,
    JSON.stringify(consultas)
  )
}

export function obterConsultaPorId(consultaId) {
  return (
    obterConsultas().find(
      (consulta) =>
        String(consulta.id) === String(consultaId)
    ) || null
  )
}

export function obterConsultasDoPaciente(pacienteId) {
  return obterConsultas().filter(
    (consulta) =>
      String(consulta.pacienteId) === String(pacienteId)
  )
}

export function obterConsultasDoMedico(medicoId) {
  return obterConsultas().filter(
    (consulta) =>
      String(consulta.medicoId) === String(medicoId)
  )
}

export function disponibilidadeEstaOcupada(disponibilidadeId) {
  const consultas = obterConsultas()

  return consultas.some(
    (consulta) =>
      String(consulta.disponibilidadeId) ===
        String(disponibilidadeId) &&
      consulta.estado === "Agendada"
  )
}

function transformarDataHoraEmData(data, horario) {
  if (!data || !horario) {
    return null
  }

  const partesData = String(data).split("-")

  if (partesData.length !== 3) {
    return null
  }

  const partesHora = String(horario).split(":")

  if (partesHora.length < 2) {
    return null
  }

  const ano = Number(partesData[0])
  const mes = Number(partesData[1]) - 1
  const dia = Number(partesData[2])
  const hora = Number(partesHora[0])
  const minuto = Number(partesHora[1])

  if (
    !Number.isInteger(ano) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia) ||
    !Number.isInteger(hora) ||
    !Number.isInteger(minuto)
  ) {
    return null
  }

  const dataHora = new Date(
    ano,
    mes,
    dia,
    hora,
    minuto,
    0,
    0
  )

  if (Number.isNaN(dataHora.getTime())) {
    return null
  }

  return dataHora
}

function consultaJaComecou(consulta) {
  const dataHora = transformarDataHoraEmData(
    consulta.data,
    consulta.horario
  )

  if (!dataHora) {
    return false
  }

  return dataHora.getTime() <= Date.now()
}

function validarMotivo(motivo) {
  const valor = String(motivo || "").trim()

  if (valor.length < 10) {
    throw new Error(
      "O motivo da consulta deve ter pelo menos 10 caracteres."
    )
  }

  if (valor.length > 1000) {
    throw new Error(
      "O motivo da consulta não pode ultrapassar 1000 caracteres."
    )
  }

  return valor
}

export function criarConsulta({
  pacienteId,
  pacienteNome,
  pacienteEmail,
  medicoId,
  medicoNome,
  especialidade,
  disponibilidadeId,
  data,
  horario,
  horaFim,
  motivo,
}) {
  if (!pacienteId) {
    throw new Error("O paciente é obrigatório.")
  }

  if (!medicoId) {
    throw new Error("O médico é obrigatório.")
  }

  if (!disponibilidadeId) {
    throw new Error("A disponibilidade é obrigatória.")
  }

  const disponibilidades = obterDisponibilidades()

  const disponibilidade = disponibilidades.find(
    (item) =>
      String(item.id) === String(disponibilidadeId)
  )

  if (!disponibilidade) {
    throw new Error(
      "O horário selecionado não existe."
    )
  }

  if (
    String(disponibilidade.medicoId) !==
    String(medicoId)
  ) {
    throw new Error(
      "O horário selecionado não pertence a este médico."
    )
  }

  if (disponibilidade.estado !== "Disponível") {
    throw new Error(
      "Este horário já não está disponível."
    )
  }

  const dataConsulta =
    data || disponibilidade.data

  const horarioConsulta =
    horario ||
    disponibilidade.horaInicio ||
    disponibilidade.horario

  const horaFinal =
    horaFim ||
    disponibilidade.horaFim

  const dataHora = transformarDataHoraEmData(
    dataConsulta,
    horarioConsulta
  )

  if (!dataHora) {
    throw new Error(
      "A data ou o horário da consulta é inválido."
    )
  }

  if (dataHora.getTime() <= Date.now()) {
    throw new Error(
      "Não é possível marcar uma consulta para uma data ou horário passado."
    )
  }

  if (disponibilidadeEstaOcupada(disponibilidadeId)) {
    throw new Error(
      "Este horário já foi reservado."
    )
  }

  const motivoFinal = validarMotivo(motivo)

  const consultas = obterConsultas()

  const novaConsulta = {
    id: Date.now(),
    pacienteId,
    pacienteNome,
    pacienteEmail,
    medicoId,
    medicoNome,
    especialidade,
    disponibilidadeId,
    data: dataConsulta,
    horario: horarioConsulta,
    horaFim: horaFinal,
    motivo: motivoFinal,
    estado: "Agendada",
    criadaEm: new Date().toISOString(),
  }

  consultas.push(novaConsulta)

  guardarConsultas(consultas)

  const disponibilidadeIndex =
    disponibilidades.findIndex(
      (item) =>
        String(item.id) ===
        String(disponibilidadeId)
    )

  if (disponibilidadeIndex !== -1) {
    disponibilidades[disponibilidadeIndex] = {
      ...disponibilidades[disponibilidadeIndex],
      estado: "Ocupada",
    }

    guardarDisponibilidades(disponibilidades)
  }

  return novaConsulta
}

export function editarConsulta(
  consultaId,
  pacienteId,
  {
    disponibilidadeId,
    data,
    horario,
    horaFim,
    motivo,
  }
) {
  const consultas = obterConsultas()

  const indice = consultas.findIndex(
    (consulta) =>
      String(consulta.id) === String(consultaId) &&
      String(consulta.pacienteId) === String(pacienteId)
  )

  if (indice === -1) {
    throw new Error(
      "Consulta não encontrada ou não pertence a este paciente."
    )
  }

  const consultaAtual = consultas[indice]

  if (
    consultaAtual.estado !== "Agendada"
  ) {
    throw new Error(
      "Apenas consultas agendadas podem ser alteradas."
    )
  }

  const disponibilidades = obterDisponibilidades()

  let novaDisponibilidade = null

  if (disponibilidadeId) {
    novaDisponibilidade =
      disponibilidades.find(
        (item) =>
          String(item.id) ===
          String(disponibilidadeId)
      )

    if (!novaDisponibilidade) {
      throw new Error(
        "O novo horário selecionado não existe."
      )
    }

    if (
      String(novaDisponibilidade.medicoId) !==
      String(consultaAtual.medicoId)
    ) {
      throw new Error(
        "O novo horário não pertence ao médico da consulta."
      )
    }

    if (
      novaDisponibilidade.estado !== "Disponível" &&
      String(novaDisponibilidade.id) !==
        String(consultaAtual.disponibilidadeId)
    ) {
      throw new Error(
        "O novo horário já não está disponível."
      )
    }

    if (
      disponibilidadeEstaOcupada(
        novaDisponibilidade.id
      ) &&
      String(novaDisponibilidade.id) !==
        String(consultaAtual.disponibilidadeId)
    ) {
      throw new Error(
        "O novo horário já foi reservado."
      )
    }
  } else {
    novaDisponibilidade =
      disponibilidades.find(
        (item) =>
          String(item.id) ===
          String(consultaAtual.disponibilidadeId)
      )
  }

  const novaData =
    data ||
    novaDisponibilidade?.data ||
    consultaAtual.data

  const novoHorario =
    horario ||
    novaDisponibilidade?.horaInicio ||
    consultaAtual.horario

  const novaHoraFim =
    horaFim ||
    novaDisponibilidade?.horaFim ||
    consultaAtual.horaFim

  const dataHora = transformarDataHoraEmData(
    novaData,
    novoHorario
  )

  if (!dataHora) {
    throw new Error(
      "A data ou o horário selecionado é inválido."
    )
  }

  if (dataHora.getTime() <= Date.now()) {
    throw new Error(
      "A nova consulta deve ser marcada para uma data e horário futuros."
    )
  }

  const motivoFinal = validarMotivo(
    motivo ?? consultaAtual.motivo
  )

  const disponibilidadeAntigaId =
    consultaAtual.disponibilidadeId

  const disponibilidadeNovaId =
    novaDisponibilidade?.id ||
    disponibilidadeAntigaId

  if (
    String(disponibilidadeNovaId) !==
    String(disponibilidadeAntigaId)
  ) {
    const indiceNova =
      disponibilidades.findIndex(
        (item) =>
          String(item.id) ===
          String(disponibilidadeNovaId)
      )

    const indiceAntiga =
      disponibilidades.findIndex(
        (item) =>
          String(item.id) ===
          String(disponibilidadeAntigaId)
      )

    if (indiceNova !== -1) {
      disponibilidades[indiceNova] = {
        ...disponibilidades[indiceNova],
        estado: "Ocupada",
      }
    }

    if (indiceAntiga !== -1) {
      disponibilidades[indiceAntiga] = {
        ...disponibilidades[indiceAntiga],
        estado: "Disponível",
      }
    }

    guardarDisponibilidades(disponibilidades)
  }

  consultas[indice] = {
    ...consultaAtual,
    disponibilidadeId:
      disponibilidadeNovaId,
    data: novaData,
    horario: novoHorario,
    horaFim: novaHoraFim,
    motivo: motivoFinal,
    actualizadaEm:
      new Date().toISOString(),
  }

  guardarConsultas(consultas)

  return consultas[indice]
}

export function cancelarConsulta(
  consultaId,
  pacienteId
) {
  const consultas = obterConsultas()

  const indice = consultas.findIndex(
    (consulta) =>
      String(consulta.id) === String(consultaId) &&
      String(consulta.pacienteId) ===
        String(pacienteId)
  )

  if (indice === -1) {
    throw new Error(
      "Consulta não encontrada."
    )
  }

  const consulta = consultas[indice]

  if (
    consulta.estado !== "Agendada" &&
    consulta.estado !== "Confirmada"
  ) {
    throw new Error(
      "Apenas consultas agendadas podem ser canceladas."
    )
  }

  consultas[indice] = {
    ...consulta,
    estado: "Cancelada",
    canceladaEm: new Date().toISOString(),
    canceladaPor: "paciente",
  }

  guardarConsultas(consultas)

  libertarDisponibilidade(
    consulta.disponibilidadeId
  )

  return consultas[indice]
}

export function cancelarConsultaPeloMedico(
  consultaId,
  medicoId
) {
  const consultas = obterConsultas()

  const indice = consultas.findIndex(
    (consulta) =>
      String(consulta.id) === String(consultaId) &&
      String(consulta.medicoId) === String(medicoId)
  )

  if (indice === -1) {
    throw new Error(
      "Consulta não encontrada ou não pertence a este médico."
    )
  }

  const consulta = consultas[indice]

  if (
    consulta.estado !== "Agendada" &&
    consulta.estado !== "Confirmada"
  ) {
    throw new Error(
      "Apenas consultas agendadas podem ser canceladas."
    )
  }

  consultas[indice] = {
    ...consulta,
    estado: "Cancelada",
    canceladaEm: new Date().toISOString(),
    canceladaPor: "medico",
  }

  guardarConsultas(consultas)

  libertarDisponibilidade(
    consulta.disponibilidadeId
  )

  return consultas[indice]
}

export function marcarConsultaComoRealizada(
  consultaId,
  medicoId
) {
  const consultas = obterConsultas()

  const indice = consultas.findIndex(
    (consulta) =>
      String(consulta.id) === String(consultaId) &&
      String(consulta.medicoId) === String(medicoId)
  )

  if (indice === -1) {
    throw new Error(
      "Consulta não encontrada ou não pertence a este médico."
    )
  }

  const consulta = consultas[indice]

  if (
    consulta.estado !== "Agendada" &&
    consulta.estado !== "Confirmada"
  ) {
    throw new Error(
      "Apenas consultas agendadas podem ser marcadas como realizadas."
    )
  }

  if (!consultaJaComecou(consulta)) {
    throw new Error(
      "Esta consulta ainda não começou. Só pode ser marcada como realizada depois do horário agendado."
    )
  }

  consultas[indice] = {
    ...consulta,
    estado: "Realizada",
    realizadaEm: new Date().toISOString(),
  }

  guardarConsultas(consultas)

  return consultas[indice]
}

function libertarDisponibilidade(
  disponibilidadeId
) {
  if (!disponibilidadeId) {
    return
  }

  const disponibilidades =
    obterDisponibilidades()

  const indice =
    disponibilidades.findIndex(
      (disponibilidade) =>
        String(disponibilidade.id) ===
        String(disponibilidadeId)
    )

  if (indice === -1) {
    return
  }

  disponibilidades[indice] = {
    ...disponibilidades[indice],
    estado: "Disponível",
  }

  guardarDisponibilidades(
    disponibilidades
  )
}