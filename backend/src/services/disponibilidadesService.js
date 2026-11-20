
const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

const FUSO_HORARIO = "Africa/Luanda";

function obterDataHoraLuanda() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  return {
    data: `${valores.year}-${valores.month}-${valores.day}`,
    hora: `${valores.hour}:${valores.minute}`,
  };
}

function validarDataHora(data, inicio, fim) {
  if (
    typeof data !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data)
  ) {
    throw new HttpError(400, "A data deve usar o formato AAAA-MM-DD.");
  }

  const dataObj = new Date(`${data}T00:00:00.000Z`);

  if (
    Number.isNaN(dataObj.getTime()) ||
    dataObj.toISOString().slice(0, 10) !== data
  ) {
    throw new HttpError(400, "Data inválida.");
  }

  const validarHora = (hora) =>
    typeof hora === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

  if (!validarHora(inicio) || !validarHora(fim)) {
    throw new HttpError(
      400,
      "As horas devem usar o formato HH:mm válido."
    );
  }

  if (fim <= inicio) {
    throw new HttpError(
      400,
      "A hora de fim deve ser posterior à hora de início."
    );
  }

  return dataObj;
}

async function listar({
  medicoId,
  data,
  apenasDisponiveis = true,
} = {}) {
  let dataObj;

  if (data !== undefined) {
    if (
      typeof data !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
      throw new HttpError(
        400,
        "A data deve usar o formato AAAA-MM-DD."
      );
    }

    dataObj = new Date(`${data}T00:00:00.000Z`);

    if (
      Number.isNaN(dataObj.getTime()) ||
      dataObj.toISOString().slice(0, 10) !== data
    ) {
      throw new HttpError(400, "Data inválida.");
    }
  }

  return prisma.disponibilidades.findMany({
    where: {
      ...(medicoId ? { medico_id: BigInt(medicoId) } : {}),
      ...(dataObj ? { data: dataObj } : {}),
      ...(apenasDisponiveis ? { estado: "disponivel" } : {}),
    },
    orderBy: [
      { data: "asc" },
      { hora_inicio: "asc" },
    ],
  });
}

async function criar(utilizador, dados) {
  const dataObj = validarDataHora(
    dados.data,
    dados.hora_inicio,
    dados.hora_fim
  );

  const medicoId = BigInt(dados.medico_id);

  const medico = await prisma.medicos.findUnique({
    where: { id: medicoId },
    select: {
      id: true,
      usuario_id: true,
    },
  });

  if (!medico) {
    throw new HttpError(404, "Médico não encontrado.");
  }

  if (!["admin", "medico"].includes(utilizador.tipo)) {
    throw new HttpError(
      403,
      "Sem permissões para criar disponibilidades."
    );
  }

  // Um médico só pode gerir as próprias disponibilidades.
  if (
    utilizador.tipo === "medico" &&
    medico.usuario_id !== BigInt(utilizador.id)
  ) {
    throw new HttpError(
      403,
      "Não pode criar disponibilidades para outro médico."
    );
  }

  // Verificação com a data e hora locais de Angola.
  const agoraLuanda = obterDataHoraLuanda();

  if (dados.data < agoraLuanda.data) {
    throw new HttpError(
      400,
      "Não é possível criar disponibilidades em datas passadas."
    );
  }

  if (
    dados.data === agoraLuanda.data &&
    dados.hora_inicio <= agoraLuanda.hora
  ) {
    throw new HttpError(
      400,
      "Não é possível criar disponibilidades com hora de início passada ou actual."
    );
  }

  // O Prisma representa os campos TIME como Date.
  // A data de referência 1970-01-01 é apenas técnica.
  // O horário real continua a ser HH:mm.
  const horaInicio = new Date(
    `1970-01-01T${dados.hora_inicio}:00.000Z`
  );

  const horaFim = new Date(
    `1970-01-01T${dados.hora_fim}:00.000Z`
  );

  return prisma.$transaction(async (tx) => {
    // Impede sobreposição de horários do mesmo médico e dia.
    // Horários adjacentes continuam permitidos.
    const conflito = await tx.disponibilidades.findFirst({
      where: {
        medico_id: medico.id,
        data: dataObj,
        estado: { not: "cancelada" },
        hora_inicio: { lt: horaFim },
        hora_fim: { gt: horaInicio },
      },
      select: {
        id: true,
      },
    });

    if (conflito) {
      throw new HttpError(
        409,
        "Já existe uma disponibilidade sobreposta para este médico."
      );
    }

    return tx.disponibilidades.create({
      data: {
        medico_id: medico.id,
        data: dataObj,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        estado: "disponivel",
      },
    });
  });
}

