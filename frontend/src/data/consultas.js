
import {
  obterDisponibilidades,
  guardarDisponibilidades,
} from "./disponibilidades";

const CHAVE_CONSULTAS = "consultas";

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataHoraLocal(data, hora) {
  return new Date(`${data}T${hora}:00`);
}

function consultaActiva(consulta) {
  return consulta.estado !== "Cancelada";
}

export function obterConsultas() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_CONSULTAS)
    );

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function guardarConsultas(consultas) {
  if (!Array.isArray(consultas)) {
    throw new Error("A lista de consultas é inválida.");
  }

  localStorage.setItem(
    CHAVE_CONSULTAS,
    JSON.stringify(consultas)
  );
}

export function obterConsultasDoPaciente(pacienteId) {
  return obterConsultas()
    .filter(
      (consulta) =>
        String(consulta.pacienteId) === String(pacienteId)
    )
    .sort((a, b) =>
      `${b.data}T${b.horario}`.localeCompare(
        `${a.data}T${a.horario}`
      )
    );
}

export function obterConsultasDoMedico(medicoId) {
  return obterConsultas()
    .filter(
      (consulta) =>
        String(consulta.medicoId) === String(medicoId)
    )
    .sort((a, b) =>
      `${a.data}T${a.horario}`.localeCompare(
        `${b.data}T${b.horario}`
      )
    );
}

export function disponibilidadeEstaOcupada(disponibilidadeId) {
  return obterConsultas().some(
    (consulta) =>
      String(consulta.disponibilidadeId) ===
        String(disponibilidadeId) &&
      consultaActiva(consulta)
  );
}

