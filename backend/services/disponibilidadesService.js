const { prisma } = require("../../config/prisma");
const { HttpError } = require("../src/utils/http");

function validarDataHora(data, inicio, fim) {
  if (fim <= inicio) throw new HttpError(400, "A hora de fim deve ser posterior à hora de início.");
  const d = new Date(`${data}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== data) {
    throw new HttpError(400, "Data inválida.");
  }
}

async function listar({ medicoId, data, apenasDisponiveis = true } = {}) {
  return prisma.disponibilidades.findMany({
    where: {
      ...(medicoId ? { medico_id: medicoId } : {}),
      ...(data ? { data: new Date(`${data}T00:00:00.000Z`) } : {}),
      ...(apenasDisponiveis ? { estado: "disponivel" } : {}),
    },
    orderBy: [{ data: "asc" }, { hora_inicio: "asc" }],
  });
}

async function criar(dados) {
  validarDataHora(dados.data, dados.hora_inicio, dados.hora_fim);
  const medico = await prisma.medicos.findUnique({
    where: { id: BigInt(dados.medico_id) },
    select: { id: true },
  });
  if (!medico) throw new HttpError(404, "Médico não encontrado.");

  // Os campos TIME são representados como DateTime pelo Prisma.
  const horaInicio = new Date(`1970-01-01T${dados.hora_inicio}:00.000Z`);
  const horaFim = new Date(`1970-01-01T${dados.hora_fim}:00.000Z`);

  return prisma.disponibilidades.create({
    data: {
      medico_id: medico.id,
      data: new Date(`${dados.data}T00:00:00.000Z`),
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      estado: "disponivel",
    },
  });
}

module.exports = { listar, criar };
