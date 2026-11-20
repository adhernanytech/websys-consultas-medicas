const service = require("../services/pacientesService");
const { parseId } = require("../utils/http");

async function obterMeu(req, res) {
  const dados = await service.obterMeu(req.utilizador);
  return res.json({ dados });
}

async function actualizarMeu(req, res) {
  const dados = await service.actualizarMeu(req.utilizador, req.body);
  return res.json({ mensagem: "Perfil do paciente actualizado.", dados });
}

async function obterPorId(req, res) {
  const dados = await service.obterPorId(parseId(req.params.id, "id"));
  return res.json({ dados });
}

module.exports = { obterMeu, actualizarMeu, obterPorId };