async function obterDoMedico(utilizador, id, tx = prisma) {
  const disponibilidade = await tx.disponibilidades.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      medico_id: true,
      estado: true,
      data: true,
      hora_inicio: true,
      hora_fim: true,
      medico: { select: { usuario_id: true } },
    },
  });

  if (!disponibilidade) {
    throw new HttpError(404, "Disponibilidade não encontrada.");
  }
  if (
    utilizador.tipo === "medico" &&
    disponibilidade.medico.usuario_id !== BigInt(utilizador.id)
  ) {
    throw new HttpError(403, "Não pode gerir disponibilidades de outro médico.");
  }
  if (!["admin", "medico"].includes(utilizador.tipo)) {
    throw new HttpError(403, "Sem permissões para gerir disponibilidades.");
  }
  return disponibilidade;
}

async function actualizar(utilizador, id, dados) {
  const dataObj = validarDataHora(dados.data, dados.hora_inicio, dados.hora_fim);
  return prisma.$transaction(async (tx) => {
    const disponibilidade = await obterDoMedico(utilizador, id, tx);
    if (disponibilidade.estado !== "disponivel") {
      throw new HttpError(409, "Só é possível editar horários disponíveis.");
    }
    const associada = await tx.consultas.findFirst({
      where: {
        disponibilidade_id: disponibilidade.id,
        estado: { in: ["pendente", "confirmada"] },
      },
      select: { id: true },
    });
    if (associada) {
      throw new HttpError(409, "Não pode editar um horário associado a uma consulta activa.");
    }

    const agoraLuanda = obterDataHoraLuanda();
    if (dados.data < agoraLuanda.data ||
      (dados.data === agoraLuanda.data && dados.hora_inicio <= agoraLuanda.hora)) {
      throw new HttpError(400, "A disponibilidade tem de começar no futuro.");
    }

    const horaInicio = new Date(`1970-01-01T${dados.hora_inicio}:00.000Z`);
    const horaFim = new Date(`1970-01-01T${dados.hora_fim}:00.000Z`);
    const conflito = await tx.disponibilidades.findFirst({
      where: {
        id: { not: disponibilidade.id },
        medico_id: disponibilidade.medico_id,
        data: dataObj,
        estado: { not: "cancelada" },
        hora_inicio: { lt: horaFim },
        hora_fim: { gt: horaInicio },
      },
      select: { id: true },
    });
    if (conflito) {
      throw new HttpError(409, "Já existe uma disponibilidade sobreposta para este médico.");
    }

    return tx.disponibilidades.update({
      where: { id: disponibilidade.id },
      data: {
        data: dataObj,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        actualizado_em: new Date(),
      },
    });
  });
}

async function cancelar(utilizador, id) {
  return prisma.$transaction(async (tx) => {
    const disponibilidade = await obterDoMedico(utilizador, id, tx);
    if (disponibilidade.estado === "cancelada") return disponibilidade;
    if (disponibilidade.estado !== "disponivel") {
      throw new HttpError(409, "Não pode remover um horário que já foi reservado.");
    }

    const associada = await tx.consultas.findFirst({
      where: {
        disponibilidade_id: disponibilidade.id,
        estado: { in: ["pendente", "confirmada"] },
      },
      select: { id: true },
    });
    if (associada) {
      throw new HttpError(409, "Não pode remover um horário associado a uma consulta activa.");
    }

    return tx.disponibilidades.update({
      where: { id: disponibilidade.id },
      data: { estado: "cancelada", actualizado_em: new Date() },
    });
  });
}

module.exports = {
  listar,
  criar,
  actualizar,
  cancelar,
};
