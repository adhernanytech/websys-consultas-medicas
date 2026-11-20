const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

async function registar(req, res) {
  const { accao, entidade = "interface", entidadeId, descricao = "" } = req.body;
  if (
    typeof accao !== "string" ||
    accao.trim().length < 1 ||
    accao.trim().length > 120 ||
    typeof entidade !== "string" ||
    entidade.length > 100 ||
    typeof descricao !== "string" ||
    descricao.length > 2000 ||
    (entidadeId !== undefined && String(entidadeId).length > 100)
  ) {
    throw new HttpError(400, "Dados de auditoria inválidos.");
  }

  const dados = await prisma.registos_auditoria.create({
    data: {
      usuario_id: BigInt(req.utilizador.id),
      accao: accao.trim(),
      entidade: entidade.trim() || "interface",
      entidade_id: entidadeId === undefined ? null : String(entidadeId),
      descricao: descricao.trim() || null,
      detalhes: descricao.trim() ? { descricao: descricao.trim() } : undefined,
      endereco_ip: req.ip,
      user_agent: req.get("user-agent") || null,
    },
    select: { id: true, criado_em: true },
  });
  return res.status(201).json({ dados });
}

async function listar(_req, res) {
  const registos = await prisma.registos_auditoria.findMany({
    take: 500,
    orderBy: { criado_em: "desc" },
    select: {
      id: true,
      accao: true,
      entidade: true,
      entidade_id: true,
      descricao: true,
      detalhes: true,
      criado_em: true,
      usuario: { select: { nome: true, tipo: true } },
    },
  });

  return res.json({
    dados: registos.map((registo) => ({
      ...registo,
      data: registo.criado_em,
      utilizadorNome: registo.usuario?.nome || "Utilizador",
      utilizadorTipo: registo.usuario?.tipo || "desconhecido",
      acao: registo.accao,
      detalhes: registo.descricao || registo.detalhes?.descricao || "",
    })),
  });
}

module.exports = { registar, listar };
