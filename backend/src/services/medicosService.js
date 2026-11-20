
const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");
const bcrypt = require("bcrypt");
const { randomInt } = require("node:crypto");

const seleccaoPublica = {
  id: true,
  especialidade_id: true,
  sexo: true,
  biografia: true,
  experiencia: true,
  telefone: true,
  criado_em: true,
  especialidade: {
    select: {
      id: true,
      nome: true,
    },
  },
  usuario: {
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
  },
};

const ALFABETO_SENHA =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

function normalizarId(valor, campo = "id") {
  try {
    const texto = String(valor);

    if (!/^[1-9]\d*$/.test(texto)) {
      throw new Error("ID inválido");
    }

    return BigInt(texto);
  } catch {
    throw new HttpError(400, `${campo} inválido.`);
  }
}

function gerarSenhaInicial(tamanho = 16) {
  let senha = "";

  for (let i = 0; i < tamanho; i += 1) {
    senha += ALFABETO_SENHA[randomInt(ALFABETO_SENHA.length)];
  }

  return senha;
}

function tratarErroPrisma(erro) {
  if (erro?.code === "P2002") {
    throw new HttpError(409, "Já existe um registo com estes dados.");
  }

  if (erro?.code === "P2003") {
    throw new HttpError(
      400,
      "Não foi possível concluir a operação devido a uma relação inválida."
    );
  }

  throw erro;
}


async function listar({ especialidadeId } = {}) {
  return prisma.medicos.findMany({
    where: {
      usuario: {
        ativo: true,
      },

      ...(especialidadeId
        ? {
            especialidade_id: BigInt(especialidadeId),
          }
        : {}),
    },

    select: {
      id: true,
      usuario_id: true,
      especialidade_id: true,
      sexo: true,
      biografia: true,
      experiencia: true,
      telefone: true,
      criado_em: true,

      especialidade: {
        select: {
          id: true,
          nome: true,
        },
      },

      usuario: {
        select: {
          id: true,
          nome: true,
          ativo: true,
        },
      },
    },

    orderBy: {
      id: "asc",
    },
  });
}


async function obter(id) {
  const medicoId = normalizarId(id);

  const medico = await prisma.medicos.findUnique({
    where: { id: medicoId },
    select: seleccaoPublica,
  });

  if (!medico || !medico.usuario?.ativo) {
    throw new HttpError(404, "Médico não encontrado.");
  }

  return medico;
}

async function criarConta({
  nome,
  email,
  sexo,
  especialidadeId,
  fotografiaUrl,
}) {
  const nomeLimpo = String(nome || "").trim();
  const emailLimpo = String(email || "").trim().toLowerCase();
  const sexoLimpo = String(sexo || "").trim().toUpperCase();

  if (nomeLimpo.length < 2 || nomeLimpo.length > 150) {
    throw new HttpError(400, "Indique um nome válido.");
  }

  if (
    emailLimpo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)
  ) {
    throw new HttpError(400, "Indique um email válido.");
  }

  if (sexoLimpo && !["M", "F"].includes(sexoLimpo)) {
    throw new HttpError(400, "O sexo deve ser M ou F.");
  }
  if (
    fotografiaUrl !== undefined &&
    fotografiaUrl !== null &&
    (typeof fotografiaUrl !== "string" || fotografiaUrl.length > 700000)
  ) {
    throw new HttpError(400, "A fotografia do médico é inválida ou demasiado grande.");
  }

  const especialidadeIdNormalizado = normalizarId(
    especialidadeId,
    "especialidade_id"
  );

  const senhaInicial = gerarSenhaInicial();
  const passwordHash = await bcrypt.hash(senhaInicial, 12);

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const utilizadorExistente = await tx.usuarios.findFirst({
        where: {
          email: {
            equals: emailLimpo,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (utilizadorExistente) {
        throw new HttpError(409, "Este email já está registado.");
      }

      const especialidade = await tx.especialidades.findUnique({
        where: { id: especialidadeIdNormalizado },
        select: {
          id: true,
          ativo: true,
        },
      });

      if (!especialidade || !especialidade.ativo) {
        throw new HttpError(
          400,
          "A especialidade seleccionada não existe ou está inactiva."
        );
      }

      const utilizador = await tx.usuarios.create({
        data: {
          nome: nomeLimpo,
          email: emailLimpo,
          password_hash: passwordHash,
          tipo: "medico",
          ativo: false,
          deve_alterar_senha: true,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          ativo: true,
          deve_alterar_senha: true,
          criado_em: true,
        },
      });

      const medico = await tx.medicos.create({
        data: {
          usuario_id: utilizador.id,
          especialidade_id: especialidade.id,
          sexo: sexoLimpo || null,
          biografia: "",
          experiencia: "",
          telefone: null,
          fotografia_url: fotografiaUrl || null,
        },
        select: seleccaoPublica,
      });

      return { medico, utilizador };
    });

    return {
      ...resultado,
      credenciais: {
        email: emailLimpo,
        senhaInicial,
      },
    };
  } catch (erro) {
    if (erro instanceof HttpError) {
      throw erro;
    }

    tratarErroPrisma(erro);
  }
}

