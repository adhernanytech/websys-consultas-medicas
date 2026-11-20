
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const nodemailer = require("nodemailer");

const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

const TEMPO_TOKEN_RECUPERACAO_MINUTOS = 15;

function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function obterTransportadorEmail() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT || 587),
    secure: Number(EMAIL_PORT || 587) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

function obterSegredoJWT() {
  if (!process.env.JWT_SECRET) {
    throw new HttpError(
      500,
      "A autenticação não está configurada correctamente no servidor."
    );
  }

  return process.env.JWT_SECRET;
}

function criarTokenRecuperacao() {
  return crypto.randomBytes(32).toString("hex");
}

function calcularHashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function validarNovaSenha(novaSenha, confirmacao) {
  if (typeof novaSenha !== "string" || novaSenha.length < 12) {
    throw new HttpError(
      400,
      "A palavra-passe deve ter pelo menos 12 caracteres."
    );
  }

  if (novaSenha.length > 128) {
    throw new HttpError(
      400,
      "A palavra-passe não pode exceder 128 caracteres."
    );
  }

  if (novaSenha !== confirmacao) {
    throw new HttpError(400, "As palavras-passe não coincidem.");
  }
}

// REGISTO PUBLICO: APENAS PACIENTES

exports.registrar = async (req, res) => {
  const nome = String(
    req.body.nome ?? req.body.nomeCompleto ?? ""
  ).trim();

  const emailRecebido = req.body.email;
  const senha = req.body.senha;
  const telefone = req.body.telefone;

  if (!nome || nome.length < 2 || nome.length > 150) {
    throw new HttpError(
      400,
      "O nome deve ter entre 2 e 150 caracteres."
    );
  }

  if (
    typeof emailRecebido !== "string" ||
    !validarEmail(emailRecebido.trim())
  ) {
    throw new HttpError(400, "Indique um endereço de email válido.");
  }

  if (typeof senha !== "string" || senha.length < 12) {
    throw new HttpError(
      400,
      "A palavra-passe deve ter pelo menos 12 caracteres."
    );
  }

  if (senha.length > 128) {
    throw new HttpError(
      400,
      "A palavra-passe não pode exceder 128 caracteres."
    );
  }

  if (
    telefone !== undefined &&
    telefone !== null &&
    (typeof telefone !== "string" || telefone.trim().length > 30)
  ) {
    throw new HttpError(400, "O número de telefone é inválido.");
  }

  const email = normalizarEmail(emailRecebido);
  const password_hash = await bcrypt.hash(senha, 12);

  try {
    const utilizador = await prisma.usuarios.create({
      data: {
        nome,
        email,
        password_hash,
        tipo: "paciente",
        ativo: true,
        deve_alterar_senha: false,
        paciente: {
          create: {
            telefone: telefone?.trim() || null,
          },
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        criado_em: true,
      },
    });

    return res.status(201).json({
      mensagem: "Conta de paciente criada com sucesso.",
      usuario: {
        ...utilizador,
        id: String(utilizador.id),
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new HttpError(
        409,
        "Já existe uma conta registada com este email."
      );
    }

    throw error;
  }
};

// ======================================================
// LOGIN
// ======================================================

exports.login = async (req, res) => {
  const { email: emailRecebido, senha } = req.body;

  if (
    typeof emailRecebido !== "string" ||
    typeof senha !== "string" ||
    !emailRecebido.trim() ||
    !senha
  ) {
    throw new HttpError(
      400,
      "O email e a palavra-passe são obrigatórios."
    );
  }

  const email = normalizarEmail(emailRecebido);

  const utilizador = await prisma.usuarios.findUnique({
    where: { email },
    select: {
      id: true,
      nome: true,
      email: true,
      password_hash: true,
      tipo: true,
      ativo: true,
      deve_alterar_senha: true,
    },
  });

  if (!utilizador) {
    throw new HttpError(401, "Credenciais inválidas.");
  }

  if (!utilizador.ativo) {
    throw new HttpError(403, "Esta conta está desactivada.");
  }

  const senhaValida = await bcrypt.compare(
    senha,
    utilizador.password_hash
  );

  if (!senhaValida) {
    throw new HttpError(401, "Credenciais inválidas.");
  }

  const segredo = obterSegredoJWT();
  const tipo = String(utilizador.tipo).toLowerCase();

  const token = jwt.sign(
    {
      id: String(utilizador.id),
      tipo,
    },
    segredo,
    {
      expiresIn: "4h",
      issuer: "wenji-maka-api",
      subject: String(utilizador.id),
    }
  );

  return res.status(200).json({
    mensagem: "Sessão iniciada com sucesso.",
    token,
    role: tipo,
    usuario: {
      id: String(utilizador.id),
      nome: utilizador.nome,
      email: utilizador.email,
      tipo,
      deve_alterar_senha:
        tipo === "medico" &&
        Boolean(utilizador.deve_alterar_senha),
    },
  });
};

// ======================================================
// UTILIZADOR AUTENTICADO
// ======================================================

exports.obterSessao = async (req, res) => {
  const id = BigInt(req.utilizador.id);

  const utilizador = await prisma.usuarios.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      ativo: true,
      deve_alterar_senha: true,
    },
  });

  if (!utilizador || !utilizador.ativo) {
    throw new HttpError(401, "Sessão inválida.");
  }

  return res.json({
    usuario: {
      ...utilizador,
      id: String(utilizador.id),
    },
  });
};

