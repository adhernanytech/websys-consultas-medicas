const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

async function listar({ incluirInactivas = false } = {}) {
  return prisma.especialidades.findMany({
    where: incluirInactivas ? {} : { ativo: true },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      descricao: true,
      ativo: true,
      criado_em: true,
      actualizado_em: true,
    },
  });
}

async function obterPorId(id) {
  const item = await prisma.especialidades.findUnique({
    where: { id },
    select: {
      id: true, nome: true, descricao: true, ativo: true,
      criado_em: true, actualizado_em: true,
    },
  });
  if (!item) throw new HttpError(404, "Especialidade não encontrada.");
  return item;
}

async function criar(dados) {
  return prisma.especialidades.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao ?? null,
      ativo: dados.ativo ?? true,
    },
  });
}

async function actualizar(id, dados) {
  await obterPorId(id);
  return prisma.especialidades.update({
    where: { id },
    data: {
      ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
      ...(dados.descricao !== undefined ? { descricao: dados.descricao } : {}),
      ...(dados.ativo !== undefined ? { ativo: dados.ativo } : {}),
      actualizado_em: new Date(),
    },
  });
}

module.exports = { listar, obterPorId, criar, actualizar };
