
const bcrypt = require("bcrypt");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const { prisma } = require("../src/config/prisma");

function lerVariavelObrigatoria(nome) {
  const valor = process.env[nome]?.trim();

  if (!valor) {
    throw new Error(`A variável ${nome} é obrigatória.`);
  }

  return valor;
}

async function criarAdministrador() {
  const nome = lerVariavelObrigatoria("ADMIN_NOME");
  const email = lerVariavelObrigatoria("ADMIN_EMAIL").toLowerCase();
  const senha = process.env.ADMIN_SENHA;

  if (nome.length < 2 || nome.length > 150) {
    throw new Error("O nome deve ter entre 2 e 150 caracteres.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("O email indicado não é válido.");
  }

  if (typeof senha !== "string" || senha.length < 12 || senha.length > 128) {
    throw new Error(
      "A palavra-passe deve ter entre 12 e 128 caracteres."
    );
  }

  const existente = await prisma.usuarios.findUnique({
    where: { email },
    select: {
      id: true,
      tipo: true,
      ativo: true,
    },
  });

  if (existente) {
    throw new Error(
      "Já existe uma conta com esse email. O script não altera contas existentes."
    );
  }

  const password_hash = await bcrypt.hash(senha, 12);

  const administrador = await prisma.usuarios.create({
    data: {
      nome,
      email,
      password_hash,
      tipo: "admin",
      ativo: true,
      deve_alterar_senha: false,
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

  console.log("\nAdministrador criado com sucesso.");
  console.log(`ID: ${administrador.id.toString()}`);
  console.log(`Nome: ${administrador.nome}`);
  console.log(`Email: ${administrador.email}`);
  console.log(`Perfil: ${administrador.tipo}`);
  console.log(`Activo: ${administrador.ativo}`);
  console.log("\nA palavra-passe não foi apresentada.");
}

async function main() {
  try {
    await criarAdministrador();
  } catch (error) {
    console.error("\nNão foi possível criar o administrador.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
