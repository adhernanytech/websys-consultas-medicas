
const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

const FUSO_HORARIO = "Africa/Luanda";

const ESTADOS_ACTIVOS = ["pendente", "confirmada"];

const ESTADOS_FINAIS = [
  "cancelada",
  "concluida",
  "rejeitada",
];

const ESTADOS_PERMITIDOS = [
  "pendente",
  "confirmada",
  "concluida",
  "cancelada",
  "rejeitada",
];

const consultaSelect = {
  id: true,
  paciente_id: true,
  medico_id: true,
  disponibilidade_id: true,
  estado: true,
  motivo: true,
  criado_em: true,
  actualizado_em: true,
  disponibilidade: {
    select: {
      id: true,
      medico_id: true,
      data: true,
      hora_inicio: true,
      hora_fim: true,
      estado: true,
    },
  },
  paciente: {
    select: {
      id: true,
      telefone: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  },
  medico: {
    select: {
      id: true,
      especialidade: { select: { id: true, nome: true } },
      usuario: { select: { id: true, nome: true, email: true } },
    },
  },
};

function obterDataHoraLuanda() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  return {
    data: `${valores.year}-${valores.month}-${valores.day}`,
    hora: `${valores.hour}:${valores.minute}`,
  };
}

function formatarDataBD(valor) {
  return valor.toISOString().slice(0, 10);
}

function formatarHoraBD(valor) {
  return valor.toISOString().slice(11, 16);
}

function horarioEstaNoFuturo(horario) {
  const data = formatarDataBD(horario.data);
  const hora = formatarHoraBD(horario.hora_inicio);

  const agora = obterDataHoraLuanda();

  if (data > agora.data) return true;
  if (data < agora.data) return false;

  return hora > agora.hora;
}

async function obter(utilizador, consultaId) {
  const where = { id: BigInt(consultaId) };
  if (utilizador.tipo === "paciente") {
    const perfil = await obterPerfil(utilizador);
    where.paciente_id = perfil.id;
  } else if (utilizador.tipo === "medico") {
    const perfil = await obterPerfil(utilizador);
    where.medico_id = perfil.id;
  } else if (utilizador.tipo !== "admin") {
    throw new HttpError(403, "Perfil sem permissões para consultar marcações.");
  }

  const consulta = await prisma.consultas.findFirst({
    where,
    select: consultaSelect,
  });
  if (!consulta) throw new HttpError(404, "Consulta não encontrada.");
  return consulta;
}

async function obterPerfil(utilizador, tx = prisma) {
  if (utilizador.tipo === "paciente") {
    const paciente = await tx.pacientes.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });

    if (!paciente) {
      throw new HttpError(404, "Perfil de paciente não encontrado.");
    }

    return paciente;
  }

  if (utilizador.tipo === "medico") {
    const medico = await tx.medicos.findUnique({
      where: { usuario_id: BigInt(utilizador.id) },
      select: { id: true },
    });

    if (!medico) {
      throw new HttpError(404, "Perfil de médico não encontrado.");
    }

    return medico;
  }

  return null;
}

async function listarDoUtilizador(utilizador) {
  if (utilizador.tipo === "admin") {
    return prisma.consultas.findMany({
      select: consultaSelect,
      orderBy: { criado_em: "desc" },
    });
  }

  const perfil = await obterPerfil(utilizador);

  if (utilizador.tipo === "paciente") {
    return prisma.consultas.findMany({
      where: { paciente_id: perfil.id },
      select: consultaSelect,
      orderBy: { criado_em: "desc" },
    });
  }

  if (utilizador.tipo === "medico") {
    return prisma.consultas.findMany({
      where: { medico_id: perfil.id },
      select: consultaSelect,
      orderBy: { criado_em: "desc" },
    });
  }

  throw new HttpError(
    403,
    "Perfil sem permissões para consultar marcações."
  );
}

async function verificarConflitoPaciente(tx, pacienteId, horario) {
  const data = formatarDataBD(horario.data);
  const inicio = formatarHoraBD(horario.hora_inicio);
  const fim = formatarHoraBD(horario.hora_fim);

  const consultasActivas = await tx.consultas.findMany({
    where: {
      paciente_id: pacienteId,
      estado: { in: ESTADOS_ACTIVOS },
      disponibilidade: {
        data: horario.data,
      },
    },
    select: {
      disponibilidade: {
        select: {
          data: true,
          hora_inicio: true,
          hora_fim: true,
        },
      },
    },
  });

  const conflito = consultasActivas.some((consulta) => {
    const outra = consulta.disponibilidade;

    const outraData = formatarDataBD(outra.data);
    const outraInicio = formatarHoraBD(outra.hora_inicio);
    const outraFim = formatarHoraBD(outra.hora_fim);

    return (
      outraData === data &&
      inicio < outraFim &&
      fim > outraInicio
    );
  });

  if (conflito) {
    throw new HttpError(
      409,
      "Já possui outra consulta marcada para um horário sobreposto."
    );
  }
}

