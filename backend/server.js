require("dotenv").config();

const app = require("./app");
const { prisma } = require("./src/config/prisma");

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  console.log(`API do Sistema de Consultas Médicas a correr na porta ${PORT}`);
});

async function encerrarServidor(sinal) {
  console.log(`\n${sinal} recebido. A encerrar servidor...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error("Erro ao encerrar Prisma:", error.message);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => encerrarServidor("SIGINT"));
process.on("SIGTERM", () => encerrarServidor("SIGTERM"));
