
const service = require("../services/medicosService");
const { parseId, HttpError } = require("../utils/http");

// Converte BigInt em string para que a resposta possa ser serializada em JSON.
function serializarBigInt(valor) {
  if (typeof valor === "bigint") {
    return valor.toString();
  }

  if (Array.isArray(valor)) {
    return valor.map(serializarBigInt);
  }

  if (valor !== null && typeof valor === "object" && !(valor instanceof Date)) {
    return Object.fromEntries(
      Object.entries(valor).map(([chave, item]) => [
        chave,
        serializarBigInt(item),
      ])
    );
  }

  return valor;
}

// GET /api/medicos
async function listar(req, res) {
  const especialidadeId = req.query.especialidade_id
    ? parseId(req.query.especialidade_id, "especialidade_id")
    : undefined;

  const dados = await service.listar({ especialidadeId });

  return res.json({
    dados: serializarBigInt(dados),
  });
}

// GET /api/medicos/:id
async function obter(req, res) {
  const medicoId = parseId(req.params.id, "id");

  const dados = await service.obter(medicoId);

  return res.json({
    dados: serializarBigInt(dados),
  });
}

// POST /api/medicos
// A rota deve estar protegida por autenticação e permissão de administrador.
async function criarConta(req, res) {
  const { nome, email, sexo, especialidade_id, fotografia_url } = req.body || {};

  if (
    typeof nome !== "string" ||
    !nome.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    especialidade_id === undefined ||
    especialidade_id === null ||
    String(especialidade_id).trim() === ""
  ) {
    throw new HttpError(
      400,
      "Nome, email e especialidade são obrigatórios."
    );
  }

  const dados = await service.criarConta({
    nome: nome.trim(),
    email: email.trim(),
    sexo,
    fotografiaUrl: fotografia_url,
    especialidadeId: parseId(
      String(especialidade_id),
      "especialidade_id"
    ),
  });

  return res.status(201).json({
    mensagem:
      "Conta médica criada. Guarde as credenciais apresentadas nesta resposta; a senha inicial não será novamente apresentada.",
    dados: serializarBigInt(dados),
  });
}

// PATCH /api/medicos/:id/estado
// A rota deve estar protegida por autenticação e permissão de administrador.
async function alterarEstadoConta(req, res) {
  const { ativo } = req.body || {};

  if (typeof ativo !== "boolean") {
    throw new HttpError(
      400,
      "O campo 'ativo' deve ser true ou false."
    );
  }

  const medicoId = parseId(req.params.id, "id");

  const dados = await service.alterarEstadoConta(medicoId, ativo);

  return res.json({
    mensagem: ativo
      ? "Conta médica activada."
      : "Conta médica desactivada.",
    dados: serializarBigInt(dados),
  });
}

async function obterMeu(req, res) {
  const dados = await service.obterMeu(req.utilizador);
  return res.json({ dados: serializarBigInt(dados) });
}

async function actualizarMeu(req, res) {
  const dados = await service.actualizarMeu(req.utilizador, req.body);
  return res.json({ mensagem: "Perfil médico actualizado.", dados: serializarBigInt(dados) });
}

module.exports = {
  listar,
  obter,
  criarConta,
  alterarEstadoConta,
  obterMeu,
  actualizarMeu,
};
