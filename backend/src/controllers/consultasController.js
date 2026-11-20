
const service = require("../services/consultasService");
const { parseId } = require("../utils/http");

async function listar(req, res) {
  const dados = await service.listarDoUtilizador(req.utilizador);

  res.json({ dados });
}

async function obter(req, res) {
  const dados = await service.obter(
    req.utilizador,
    parseId(req.params.id)
  );
  return res.json({ dados });
}

async function marcar(req, res) {
  const dados = await service.marcar(
    req.utilizador,
    req.body
  );

  res.status(201).json({
    mensagem: "Pedido de consulta registado.",
    dados,
  });
}

async function actualizarEstado(req, res) {
  const dados = await service.actualizarEstado(
    req.utilizador,
    parseId(req.params.id),
    req.body.estado
  );

  res.json({
    mensagem: "Estado da consulta actualizado.",
    dados,
  });
}

async function actualizar(req, res) {
  const dados = await service.reagendar(
    req.utilizador,
    parseId(req.params.id),
    req.body
  );
  return res.json({ mensagem: "Consulta reagendada.", dados });
}

module.exports = {
  listar,
  obter,
  marcar,
  actualizarEstado,
  actualizar,
};