async function marcar(utilizador, dados) {
  if (utilizador.tipo !== "paciente") {
    throw new HttpError(
      403,
      "Só um paciente pode marcar uma consulta."
    );
  }

  return prisma.$transaction(async (tx) => {
    const paciente = await obterPerfil(utilizador, tx);
    const disponibilidadeId = BigInt(dados.disponibilidade_id);

    const horario = await tx.disponibilidades.findUnique({
      where: { id: disponibilidadeId },
    });

    if (!horario) {
      throw new HttpError(404, "Disponibilidade não encontrada.");
    }

    if (horario.estado !== "disponivel") {
      throw new HttpError(
        409,
        "Este horário já não está disponível."
      );
    }

    if (!horarioEstaNoFuturo(horario)) {
      throw new HttpError(
        400,
        "Não é possível marcar uma consulta num horário passado ou já iniciado."
      );
    }

    await verificarConflitoPaciente(tx, paciente.id, horario);

    // Reserva condicional: só uma transacção pode reservar
    // uma disponibilidade que ainda esteja disponível.
    const reserva = await tx.disponibilidades.updateMany({
      where: {
        id: disponibilidadeId,
        estado: "disponivel",
      },
      data: {
        estado: "reservada",
        actualizado_em: new Date(),
      },
    });

    if (reserva.count !== 1) {
      throw new HttpError(
        409,
        "Este horário acabou de ser reservado por outro utilizador."
      );
    }

    // Verificação adicional para detectar inconsistências antigas.
    const existente = await tx.consultas.findFirst({
      where: {
        disponibilidade_id: disponibilidadeId,
        estado: { in: ESTADOS_ACTIVOS },
      },
      select: { id: true },
    });

    if (existente) {
      throw new HttpError(
        409,
        "Este horário já possui uma consulta activa."
      );
    }

    return tx.consultas.create({
      data: {
        paciente_id: paciente.id,
        medico_id: horario.medico_id,
        disponibilidade_id: horario.id,
        motivo: dados.motivo ?? null,
        estado: "pendente",
      },
      select: consultaSelect,
    });
  });
}

async function actualizarEstado(utilizador, consultaId, novoEstado) {
  if (!ESTADOS_PERMITIDOS.includes(novoEstado)) {
    throw new HttpError(400, "Estado de consulta inválido.");
  }

  return prisma.$transaction(async (tx) => {
    const consulta = await tx.consultas.findUnique({
      where: { id: BigInt(consultaId) },
      select: {
        id: true,
        paciente_id: true,
        medico_id: true,
        disponibilidade_id: true,
        estado: true,
      },
    });

    if (!consulta) {
      throw new HttpError(404, "Consulta não encontrada.");
    }

    if (consulta.estado === novoEstado) {
      throw new HttpError(
        409,
        "A consulta já se encontra nesse estado."
      );
    }

    if (ESTADOS_FINAIS.includes(consulta.estado)) {
      throw new HttpError(
        409,
        "Não é possível alterar o estado de uma consulta finalizada."
      );
    }

    if (utilizador.tipo === "paciente") {
      const paciente = await obterPerfil(utilizador, tx);

      if (consulta.paciente_id !== paciente.id) {
        throw new HttpError(
          403,
          "Não pode alterar uma consulta de outro paciente."
        );
      }

      if (
        novoEstado !== "cancelada" ||
        !ESTADOS_ACTIVOS.includes(consulta.estado)
      ) {
        throw new HttpError(
          403,
          "O paciente só pode cancelar consultas pendentes ou confirmadas."
        );
      }
    } else if (utilizador.tipo === "medico") {
      const medico = await obterPerfil(utilizador, tx);

      if (consulta.medico_id !== medico.id) {
        throw new HttpError(
          403,
          "Não pode alterar consultas de outro médico."
        );
      }

      const transicaoPermitida =
        (novoEstado === "confirmada" &&
          consulta.estado === "pendente") ||
        (novoEstado === "rejeitada" &&
          consulta.estado === "pendente") ||
        (novoEstado === "cancelada" &&
          ESTADOS_ACTIVOS.includes(consulta.estado)) ||
        (novoEstado === "concluida" &&
          consulta.estado === "confirmada");

      if (!transicaoPermitida) {
        throw new HttpError(
          400,
          "Esta transição de estado não é permitida para o médico."
        );
      }
    } else if (utilizador.tipo === "admin") {
      const transicaoAdminPermitida =
        (consulta.estado === "pendente" &&
          ["confirmada", "rejeitada", "cancelada"].includes(novoEstado)) ||
        (consulta.estado === "confirmada" &&
          ["cancelada", "concluida"].includes(novoEstado));

      if (!transicaoAdminPermitida) {
        throw new HttpError(
          400,
          "Esta transição de estado não é permitida para o administrador."
        );
      }
    } else {
      throw new HttpError(
        403,
        "Perfil sem permissões para alterar consultas."
      );
    }

    // Actualização condicional para impedir que uma alteração
    // concorrente substitua silenciosamente o estado anterior.
    const actualizacao = await tx.consultas.updateMany({
      where: {
        id: consulta.id,
        estado: consulta.estado,
      },
      data: {
        estado: novoEstado,
        ...(novoEstado === "confirmada"
          ? { confirmada_em: new Date() }
          : {}),
        ...(novoEstado === "concluida"
          ? { concluida_em: new Date() }
          : {}),
        ...(novoEstado === "cancelada"
          ? { cancelada_em: new Date() }
          : {}),
      },
    });

    if (actualizacao.count !== 1) {
      throw new HttpError(
        409,
        "A consulta foi alterada por outra operação. Actualize os dados e tente novamente."
      );
    }

    if (
      novoEstado === "cancelada" ||
      novoEstado === "rejeitada"
    ) {
      const outrasActivas = await tx.consultas.count({
        where: {
          disponibilidade_id: consulta.disponibilidade_id,
          id: { not: consulta.id },
          estado: { in: ESTADOS_ACTIVOS },
        },
      });

      if (outrasActivas === 0) {
        await tx.disponibilidades.updateMany({
          where: {
            id: consulta.disponibilidade_id,
            estado: "reservada",
          },
          data: {
            estado: "disponivel",
            actualizado_em: new Date(),
          },
        });
      }
    }

    return tx.consultas.findUnique({
      where: { id: consulta.id },
      select: consultaSelect,
    });
  });
}

