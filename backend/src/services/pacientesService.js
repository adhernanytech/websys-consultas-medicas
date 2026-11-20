const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

async function obterMeu(utilizador) {
  const paciente = await prisma.pacientes.findUnique({
    where: { usuario_id: BigInt(utilizador.id) },
    select: {
      id: true,
      usuario_id: true,
      telefone: true,
      data_nascimento: true,
      sexo: true,
      endereco: true,
      numero_documento: true,
      criado_em: true,
      actualizado_em: true,
      usuario: {
        select: { id: true, nome: true, email: true, tipo: true, ativo: true },
      },
    },
  });

  if (!paciente) {
    throw new HttpError(404, "Perfil de paciente não encontrado.");
  }

  return paciente;
}

async function actualizarMeu(utilizador, dados) {
  const paciente = await prisma.pacientes.findUnique({
    where: { usuario_id: BigInt(utilizador.id) },
    select: { id: true },
  });

  if (!paciente) {
    throw new HttpError(404, "Perfil de paciente não encontrado.");
  }

  const actualizacao = {};
  if (dados.telefone !== undefined) actualizacao.telefone = dados.telefone || null;
  if (dados.data_nascimento !== undefined) actualizacao.data_nascimento = dados.data_nascimento ? new Date(dados.data_nascimento) : null;
  if (dados.sexo !== undefined) actualizacao.sexo = dados.sexo || null;
  if (dados.endereco !== undefined) actualizacao.endereco = dados.endereco || null;
  if (dados.numero_documento !== undefined) actualizacao.numero_documento = dados.numero_documento || null;

  return prisma.$transaction(async (tx) => {
    if (dados.nome !== undefined) {
      await tx.usuarios.update({
        where: { id: BigInt(utilizador.id) },
        data: { nome: dados.nome },
      });
    }

    return tx.pacientes.update({
      where: { id: paciente.id },
      data: actualizacao,
      select: {
        id: true,
        usuario_id: true,
        telefone: true,
        data_nascimento: true,
        sexo: true,
        endereco: true,
        numero_documento: true,
        actualizado_em: true,
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });
  });
}

async function obterPorId(id) {
  const paciente = await prisma.pacientes.findUnique({
    where: { id },
    select: {
      id: true,
      usuario_id: true,
      telefone: true,
      data_nascimento: true,
      sexo: true,
      endereco: true,
      numero_documento: true,
      usuario: { select: { id: true, nome: true, email: true } },
    },
  });

  if (!paciente) {
    throw new HttpError(404, "Paciente não encontrado.");
  }

  return paciente;
}

module.exports = { obterMeu, actualizarMeu, obterPorId };
