const service = require("../services/especialidadesService");
const { parseId } = require("../utils/http");

async function listar(req, res) {
  const itens = await service.listar({
    incluirInactivas: req.query.incluirInactivas === "true",
  });
  res.json({ dados: itens });
}

async function obter(req, res) {
  res.json({ dados: await service.obterPorId(parseId(req.params.id)) });
}

async function criar(req, res) {
  const item = await service.criar(req.body);
  res.status(201).json({ mensagem: "Especialidade criada.", dados: item });
}

async function actualizar(req, res) {
  const item = await service.actualizar(parseId(req.params.id), req.body);
  res.json({ mensagem: "Especialidade actualizada.", dados: item });
}

module.exports = { listar, obter, criar, actualizar };
