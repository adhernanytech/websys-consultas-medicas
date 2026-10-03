
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import {
  configurarPrimeiroAdministrador,
  existeAdministrador,
} from "../../data/administracao";

function ConfigurarAdmin() {
  const navegar = useNavigate();

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (existeAdministrador()) {
    return <Navigate to="/login" replace />;
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErro("");
  }


  function submeter(evento) {
    evento.preventDefault();
    setErro("");

    const nome = formulario.nome.trim();
    const email = formulario.email.trim().toLowerCase();
    const senha = formulario.senha;
    const confirmarSenha = formulario.confirmarSenha;

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha.length < 8) {
      setErro("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      configurarPrimeiroAdministrador({
        nome,
        email,
        senha,
      });

      setFormulario({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
      });

      navegar("/login", {
        replace: true,
        state: {
          mensagem:
            "Administrador configurado. Inicie sessão com os seus dados.",
        },
      });
    } catch (erro) {
      setErro(
        erro?.message || "Não foi possível criar o administrador."
      );
    } finally {
      setCarregando(false);
    }
  }


  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-7 sm:p-9">
        <p className="text-sm text-texto-secundario">
          Configuração inicial
        </p>

        <h1 className="text-2xl font-bold mt-2">
          Criar administrador
        </h1>

        <p className="text-texto-secundario mt-3">
          Crie a conta responsável pela gestão dos perfis e das contas
          médicas da clínica.
        </p>

        {erro && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={submeter} className="mt-6 space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-2">
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              value={formulario.nome}
              onChange={alterarCampo}
              minLength={3}
              required
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email administrativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formulario.email}
              onChange={alterarCampo}
              autoComplete="email"
              required
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-2">
              Palavra-passe
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={formulario.senha}
              onChange={alterarCampo}
              minLength={8}
              autoComplete="new-password"
              required
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="block text-sm font-medium mb-2"
            >
              Confirmar palavra-passe
            </label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              value={formulario.confirmarSenha}
              onChange={alterarCampo}
              minLength={8}
              autoComplete="new-password"
              required
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primaria text-white rounded-lg py-3 disabled:opacity-60"
          >
            {carregando
              ? "A configurar..."
              : "Criar primeira conta administrativa"}
          </button>
        </form>

        <p className="text-sm text-texto-secundario mt-5">
          Já configurou o sistema?{" "}
          <Link to="/login" className="text-primaria underline">
            Ir para o login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ConfigurarAdmin;
