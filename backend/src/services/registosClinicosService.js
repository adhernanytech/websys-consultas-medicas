const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

const camposClinicos = [
  "queixa_principal",
  "observacoes",
  "diagnostico",
  "tratamento",
  "prescricao",
  "notas",
  "recomendacoes",
];

const seleccao = {
  id: true,
  consulta_id: true,
  queixa_principal: true,
  observacoes: true,
  diagnostico: true,
  tratamento: true,
  prescricao: true,
  notas: true,
  recomendacoes: true,
  criado_em: true,
  actualizado_em: true,
  consulta: {
    select: {
      id: true,
      paciente_id: true,
      medico_id: true,
      estado: true,
      disponibilidade: {
        select: { data: true, hora_inicio: true, hora_fim: true },
      },
      paciente: {
        select: {
          id: true,
          usuario: { select: { id: true, nome: true } },
        },
      },
      medico: {
        select: {
          id: true,
          usuario: { select: { id: true, nome: true } },
        },
      },
    },
  },
};

function wherePorUtilizador(utilizador) {
  if (utilizador.tipo === "admin") return {};
  if (utilizador.tipo === "medico") {
    return { consulta: { medico: { usuario_id: BigInt(utilizador.id) } } };
  }
  if (utilizador.tipo === "paciente") {
    return { consulta: { paciente: { usuario_id: BigInt(utilizador.id) } } };
  }
  throw new HttpError(403, "Perfil sem permissões para consultar registos clínicos.");
}

async function listar(utilizador, { consultaId, pacienteId } = {}) {
  const where = wherePorUtilizador(utilizador);
  if (consultaId) where.consulta_id = BigInt(consultaId);
  if (pacienteId) {
    if (utilizador.tipo === "paciente") {
      throw new HttpError(403, "Não pode consultar registos de outro paciente.");
    }
    where.consulta = {
      ...where.consulta,
      paciente_id: BigInt(pacienteId),
    };
  }

  return prisma.registos_clinicos.findMany({
    where,
    select: seleccao,
    orderBy: { actualizado_em: "desc" },
  });
}

async function obter(utilizador, id) {
  const registo = await prisma.registos_clinicos.findFirst({
    where: { id, ...wherePorUtilizador(utilizador) },
    select: seleccao,
  });
  if (!registo) throw new HttpError(404, "Registo clínico não encontrado.");
  return registo;
}

async function guardar(utilizador, consultaId, dados, modo = "upsert") {
  if (utilizador.tipo !== "medico") {
    throw new HttpError(403, "Só o médico responsável pode gerir o registo clínico.");
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const medico = await tx.medicos.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });
    if (!medico) throw new HttpError(404, "Perfil de médico não encontrado.");

    const consulta = await tx.consultas.findUnique({
      where: { id: consultaId },
      select: { id: true, medico_id: true, estado: true },
    });
    if (!consulta) throw new HttpError(404, "Consulta não encontrada.");
    if (consulta.medico_id !== medico.id) {
      throw new HttpError(403, "Não pode gerir o registo clínico de outro médico.");
    }
    if (consulta.estado !== "concluida") {
      throw new HttpError(409, "O registo clínico só pode ser criado após a consulta ser concluída.");
    }

    const existente = await tx.registos_clinicos.findUnique({
      where: { consulta_id: consulta.id },
      select: { id: true },
    });
    if (modo === "create" && existente) {
      throw new HttpError(409, "Esta consulta já possui um registo clínico.");
    }
    if (modo === "update" && !existente) {
      throw new HttpError(404, "Registo clínico não encontrado.");
    }

    const data = Object.fromEntries(
      camposClinicos
        .filter((campo) => dados[campo] !== undefined)
        .map((campo) => [campo, dados[campo]])
    );

    if (existente) {
      return tx.registos_clinicos.update({
        where: { id: existente.id },
        data,
        select: seleccao,
      });
    }

    return tx.registos_clinicos.create({
      data: { consulta_id: consulta.id, ...data },
      select: seleccao,
    });
  });

  return resultado;
}

module.exports = { listar, obter, guardar };
