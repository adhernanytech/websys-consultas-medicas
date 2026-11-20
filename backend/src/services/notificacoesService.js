const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

async function criar(tx, { utilizadorId, titulo, mensagem, tipo, consultaId }) {
  return tx.notificacoes.create({
    data: {
      usuario_id: BigInt(utilizadorId),
      titulo,
      mensagem,
      tipo: tipo || "consulta",
      consulta_id: consultaId ? BigInt(consultaId) : null,
    },
  });
}

async function listar(utilizador, { apenasNaoLidas = false } = {}) {
  return prisma.notificacoes.findMany({
    where: {
      usuario_id: BigInt(utilizador.id),
      ...(apenasNaoLidas ? { lida: false } : {}),
    },
    orderBy: { criado_em: "desc" },
    take: 100,
  });
}

async function marcarLida(utilizador, id) {
  const resultado = await prisma.notificacoes.updateMany({
    where: { id, usuario_id: BigInt(utilizador.id), lida: false },
    data: { lida: true, lida_em: new Date() },
  });

  if (resultado.count === 0) {
    const existente = await prisma.notificacoes.findFirst({
      where: { id, usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });

    if (!existente) {
      throw new HttpError(404, "Notificação não encontrada.");
    }
  }

  return prisma.notificacoes.findFirst({
    where: { id, usuario_id: BigInt(utilizador.id) },
  });
}

async function marcarTodasLidas(utilizador) {
  const resultado = await prisma.notificacoes.updateMany({
    where: { usuario_id: BigInt(utilizador.id), lida: false },
    data: { lida: true, lida_em: new Date() },
  });

  return { actualizadas: resultado.count };
}

async function remover(utilizador, id) {
  const resultado = await prisma.notificacoes.deleteMany({
    where: { id, usuario_id: BigInt(utilizador.id) },
  });

  if (resultado.count !== 1) {
    throw new HttpError(404, "Notificação não encontrada.");
  }
}

module.exports = { criar, listar, marcarLida, marcarTodasLidas, remover };