// ======================================================
// RECUPERACAO DE PALAVRA-PASSE
// ======================================================

exports.esqueciSenha = async (req, res) => {
  const emailRecebido = req.body.email;

  if (
    typeof emailRecebido !== "string" ||
    !validarEmail(emailRecebido.trim())
  ) {
    throw new HttpError(400, "Indique um endereço de email válido.");
  }

  const respostaPublica = {
    mensagem:
      "Se o email estiver registado, receberá instruções para redefinir a palavra-passe.",
  };

  const utilizador = await prisma.usuarios.findUnique({
    where: {
      email: normalizarEmail(emailRecebido),
    },
    select: {
      id: true,
      email: true,
      ativo: true,
    },
  });

  // Não revelar publicamente se a conta existe.
  if (!utilizador || !utilizador.ativo) {
    return res.json(respostaPublica);
  }

  const transportador = obterTransportadorEmail();

  // Sem configuração SMTP, não criar um token que o utilizador
  // não consiga receber. Configurar o email antes de activar o fluxo.
  if (!transportador) {
    console.error(
      "Recuperação de senha indisponível: configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS."
    );

    return res.json(respostaPublica);
  }

  const token = criarTokenRecuperacao();
  const token_hash = calcularHashToken(token);

  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

  const link = `${frontendUrl}/redefinir-senha?token=${token}`;

  await prisma.$transaction(async (tx) => {
    await tx.tokens_redefinicao_senha.deleteMany({
      where: {
        usuario_id: utilizador.id,
        utilizado_em: null,
      },
    });

    await tx.tokens_redefinicao_senha.create({
      data: {
        usuario_id: utilizador.id,
        token_hash,
        expira_em: new Date(
          Date.now() +
            TEMPO_TOKEN_RECUPERACAO_MINUTOS * 60 * 1000
        ),
      },
    });
  });

  try {
    await transportador.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER,
      to: utilizador.email,
      subject: "Redefinição da palavra-passe",
      text:
        `Recebemos um pedido para redefinir a palavra-passe.\n\n` +
        `Abra este link para continuar: ${link}\n\n` +
        `O link expira em ${TEMPO_TOKEN_RECUPERACAO_MINUTOS} minutos. ` +
        `Se não fez este pedido, ignore esta mensagem.`,
      html:
        `<p>Recebemos um pedido para redefinir a palavra-passe.</p>` +
        `<p><a href="${link}">Redefinir palavra-passe</a></p>` +
        `<p>O link expira em ${TEMPO_TOKEN_RECUPERACAO_MINUTOS} minutos.</p>` +
        `<p>Se não fez este pedido, ignore esta mensagem.</p>`,
    });
  } catch (error) {
    // Não expor dados da conta nem o token nos logs.
    console.error(
      "Não foi possível enviar o email de recuperação:",
      error.message
    );

    await prisma.tokens_redefinicao_senha.deleteMany({
      where: { token_hash },
    });
  }

  return res.json(respostaPublica);
};

