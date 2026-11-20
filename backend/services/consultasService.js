const { prisma } = require("../../config/prisma");
const { HttpError } = require("../src/utils/http");

const consultaSelect = {
  id: true,
  paciente_id: true,
  medico_id: true,
  disponibilidade_id: true,
  estado: true,
  motivo: true,
  criado_em: true,
  actualizado_em: true,
  disponibilidades: {
    select: {
      id: true, medico_id: true, data: true, hora_inicio: true, hora_fim: true, estado: true,
    },
  },
  pacientes: {
    select: {
      id: true,
      usuarios: { select: { id: true, nome: true, email: true } },
    },
  },
};

async function listarDoUtilizador(utilizador) {
  if (utilizador.tipo === "admin") {
    return prisma.consultas.findMany({
      select: consultaSelect,
      orderBy: { criado_em: "desc" },
    });
  }

  if (utilizador.tipo === "paciente") {
    const paciente = await prisma.pacientes.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });
    if (!paciente) throw new HttpError(404, "Perfil de paciente não encontrado.");
    return prisma.consultas.findMany({
      where: { paciente_id: paciente.id },
      select: consultaSelect,
      orderBy: { criado_em: "desc" },
    });
  }

  if (utilizador.tipo === "medico") {
    const medico = await prisma.medicos.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });
    if (!medico) throw new HttpError(404, "Perfil de médico não encontrado.");
    return prisma.consultas.findMany({
      where: { medico_id: medico.id },
      select: consultaSelect,
      orderBy: { criado_em: "desc" },
    });
  }

  throw new HttpError(403, "Perfil sem permissões para consultar marcações.");
}

async function marcar(utilizador, dados) {
  if (utilizador.tipo !== "paciente") {
    throw new HttpError(403, "Só um paciente pode marcar uma consulta.");
  }

  const paciente = await prisma.pacientes.findUnique({
    where: { usuario_id: BigInt(utilizador.id) },
    select: { id: true },
  });
  if (!paciente) throw new HttpError(404, "Perfil de paciente não encontrado.");

  const disponibilidadeId = BigInt(dados.disponibilidade_id);

  return prisma.$transaction(async (tx) => {
    const horario = await tx.disponibilidades.findUnique({
      where: { id: disponibilidadeId },
    });
    if (!horario || horario.estado !== "disponivel") {
      throw new HttpError(409, "Este horário já não está disponível.");
    }

    // A disponibilidade determina o médico; não aceitamos medico_id do cliente.
    const existente = await tx.consultas.findFirst({
      where: {
        disponibilidade_id: disponibilidadeId,
        estado: { in: ["pendente", "confirmada"] },
      },
      select: { id: true },
    });
    if (existente) throw new HttpError(409, "Este horário já foi reservado.");

    const consulta = await tx.consultas.create({
      data: {
        paciente_id: paciente.id,
        medico_id: horario.medico_id,
        disponibilidade_id: horario.id,
        motivo: dados.motivo ?? null,
        estado: "pendente",
      },
      select: consultaSelect,
    });

    await tx.disponibilidades.update({
      where: { id: horario.id },
      data: { estado: "reservada", actualizado_em: new Date() },
    });

    return consulta;
  });
}

async function actualizarEstado(utilizador, consultaId, novoEstado) {
  const estadosPermitidos = ["confirmada", "concluida", "cancelada", "rejeitada"];
  if (!estadosPermitidos.includes(novoEstado)) {
    throw new HttpError(400, "Estado de consulta inválido.");
  }

  const consulta = await prisma.consultas.findUnique({
    where: { id: consultaId },
    include: { disponibilidades: true },
  });
  if (!consulta) throw new HttpError(404, "Consulta não encontrada.");

  if (utilizador.tipo === "paciente") {
    const paciente = await prisma.pacientes.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });
    if (!paciente || consulta.paciente_id !== paciente.id) {
      throw new HttpError(403, "Só pode alterar as suas próprias consultas.");
    }
    if (novoEstado !== "cancelada" || !["pendente", "confirmada"].includes(consulta.estado)) {
      throw new HttpError(403, "O paciente só pode cancelar uma consulta pendente ou confirmada.");
    }
  } else if (utilizador.tipo === "medico") {
    const medico = await prisma.medicos.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });
    if (!medico || consulta.medico_id !== medico.id) {
      throw new HttpError(403, "Só pode gerir consultas associadas ao seu perfil médico.");
    }
  } else if (utilizador.tipo !== "admin") {
    throw new HttpError(403, "Sem permissões para alterar consultas.");
  }

  if (["concluida", "cancelada", "rejeitada"].includes(consulta.estado)) {
    throw new HttpError(409, "Esta consulta já está num estado final.");
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.consultas.update({
      where: { id: consultaId },
      data: { estado: novoEstado, actualizado_em: new Date() },
      select: consultaSelect,
    });

    if (["cancelada", "rejeitada"].includes(novoEstado)) {
      await tx.disponibilidades.update({
        where: { id: consulta.disponibilidade_id },
        data: { estado: "disponivel", actualizado_em: new Date() },
      });
    } else if (novoEstado === "confirmada") {
      await tx.disponibilidades.update({
        where: { id: consulta.disponibilidade_id },
        data: { estado: "reservada", actualizado_em: new Date() },
      });
    }

    return actualizado;
  });
}

module.exports = { listarDoUtilizador, marcar, actualizarEstado };
