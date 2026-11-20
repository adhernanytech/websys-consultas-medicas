
const {
  formatarDisponibilidade,
} = require("../utils/formatarDisponibilidades");

const service = require("../services/disponibilidadesService");
const { parseId } = require("../utils/http");

async function listar(req, res) {
  const medicoId = req.query.medico_id
    ? parseId(req.query.medico_id, "medico_id")
    : undefined;

  const data = req.query.data;

  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return res.status(400).json({
      erro: "O parâmetro data deve usar o formato AAAA-MM-DD.",
    });
  }

  const disponibilidades = await service.listar({
    medicoId,
    data,
    apenasDisponiveis: req.query.todas !== "true",
  });

  return res.json({
    dados: disponibilidades.map(formatarDisponibilidade),
  });
}

async function criar(req, res) {
  const disponibilidade = await service.criar(
    req.utilizador,
    req.body
  );

  return res.status(201).json({
    mensagem: "Disponibilidade criada.",
    dados: formatarDisponibilidade(disponibilidade),
  });
}

async function actualizar(req, res) {
  const disponibilidade = await service.actualizar(
    req.utilizador,
    parseId(req.params.id),
    req.body
  );
  return res.json({
    mensagem: "Disponibilidade actualizada.",
    dados: formatarDisponibilidade(disponibilidade),
  });
}

async function cancelar(req, res) {
  const disponibilidade = await service.cancelar(
    req.utilizador,
    parseId(req.params.id)
  );
  return res.json({
    mensagem: "Disponibilidade cancelada.",
    dados: formatarDisponibilidade(disponibilidade),
  });
}

module.exports = {
  listar,
  criar,
  actualizar,
  cancelar,
};