// ======================================================
// CONFIRMAR REDEFINICAO DA PALAVRA-PASSE
// ======================================================

exports.redefinirSenha = async (req, res) => {
  const { token, novaSenha, confirmacao } = req.body;

  if (
    typeof token !== "string" ||
    token.length < 32 ||
    token.length > 256
  ) {
    throw new HttpError(400, "Token de recuperação inválido.");
  }

  validarNovaSenha(novaSenha, confirmacao);

  const token_hash = calcularHashToken(token);

  const registo = await prisma.tokens_redefinicao_senha.findUnique({
    where: { token_hash },
    select: {
      id: true,
      usuario_id: true,
      expira_em: true,
      utilizado_em: true,
    },
  });

  if (
    !registo ||
    registo.utilizado_em ||
    registo.expira_em <= new Date()
  ) {
    throw new HttpError(
      400,
      "O link de recuperação é inválido ou expirou."
    );
  }

  const password_hash = await bcrypt.hash(novaSenha, 12);
  const agora = new Date();

  // A validação e o consumo do token acontecem na mesma transacção.
  await prisma.$transaction(async (tx) => {
    const resultado = await tx.tokens_redefinicao_senha.updateMany({
      where: {
        id: registo.id,
        utilizado_em: null,
        expira_em: { gt: agora },
      },
      data: {
        utilizado_em: agora,
      },
    });

    if (resultado.count !== 1) {
      throw new HttpError(
        400,
        "O link de recuperação já foi utilizado ou expirou."
      );
    }

    await tx.usuarios.update({
      where: { id: registo.usuario_id },
      data: {
        password_hash,
        deve_alterar_senha: false,
      },
    });

    await tx.tokens_redefinicao_senha.deleteMany({
      where: {
        usuario_id: registo.usuario_id,
        id: { not: registo.id },
      },
    });
  });

  return res.json({
    mensagem:
      "Palavra-passe redefinida com sucesso. Já pode iniciar sessão.",
  });
};

// ======================================================
// ALTERACAO OBRIGATORIA DA PALAVRA-PASSE INICIAL
// ======================================================

exports.alterarSenhaInicial = async (req, res) => {
  const { novaSenha, confirmacao } = req.body;

  validarNovaSenha(novaSenha, confirmacao);

  if (req.utilizador.tipo !== "medico") {
    throw new HttpError(
      403,
      "Esta operação destina-se a contas médicas."
    );
  }

  const id = BigInt(req.utilizador.id);

  const utilizador = await prisma.usuarios.findUnique({
    where: { id },
    select: {
      id: true,
      ativo: true,
      password_hash: true,
      deve_alterar_senha: true,
    },
  });

  if (!utilizador || !utilizador.ativo) {
    throw new HttpError(401, "Conta inexistente ou desactivada.");
  }

  if (!utilizador.deve_alterar_senha) {
    throw new HttpError(
      400,
      "A conta não necessita de alterar a palavra-passe inicial."
    );
  }

  const igualÀAnterior = await bcrypt.compare(
    novaSenha,
    utilizador.password_hash
  );

  if (igualÀAnterior) {
    throw new HttpError(
      400,
      "A nova palavra-passe deve ser diferente da inicial."
    );
  }

  const password_hash = await bcrypt.hash(novaSenha, 12);

  await prisma.usuarios.update({
    where: { id },
    data: {
      password_hash,
      deve_alterar_senha: false,
    },
  });

  return res.json({
    mensagem:
      "Palavra-passe alterada com sucesso. Já pode aceder à sua conta.",
    deve_alterar_senha: false,
  });
};
