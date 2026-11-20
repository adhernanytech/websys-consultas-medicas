import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AlterarSenhaInicial() {
  const navegar = useNavigate();
  const { usuario, deveAlterarSenha, alterarSenhaInicial } = useAuth();

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function submeterFormulario(evento) {
    evento.preventDefault();
    setMensagem("");
    setTipoMensagem("");

    if (!usuario || usuario.tipo !== "medico") {
      navegar("/login", { replace: true });
      return;
    }

    if (usuario.ativo === false) {
      setMensagem(
        "A sua conta está desactivada. Contacte o administrador."
      );
      setTipoMensagem("erro");
      return;
    }

    if (!deveAlterarSenha) {
      navegar("/medico/dashboard", { replace: true });
      return;
    }

    if (senha.length < 12) {
      setMensagem(
        "A nova palavra-passe deve ter pelo menos 12 caracteres."
      );
      setTipoMensagem("erro");
      return;
    }

    if (senha !== confirmacao) {
      setMensagem("As palavras-passe não coincidem.");
      setTipoMensagem("erro");
      return;
    }

    setCarregando(true);

    try {
      await alterarSenhaInicial(senha, confirmacao);
      setMensagem("Palavra-passe alterada com sucesso.");
      setTipoMensagem("sucesso");

      navegar("/medico/dashboard", { replace: true });
    } catch (erro) {
      setMensagem(
        erro.message || "Não foi possível alterar a palavra-passe."
      );
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  }

  if (!usuario || usuario.tipo !== "medico") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primaria/10">
          <span className="text-lg font-bold text-texto">M</span>
        </div>

        <h1 className="mt-5 text-center text-2xl font-bold text-texto">
          Alterar palavra-passe
        </h1>

        <p className="mt-3 text-center text-sm text-texto-secundario">
          Por segurança, defina uma nova palavra-passe antes de
          continuar para a sua área médica.
        </p>

        <form onSubmit={submeterFormulario} className="mt-6">
          <div>
            <label
              htmlFor="novaSenha"
              className="mb-2 block text-sm font-medium text-texto"
            >
              Nova palavra-passe
            </label>

            <input
              id="novaSenha"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              autoComplete="new-password"
              minLength={12}
              required
              className="w-full rounded-lg border border-borda px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primaria"
              placeholder="Mínimo de 12 caracteres"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="confirmacaoSenha"
              className="mb-2 block text-sm font-medium text-texto"
            >
              Confirmar palavra-passe
            </label>

            <input
              id="confirmacaoSenha"
              type={mostrarSenha ? "text" : "password"}
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-borda px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primaria"
              placeholder="Repita a nova palavra-passe"
            />

            <label className="mt-3 flex items-center gap-2 text-sm text-texto-secundario">
              <input
                type="checkbox"
                checked={mostrarSenha}
                onChange={(evento) => setMostrarSenha(evento.target.checked)}
              />
              Mostrar palavras-passe
            </label>
          </div>

          {mensagem && (
            <div
              role="status"
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                tipoMensagem === "erro"
                  ? "border border-red-200 bg-red-50 text-erro"
                  : "border border-green-200 bg-green-50 text-sucesso"
              }`}
            >
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-6 w-full rounded-lg bg-primaria py-3 text-sm font-semibold text-white hover:bg-primaria-hover disabled:opacity-60"
          >
            {carregando ? "A guardar..." : "Alterar e continuar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AlterarSenhaInicial;