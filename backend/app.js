/* global require, module, process */
const express = require("express");
const cors = require("cors");

const authRotas = require("./src/routes/authRotas");
const especialidadesRotas = require("./src/routes/especialidadesRotas");
const medicosRotas = require("./src/routes/medicosRotas");
const pacientesRotas = require("./src/routes/pacientesRotas");
const disponibilidadesRotas = require("./src/routes/disponibilidadesRotas");
const consultasRotas = require("./src/routes/consultasRotas");
const notificacoesRotas = require("./src/routes/notificacoesRotas");
const registosClinicosRotas = require("./src/routes/registosClinicosRotas");
const adminRotas = require("./src/routes/adminRotas");
const auditoriaRotas = require("./src/routes/auditoriaRotas");
const { prisma } = require("./src/config/prisma");
const { notFound, errorHandler } = require("./src/middleware/erros");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((value) => value.trim())
    : true,
}));
app.use(express.json({ limit: "1mb" }));

// Serializa BigInt como string, evitando erros nas respostas JSON do Prisma.
app.set("json replacer", (_key, value) =>
  typeof value === "bigint" ? value.toString() : value
);

app.get("/", (_req, res) => {
  res.json({ mensagem: "API do Sistema de Consultas Médicas operacional!" });
});

app.get("/api/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      estado: "operacional",
      api: "activa",
      baseDados: "ligada",
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRotas);
app.use("/api/especialidades", especialidadesRotas);
app.use("/api/medicos", medicosRotas);
app.use("/api/pacientes", pacientesRotas);
app.use("/api/disponibilidades", disponibilidadesRotas);
app.use("/api/consultas", consultasRotas);
app.use("/api/notificacoes", notificacoesRotas);
app.use("/api/registos-clinicos", registosClinicosRotas);
app.use("/api/admin", adminRotas);
app.use("/api/auditoria", auditoriaRotas);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
