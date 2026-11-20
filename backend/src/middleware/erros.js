const { Prisma } = require("@prisma/client");
const { HttpError } = require("../utils/http");

function notFound(req, res) {
  res.status(404).json({
    erro: "Rota não encontrada.",
    caminho: req.originalUrl,
  });
}

function errorHandler(error, req, res, _next) {
  if (res.headersSent) return;

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      erro: error.message,
      ...(error.details ? { detalhes: error.details } : {}),
    });
  }

  if (error && error.name === "ZodError") {
    return res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: error.issues?.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ erro: "Já existe um registo com esses dados." });
    }
    if (error.code === "P2003") {
      return res.status(409).json({ erro: "A operação viola uma relação entre registos." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Registo não encontrado." });
    }
  }

  console.error(`[${req.method} ${req.originalUrl}]`, error);
  return res.status(500).json({
    erro: "Ocorreu um erro interno no servidor.",
  });
}

module.exports = { notFound, errorHandler };
