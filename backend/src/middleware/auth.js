
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const { HttpError } = require("../utils/http");

async function autenticar(req, _res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "É necessário iniciar sessão.");
    }

    const token = header.slice(7).trim();

    if (!token) {
      throw new HttpError(401, "Token não fornecido.");
    }

    if (!process.env.JWT_SECRET) {
      throw new HttpError(
        500,
        "A configuração de autenticação do servidor está incompleta."
      );
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new HttpError(
        401,
        "Sessão inválida ou expirada. Inicie sessão novamente."
      );
    }

    const id = payload.id ?? payload.userId ?? payload.sub;

    if (
      id === undefined ||
      id === null ||
      !/^[1-9]\d*$/.test(String(id))
    ) {
      throw new HttpError(
        401,
        "Token sem identificador de utilizador válido."
      );
    }

    const utilizadorId = BigInt(String(id));

    const utilizador = await prisma.usuarios.findUnique({
      where: { id: utilizadorId },
      select: {
        id: true,
        tipo: true,
        ativo: true,
        deve_alterar_senha: true,
      },
    });

    // Confirmar que a conta existe ANTES de aceder às suas propriedades.
    if (!utilizador || !utilizador.ativo) {
      throw new HttpError(
        401,
        "Conta inexistente ou desactivada."
      );
    }

    const tipoUtilizador = String(utilizador.tipo).toLowerCase();

    const tiposValidos = ["admin", "medico", "paciente"];

    if (!tiposValidos.includes(tipoUtilizador)) {
      throw new HttpError(
        403,
        "O tipo de conta não está autorizado a utilizar o sistema."
      );
    }

    req.utilizador = {
      id: String(utilizador.id),
      tipo: tipoUtilizador,
      deveAlterarSenha:
        tipoUtilizador === "medico"
          ? Boolean(utilizador.deve_alterar_senha)
          : false,
    };

    const url = req.originalUrl.split("?")[0];

    const endpointAlteracaoInicial =
      url.endsWith("/auth/alterar-senha-inicial") &&
      ["POST", "PATCH"].includes(req.method);

    if (
      req.utilizador.deveAlterarSenha &&
      !endpointAlteracaoInicial
    ) {
      throw new HttpError(
        403,
        "Altere a palavra-passe inicial antes de aceder a esta funcionalidade."
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

function permitir(...tipos) {
  return (req, _res, next) => {
    if (!req.utilizador) {
      return next(
        new HttpError(401, "É necessário iniciar sessão.")
      );
    }

    const tiposPermitidos = tipos.map((tipo) =>
      String(tipo).toLowerCase()
    );

    if (!tiposPermitidos.includes(req.utilizador.tipo)) {
      return next(
        new HttpError(
          403,
          "Não tem permissões para executar esta operação."
        )
      );
    }

    return next();
  };
}

module.exports = {
  autenticar,
  permitir,
};
