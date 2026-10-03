
import { obterConsultas } from "./consultas";

const CHAVE_DISPONIBILIDADES = "disponibilidades";

function dataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function obterDisponibilidades() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_DISPONIBILIDADES)
    );

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function guardarDisponibilidades(
  disponibilidades
) {
  localStorage.setItem(
    CHAVE_DISPONIBILIDADES,
    JSON.stringify(disponibilidades)
  );
}

export function obterDisponibilidadePorId(id) {
  return obterDisponibilidades().find(
    (item) => String(item.id) === String(id)
  ) || null;
}

export function obterDisponibilidadesDoMedico(
  medicoId
) {
  const hoje = dataLocalISO(new Date());

  return obterDisponibilidades()
    .filter(
      (item) =>
        String(item.medicoId) === String(medicoId) &&
        item.data >= hoje &&
        item.estado === "Disponível"
    )
    .sort((a, b) =>
      `${a.data}T${a.horaInicio}`.localeCompare(
        `${b.data}T${b.horaInicio}`
      )
    );
}

export function obterAgendaDoMedico(medicoId) {
  return obterDisponibilidades()
    .filter(
      (item) =>
        String(item.medicoId) === String(medicoId)
    )
    .sort((a, b) =>
      `${a.data}T${a.horaInicio}`.localeCompare(
        `${b.data}T${b.horaInicio}`
      )
    );
}

export function adicionarDisponibilidade(dados) {
  const {
    medicoId,
    data,
    horaInicio,
    horaFim,
  } = dados;

  if (!medicoId || !data || !horaInicio || !horaFim) {
    throw new Error(
      "Preencha a data, a hora de início e a hora de fim."
    );
  }

  if (data < dataLocalISO(new Date())) {
    throw new Error(
      "A data não pode ser anterior ao dia de hoje."
    );
  }

  if (horaInicio >= horaFim) {
    throw new Error(
      "A hora de fim deve ser posterior à hora de início."
    );
  }

  const disponibilidades = obterDisponibilidades();

  const conflito = disponibilidades.some((item) => {
    if (
      String(item.medicoId) !== String(medicoId) ||
      item.data !== data
    ) {
      return false;
    }

    return (
      horaInicio < item.horaFim &&
      horaFim > item.horaInicio
    );
  });

  if (conflito) {
    throw new Error(
      "Este horário sobrepõe-se a uma disponibilidade já registada."
    );
  }

  const novaDisponibilidade = {
    id: `disp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    medicoId: Number(medicoId),
    data,
    horaInicio,
    horaFim,
    estado: "Disponível",
  };

  guardarDisponibilidades([
    ...disponibilidades,
    novaDisponibilidade,
  ]);

  return novaDisponibilidade;
}

export function removerDisponibilidade(id, medicoId) {
  const disponibilidades = obterDisponibilidades();

  const disponibilidade = disponibilidades.find(
    (item) =>
      String(item.id) === String(id) &&
      String(item.medicoId) === String(medicoId)
  );

  if (!disponibilidade) {
    throw new Error(
      "Disponibilidade não encontrada para este médico."
    );
  }

  const consultas = obterConsultas();

  const temConsultaActiva = consultas.some(
    (consulta) =>
      String(consulta.disponibilidadeId) === String(id) &&
      consulta.estado !== "Cancelada"
  );

  if (
    disponibilidade.estado === "Ocupada" ||
    temConsultaActiva
  ) {
    throw new Error(
      "Este horário tem uma consulta associada e não pode ser removido."
    );
  }

  guardarDisponibilidades(
    disponibilidades.filter(
      (item) => String(item.id) !== String(id)
    )
  );

  return true;
}
