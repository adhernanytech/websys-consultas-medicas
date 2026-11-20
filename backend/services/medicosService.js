const { prisma } = require("../../config/prisma");
const { HttpError } = require("../src/utils/http");

const seleccaoPublica = {
  id: true,
  especialidade_id: true,
  sexo: true,
  biografia: true,
  experiencia: true,
  telefone: true,
  criado_em: true,
  especialidades: { select: { id: true, nome: true } },
  // Nunca devolver email de login nem password_hash publicamente.
  usuarios: { select: { nome: true, ativo: true } },
};

async function listar({ especialidadeId } = {}) {
  return prisma.medicos.findMany({
    where: {
      ...(especialidadeId ? { especialidade_id: especialidadeId } : {}),
      OR: [{ usuario_id: null }, { usuarios: { is: { ativo: true } } }],
    },
    select: seleccaoPublica,
    orderBy: { id: "asc" },
  });
}

async function obter(id) {
  const medico = await prisma.medicos.findUnique({
    where: { id },
    select: seleccaoPublica,
  });
  if (!medico || (medico.usuarios && !medico.usuarios.ativo)) {
    throw new HttpError(404, "Médico não encontrado.");
  }
  return medico;
}

module.exports = { listar, obter };
