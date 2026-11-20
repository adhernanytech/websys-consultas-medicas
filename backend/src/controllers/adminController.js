const { prisma } = require("../config/prisma");
const { HttpError, parseId } = require("../utils/http");

async function dashboard(_req, res) {
  const hoje = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Luanda",
  }).format(new Date());
  const [
    totalMedicos,
    medicosActivos,
    totalPacientes,
    pacientesActivos,
    totalConsultas,
    consultasPendentes,
    consultasConfirmadas,
    consultasConcluidas,
    consultasCanceladas,
    consultasHoje,
    totalDisponibilidades,
    disponibilidadesLivres,
    totalRegistosClinicos,
    totalAdministradores,
  ] = await Promise.all([
    prisma.medicos.count(),
    prisma.usuarios.count({ where: { tipo: "medico", ativo: true } }),
    prisma.pacientes.count(),
    prisma.usuarios.count({ where: { tipo: "paciente", ativo: true } }),
    prisma.consultas.count(),
    prisma.consultas.count({ where: { estado: "pendente" } }),
    prisma.consultas.count({ where: { estado: "confirmada" } }),
    prisma.consultas.count({ where: { estado: "concluida" } }),
    prisma.consultas.count({ where: { estado: { in: ["cancelada", "rejeitada"] } } }),
    prisma.consultas.count({
      where: {
        estado: { in: ["pendente", "confirmada"] },
        disponibilidade: { data: new Date(`${hoje}T00:00:00.000Z`) },
      },
    }),
    prisma.disponibilidades.count(),
    prisma.disponibilidades.count({ where: { estado: "disponivel" } }),
    prisma.registos_clinicos.count(),
    prisma.usuarios.count({ where: { tipo: "admin" } }),
  ]);

  return res.json({
    dados: {
      totalMedicos,
      totalPacientes,
      totalConsultas,
      totalDisponibilidades,
      medicosActivos,
      pacientesActivos,
      consultasActivas: consultasPendentes + consultasConfirmadas,
      consultasHoje,
      consultasAgendadas: consultasPendentes,
      consultasConfirmadas,
      consultasRealizadas: consultasConcluidas,
      consultasCanceladas,
      medicosComConta: totalMedicos,
      medicosSemConta: 0,
      disponibilidadesLivres,
      totalRegistosClinicos,
      totalAdministradores,
    },
  });
}

async function listarUtilizadores(req, res) {
  const tipo = req.query.tipo;
  const where = tipo ? { tipo: String(tipo).toLowerCase() } : {};

  const usuarios = await prisma.usuarios.findMany({
    where,
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      ativo: true,
      criado_em: true,
      paciente: {
        select: {
          id: true,
          telefone: true,
        },
      },
      medico: {
        select: {
          id: true,
          especialidade: { select: { nome: true } },
        },
      },
    },
    orderBy: { criado_em: "desc" },
  });

  return res.json({ dados: usuarios });
}

async function alterarEstadoUtilizador(req, res) {
  const id = parseId(req.params.id);
  const utilizador = await prisma.usuarios.update({
    where: { id },
    data: { ativo: req.body.ativo },
    select: { id: true, nome: true, email: true, tipo: true, ativo: true },
  });
  return res.json({ mensagem: "Estado do utilizador actualizado.", dados: utilizador });
}

async function obterConfiguracoes(_req, res) {
  const configuracoes = await prisma.configuracoes_sistema.findUnique({
    where: { chave: "interface_admin" },
    select: { valor: true, actualizado_em: true },
  });
  return res.json({ dados: configuracoes });
}

async function guardarConfiguracoes(req, res) {
  const configuracoes = req.body.configuracoes;
  if (!configuracoes || typeof configuracoes !== "object" || Array.isArray(configuracoes)) {
    throw new HttpError(400, "As configurações devem ser um objecto JSON.");
  }
  const resultado = await prisma.configuracoes_sistema.upsert({
    where: { chave: "interface_admin" },
    create: {
      chave: "interface_admin",
      valor: configuracoes,
      descricao: "Preferências gerais da interface administrativa.",
    },
    update: { valor: configuracoes },
    select: { valor: true, actualizado_em: true },
  });
  return res.json({ mensagem: "Configurações guardadas.", dados: resultado });
}

module.exports = {
  dashboard,
  listarUtilizadores,
  alterarEstadoUtilizador,
  obterConfiguracoes,
  guardarConfiguracoes,
};
