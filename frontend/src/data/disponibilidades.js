
const CHAVE_DISPONIBILIDADES = "disponibilidades";

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function horaValida(hora) {
  if (typeof hora !== "string") return false;

  const correspondencia = hora.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  return Boolean(correspondencia);
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

export function guardarDisponibilidades(disponibilidades) {
  if (!Array.isArray(disponibilidades)) {
    throw new Error("A lista de disponibilidades é inválida.");
  }

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

export function obterDisponibilidadesDoMedico(medicoId) {
  const hoje = dataLocalISO();

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
  } = dados || {};

  if (
    medicoId === undefined ||
    medicoId === null ||
    !data ||
    !horaInicio ||
    !horaFim
  ) {
    throw new Error(
      "Preencha o médico, a data, a hora de início e a hora de fim."
    );
  }

  if (!horaValida(horaInicio) || !horaValida(horaFim)) {
    throw new Error("Indique horas válidas no formato HH:MM.");
  }

  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data);
  const dataObjecto = dataValida
    ? new Date(`${data}T12:00:00`)
    : null;

  if (
    !dataObjecto ||
    Number.isNaN(dataObjecto.getTime()) ||
    dataLocalISO(dataObjecto) !== data
  ) {
    throw new Error("Indique uma data válida.");
  }

  if (data < dataLocalISO()) {
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

    // Horários que se sobrepõem não podem coexistir.
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
    medicoId,
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

/**
 * Recebe a lista de consultas como argumento para evitar
 * a dependência circular com consultas.js.
 */
export function removerDisponibilidade(
  id,
  medicoId,
  consultas = []
) {
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
