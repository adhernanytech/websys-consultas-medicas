const service = require("../services/registosClinicosService");
const { parseId } = require("../utils/http");

async function listar(req, res) {
  const consultaId = req.query.consulta_id
    ? parseId(req.query.consulta_id, "consulta_id")
    : undefined;
  const pacienteId = req.query.paciente_id
    ? parseId(req.query.paciente_id, "paciente_id")
    : undefined;
  return res.json({
    dados: await service.listar(req.utilizador, { consultaId, pacienteId }),
  });
}

async function obter(req, res) {
  return res.json({
    dados: await service.obter(req.utilizador, parseId(req.params.id)),
  });
}

async function obterPorConsulta(req, res) {
  const dados = await service.listar(req.utilizador, {
    consultaId: parseId(req.params.consultaId, "consulta_id"),
  });
  if (!dados.length) {
    return res.status(404).json({ erro: "Registo clínico não encontrado." });
  }
  return res.json({ dados: dados[0] });
}

async function criar(req, res) {
  const dados = await service.guardar(
    req.utilizador,
    parseId(req.params.consultaId, "consulta_id"),
    req.body,
    "create"
  );
  return res.status(201).json({ mensagem: "Registo clínico criado.", dados });
}

async function actualizar(req, res) {
  const dados = await service.guardar(
    req.utilizador,
    parseId(req.params.consultaId, "consulta_id"),
    req.body,
    "update"
  );
  return res.json({ mensagem: "Registo clínico actualizado.", dados });
}

export { listar, obter, obterPorConsulta, criar, actualizar };