export function criarConsulta(dados) {
  if (!dados) {
    throw new Error("Os dados da consulta são obrigatórios.");
  }

  const {
    pacienteId,
    pacienteNome,
    pacienteEmail,
    medicoId,
    medicoNome,
    especialidade,
    disponibilidadeId,
    motivo,
  } = dados;

  if (
    pacienteId === undefined ||
    pacienteId === null ||
    !disponibilidadeId
  ) {
    throw new Error(
      "Não foi possível identificar o paciente ou o horário seleccionado."
    );
  }

  if (!motivo || motivo.trim().length < 10) {
    throw new Error(
      "Descreva o motivo da consulta com pelo menos 10 caracteres."
    );
  }

  const disponibilidades = obterDisponibilidades();

  const disponibilidade = disponibilidades.find(
    (item) =>
      String(item.id) === String(disponibilidadeId)
  );

  if (!disponibilidade) {
    throw new Error(
      "A disponibilidade seleccionada não existe."
    );
  }

  if (
    medicoId !== undefined &&
    medicoId !== null &&
    String(disponibilidade.medicoId) !== String(medicoId)
  ) {
    throw new Error(
      "O horário seleccionado não pertence ao médico escolhido."
    );
  }

  if (disponibilidade.estado !== "Disponível") {
    throw new Error(
      "Este horário já não está disponível."
    );
  }

  const { data, horaInicio, horaFim } = disponibilidade;

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data || "") ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(horaInicio || "") ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(horaFim || "")
  ) {
    throw new Error(
      "A disponibilidade contém uma data ou horário inválido."
    );
  }

  const dataObjecto = new Date(`${data}T12:00:00`);

  if (
    Number.isNaN(dataObjecto.getTime()) ||
    dataLocalISO(dataObjecto) !== data
  ) {
    throw new Error("A data da disponibilidade é inválida.");
  }

  if (horaInicio >= horaFim) {
    throw new Error(
      "O intervalo de horário desta disponibilidade é inválido."
    );
  }

  if (data < dataLocalISO()) {
    throw new Error(
      "Não é possível marcar uma consulta para uma data passada."
    );
  }

  if (
    dataHoraLocal(data, horaInicio).getTime() <= Date.now()
  ) {
    throw new Error(
      "Não é possível marcar uma consulta para um horário passado."
    );
  }

  const consultas = obterConsultas();

  const duplicada = consultas.some(
    (consulta) =>
      String(consulta.disponibilidadeId) ===
        String(disponibilidade.id) &&
      consultaActiva(consulta)
  );

  if (duplicada) {
    throw new Error(
      "Este horário já foi reservado por outro paciente."
    );
  }

  const novaConsulta = {
    id: `cons-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    pacienteId,
    pacienteNome: pacienteNome || "",
    pacienteEmail: pacienteEmail || "",
    medicoId: disponibilidade.medicoId,
    medicoNome: medicoNome || "",
    especialidade: especialidade || "",
    disponibilidadeId: disponibilidade.id,
    data: disponibilidade.data,
    horario: disponibilidade.horaInicio,
    horaFim: disponibilidade.horaFim,
    motivo: motivo.trim(),
    estado: "Agendada",
    criadaEm: new Date().toISOString(),
  };

  // Actualiza a disponibilidade antes de guardar a consulta.
  // Se a gravação da consulta falhar, repõe o estado anterior.
  const novasDisponibilidades = disponibilidades.map((item) =>
    String(item.id) === String(disponibilidade.id)
      ? { ...item, estado: "Ocupada" }
      : item
  );

  guardarDisponibilidades(novasDisponibilidades);

  try {
    guardarConsultas([...consultas, novaConsulta]);
  } catch (error) {
    guardarDisponibilidades(disponibilidades);
    throw error;
  }

  return novaConsulta;
}

export function cancelarConsulta(consultaId, pacienteId) {
  const consultas = obterConsultas();

  const consulta = consultas.find(
    (item) =>
      String(item.id) === String(consultaId) &&
      String(item.pacienteId) === String(pacienteId)
  );

  if (!consulta) {
    throw new Error(
      "Não foi encontrada uma consulta deste paciente."
    );
  }

  if (consulta.estado !== "Agendada") {
    throw new Error(
      "Só é possível cancelar consultas agendadas."
    );
  }

  const disponibilidades = obterDisponibilidades();

  const disponibilidade = disponibilidades.find(
    (item) =>
      String(item.id) === String(consulta.disponibilidadeId)
  );

  const consultasActualizadas = consultas.map((item) =>
    String(item.id) === String(consultaId)
      ? { ...item, estado: "Cancelada" }
      : item
  );

  guardarConsultas(consultasActualizadas);

  // Só liberta o horário se ainda existir e estiver associado
  // ao mesmo médico e à mesma consulta.
  if (
    disponibilidade &&
    String(disponibilidade.medicoId) === String(consulta.medicoId) &&
    disponibilidade.estado === "Ocupada"
  ) {
    guardarDisponibilidades(
      disponibilidades.map((item) =>
        String(item.id) === String(disponibilidade.id)
          ? { ...item, estado: "Disponível" }
          : item
      )
    );
  }

  return true;

}

export function marcarConsultaComoRealizada(
  consultaId,
  medicoId
) {
  const consultas = obterConsultas();

  const indice = consultas.findIndex(
    (consulta) =>
      String(consulta.id) === String(consultaId) &&
      String(consulta.medicoId) === String(medicoId)
  );

  if (indice === -1) {
    throw new Error(
      "Consulta não encontrada ou não pertence a este médico."
    );
  }

  const consulta = consultas[indice];

  if (consulta.estado !== "Agendada") {
    throw new Error(
      "Apenas consultas agendadas podem ser marcadas como realizadas."
    );
  }

  consultas[indice] = {
    ...consulta,
    estado: "Realizada",
    realizadaEm: new Date().toISOString(),
  };

  guardarConsultas(consultas);

  return consultas[indice];
}


export function cancelarConsultaPeloMedico(
  consultaId,
  medicoId
) {
  const consultas = obterConsultas();

  const indice = consultas.findIndex(
    (consulta) =>
      String(consulta.id) === String(consultaId) &&
      String(consulta.medicoId) === String(medicoId)
  );

  if (indice === -1) {
    throw new Error(
      "Consulta não encontrada ou não pertence a este médico."
    );
  }

  const consulta = consultas[indice];

  if (consulta.estado !== "Agendada") {
    throw new Error(
      "Apenas consultas agendadas podem ser canceladas."
    );
  }

  consultas[indice] = {
    ...consulta,
    estado: "Cancelada",
    canceladaEm: new Date().toISOString(),
    canceladaPor: "medico",
  };

  guardarConsultas(consultas);

  /*
    A disponibilidade associada deve voltar a ficar
    disponível para uma nova marcação.
  */

  const disponibilidades = obterDisponibilidades();

  const disponibilidadeIndex =
    disponibilidades.findIndex(
      (disponibilidade) =>
        String(disponibilidade.id) ===
        String(consulta.disponibilidadeId)
    );

  if (disponibilidadeIndex !== -1) {
    disponibilidades[disponibilidadeIndex] = {
      ...disponibilidades[disponibilidadeIndex],
      estado: "Disponível",
    };

    guardarDisponibilidades(disponibilidades);
  }

  return consultas[indice];
}
