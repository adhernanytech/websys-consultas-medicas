
import {
  obterDisponibilidades,
  guardarDisponibilidades,
} from "./disponibilidades";

const CHAVE_CONSULTAS = "consultas";

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
      String(consulta.disponibilidadeId) === String(disponibilidadeId) &&
      consulta.estado !== "Cancelada"
  );
}

export function criarConsulta(dados) {
  const disponibilidades = obterDisponibilidades();

  const disponibilidade = disponibilidades.find(
    (item) =>
      String(item.id) === String(dados.disponibilidadeId)
  );

  if (!disponibilidade) {
    throw new Error("A disponibilidade seleccionada não existe.");
  }

  if (disponibilidade.estado !== "Disponível") {
    throw new Error("Este horário já não está disponível.");
  }

  if (new Date(`${disponibilidade.data}T${disponibilidade.horaInicio}:00`) <= new Date()) {
    throw new Error("Não é possível marcar uma consulta para um horário passado.");
  }

  if (disponibilidadeEstaOcupada(disponibilidade.id)) {
    throw new Error("Este horário já foi reservado.");
  }

  const consultas = obterConsultas();

  const novaConsulta = {
    id: `cons-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pacienteId: dados.pacienteId,
    pacienteNome: dados.pacienteNome,
    pacienteEmail: dados.pacienteEmail,
    medicoId: disponibilidade.medicoId,
    medicoNome: dados.medicoNome,
    especialidade: dados.especialidade,
    disponibilidadeId: disponibilidade.id,
    data: disponibilidade.data,
    horario: disponibilidade.horaInicio,
    horaFim: disponibilidade.horaFim,
    motivo: dados.motivo.trim(),
    estado: "Agendada",
    criadaEm: new Date().toISOString(),
  };

  guardarConsultas([...consultas, novaConsulta]);

  guardarDisponibilidades(
    disponibilidades.map((item) =>
      String(item.id) === String(disponibilidade.id)
        ? { ...item, estado: "Ocupada" }
        : item
    )
  );

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
    throw new Error("Não foi encontrada uma consulta deste paciente.");
  }

  if (consulta.estado !== "Agendada") {
    throw new Error("Só é possível cancelar consultas agendadas.");
  }

  guardarConsultas(
    consultas.map((item) =>
      String(item.id) === String(consultaId)
        ? { ...item, estado: "Cancelada" }
        : item
    )
  );

  const disponibilidades = obterDisponibilidades();

  guardarDisponibilidades(
    disponibilidades.map((item) =>
      String(item.id) === String(consulta.disponibilidadeId)
        ? { ...item, estado: "Disponível" }
        : item
    )
  );

  return true;
}