async function alterarEstadoConta(medicoId, ativo) {
  if (typeof ativo !== "boolean") {
    throw new HttpError(
      400,
      "O campo 'ativo' deve ser true ou false."
    );
  }

  const id = normalizarId(medicoId, "medico_id");

  const medico = await prisma.medicos.findUnique({
    where: { id },
    select: {
      id: true,
      usuario_id: true,
    },
  });

  if (!medico) {
    throw new HttpError(404, "Conta médica não encontrada.");
  }

  const utilizador = await prisma.usuarios.update({
    where: { id: medico.usuario_id },
    data: { ativo },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      ativo: true,
      deve_alterar_senha: true,
    },
  });

  return {
    medico_id: medico.id,
    conta: utilizador,
  };
}

async function obterMeu(utilizador) {
  const medico = await prisma.medicos.findUnique({
    where: { usuario_id: BigInt(utilizador.id) },
    select: {
      id: true,
      usuario_id: true,
      especialidade_id: true,
      sexo: true,
      biografia: true,
      experiencia: true,
      telefone: true,
      numero_ordem: true,
      fotografia_url: true,
      valor_consulta: true,
      duracao_consulta: true,
      perfil_aprovado: true,
      criado_em: true,
      actualizado_em: true,
      especialidade: { select: { id: true, nome: true } },
      usuario: { select: { id: true, nome: true, email: true, tipo: true, ativo: true } },
    },
  });

  if (!medico) {
    throw new HttpError(404, "Perfil de médico não encontrado.");
  }

  return medico;
}

async function actualizarMeu(utilizador, dados) {
  const medico = await prisma.medicos.findUnique({
    where: { usuario_id: BigInt(utilizador.id) },
    select: { id: true },
  });

  if (!medico) {
    throw new HttpError(404, "Perfil de médico não encontrado.");
  }

  const actualizacao = {};
  if (dados.especialidade_id !== undefined) actualizacao.especialidade_id = BigInt(dados.especialidade_id);
  if (dados.sexo !== undefined) actualizacao.sexo = dados.sexo || null;
  if (dados.biografia !== undefined) actualizacao.biografia = dados.biografia || null;
  if (dados.experiencia !== undefined) actualizacao.experiencia = dados.experiencia || null;
  if (dados.telefone !== undefined) actualizacao.telefone = dados.telefone || null;
  if (dados.numero_ordem !== undefined) actualizacao.numero_ordem = dados.numero_ordem || null;
  if (dados.fotografia_url !== undefined) actualizacao.fotografia_url = dados.fotografia_url || null;
  if (dados.valor_consulta !== undefined) actualizacao.valor_consulta = dados.valor_consulta || null;
  if (dados.duracao_consulta !== undefined) actualizacao.duracao_consulta = Number(dados.duracao_consulta);

  return prisma.medicos.update({
    where: { id: medico.id },
    data: actualizacao,
    select: {
      id: true,
      usuario_id: true,
      especialidade_id: true,
      sexo: true,
      biografia: true,
      experiencia: true,
      telefone: true,
      numero_ordem: true,
      fotografia_url: true,
      valor_consulta: true,
      duracao_consulta: true,
      actualizado_em: true,
    },
  });
}

module.exports = {
  listar,
  obter,
  criarConta,
  alterarEstadoConta,
  obterMeu,
  actualizarMeu,
};
