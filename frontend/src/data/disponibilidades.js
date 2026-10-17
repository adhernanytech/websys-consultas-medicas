
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
  const agora = new Date();

  return obterDisponibilidades()
    .filter(
      (item) => {
        if (
          String(item.medicoId) !== String(medicoId) ||
          item.estado !== "Disponível" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(item.data || "") ||
          !horaValida(item.horaInicio) ||
          !horaValida(item.horaFim) ||
          item.horaInicio >= item.horaFim
        ) {
          return false;
        }

        const data = new Date(`${item.data}T${item.horaInicio}:00`);

        return (
          !Number.isNaN(data.getTime()) &&
          dataLocalISO(data) === item.data &&
          data.getTime() > agora.getTime()
        );
      }
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

  if (
    data === dataLocalISO() &&
    new Date(`${data}T${horaInicio}:00`).getTime() <= Date.now()
  ) {
    throw new Error(
      "A hora de início tem de ser futura quando selecciona o dia de hoje."
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

export function actualizarDisponibilidade(
  id,
  medicoId,
  dados,
  consultas = []
) {
  const disponibilidades = obterDisponibilidades();
  const indice = disponibilidades.findIndex(
    (item) =>
      String(item.id) === String(id) &&
      String(item.medicoId) === String(medicoId)
  );

  if (indice === -1) {
    throw new Error(
      "Disponibilidade não encontrada para este médico."
    );
  }

  const disponibilidadeActual = disponibilidades[indice];
  if (
    disponibilidadeActual.estado !== "Disponível" ||
    consultas.some(
      (consulta) =>
        String(consulta.disponibilidadeId) === String(id) &&
        consulta.estado !== "Cancelada"
    )
  ) {
    throw new Error(
      "Só é possível editar um horário disponível sem consulta associada."
    );
  }

  const { data, horaInicio, horaFim } = dados || {};

  if (!data || !horaInicio || !horaFim) {
    throw new Error(
      "Preencha a data, a hora de início e a hora de fim."
    );
  }

  const dataObjecto = /^\d{4}-\d{2}-\d{2}$/.test(data)
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
    throw new Error("A data não pode ser anterior ao dia de hoje.");
  }

  if (!horaValida(horaInicio) || !horaValida(horaFim)) {
    throw new Error("Indique horas válidas no formato HH:MM.");
  }

  if (horaInicio >= horaFim) {
    throw new Error(
      "A hora de fim deve ser posterior à hora de início."
    );
  }

  if (
    data === dataLocalISO() &&
    new Date(`${data}T${horaInicio}:00`).getTime() <= Date.now()
  ) {
    throw new Error(
      "A hora de início tem de ser futura quando selecciona o dia de hoje."
    );
  }

  const conflito = disponibilidades.some(
    (item) =>
      String(item.medicoId) === String(medicoId) &&
      String(item.id) !== String(id) &&
      item.data === data &&
      horaInicio < item.horaFim &&
      horaFim > item.horaInicio
  );

  if (conflito) {
    throw new Error(
      "Este horário sobrepõe-se a uma disponibilidade já registada."
    );
  }

  disponibilidades[indice] = {
    ...disponibilidadeActual,
    data,
    horaInicio,
    horaFim,
  };

  guardarDisponibilidades(disponibilidades);

  return disponibilidades[indice];
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