async function reagendar(utilizador, consultaId, dados) {
  if (utilizador.tipo !== "paciente") {
    throw new HttpError(403, "Só o paciente responsável pode reagendar uma consulta.");
  }

  return prisma.$transaction(async (tx) => {
    const paciente = await obterPerfil(utilizador, tx);
    const consulta = await tx.consultas.findUnique({
      where: { id: BigInt(consultaId) },
      select: {
        id: true,
        paciente_id: true,
        medico_id: true,
        disponibilidade_id: true,
        estado: true,
        motivo: true,
      },
    });

    if (!consulta) throw new HttpError(404, "Consulta não encontrada.");
    if (consulta.paciente_id !== paciente.id) {
      throw new HttpError(403, "Não pode alterar uma consulta de outro paciente.");
    }
    if (consulta.estado !== "pendente") {
      throw new HttpError(409, "Só é possível reagendar consultas pendentes.");
    }

    const novaDisponibilidadeId = BigInt(dados.disponibilidade_id);
    if (novaDisponibilidadeId === consulta.disponibilidade_id) {
      throw new HttpError(400, "Seleccione um horário diferente do actual.");
    }

    const novoHorario = await tx.disponibilidades.findUnique({
      where: { id: novaDisponibilidadeId },
    });
    if (!novoHorario || novoHorario.medico_id !== consulta.medico_id) {
      throw new HttpError(400, "O novo horário deve pertencer ao mesmo médico.");
    }
    if (novoHorario.estado !== "disponivel") {
      throw new HttpError(409, "O novo horário já não está disponível.");
    }
    if (!horarioEstaNoFuturo(novoHorario)) {
      throw new HttpError(400, "Não é possível reagendar para um horário passado.");
    }
    await verificarConflitoPaciente(tx, paciente.id, novoHorario);

    const reserva = await tx.disponibilidades.updateMany({
      where: { id: novaDisponibilidadeId, estado: "disponivel" },
      data: { estado: "reservada", actualizado_em: new Date() },
    });
    if (reserva.count !== 1) {
      throw new HttpError(409, "O novo horário foi reservado por outra operação.");
    }

    const actualizacao = await tx.consultas.updateMany({
      where: { id: consulta.id, estado: "pendente", disponibilidade_id: consulta.disponibilidade_id },
      data: {
        disponibilidade_id: novaDisponibilidadeId,
        ...(dados.motivo !== undefined ? { motivo: dados.motivo } : {}),
      },
    });
    if (actualizacao.count !== 1) {
      throw new HttpError(409, "A consulta foi alterada por outra operação.");
    }

    await tx.disponibilidades.updateMany({
      where: { id: consulta.disponibilidade_id, estado: "reservada" },
      data: { estado: "disponivel", actualizado_em: new Date() },
    });

    return tx.consultas.findUnique({
      where: { id: consulta.id },
      select: consultaSelect,
    });
  });
}

module.exports = {
  listarDoUtilizador,
  obter,
  marcar,
  actualizarEstado,
  reagendar,
};
