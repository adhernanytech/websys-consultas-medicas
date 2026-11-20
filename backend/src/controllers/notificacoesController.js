const service = require("../services/notificacoesService");
const { parseId } = require("../utils/http");

async function listar(req, res) {
  const dados = await service.listar(req.utilizador, {
    apenasNaoLidas: req.query.nao_lidas === "true",
  });
  return res.json({ dados });
}

async function marcarLida(req, res) {
  const dados = await service.marcarLida(
    req.utilizador,
    parseId(req.params.id)
  );
  return res.json({ mensagem: "Notificação marcada como lida.", dados });
}

async function marcarTodasLidas(req, res) {
  const dados = await service.marcarTodasLidas(req.utilizador);
  return res.json({ mensagem: "Notificações marcadas como lidas.", dados });
}

async function remover(req, res) {
  await service.remover(req.utilizador, parseId(req.params.id));
  return res.status(204).end();
}

module.exports = { listar, marcarLida, marcarTodasLidas, remover };
