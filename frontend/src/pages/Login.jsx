import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
// import { GoogleLogin } from '@react-oauth/google';



import {
  obterUsuarios,
  guardarUsuarioAutenticado,
  obterTipoUsuario,
} from "../data/usuarios";

import { obterMedicoDaConta } from "../data/medicos";

function Login() {
  const navegar = useNavigate();
  const location = useLocation();

  const [formulario, setFormulario] = useState({
    email: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setMensagem("");
    setTipoMensagem("");
  }

  function fazerLogin(evento) {
    evento.preventDefault();

    setMensagem("");
    setTipoMensagem("");

    const email = formulario.email.trim().toLowerCase();
    const senha = formulario.senha;

    if (!email) {
      setMensagem("Digite o seu email.");
      setTipoMensagem("erro");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email)) {
      setMensagem("Digite um email válido.");
      setTipoMensagem("erro");
      return;
    }

    if (!senha) {
      setMensagem("Digite a sua palavra-passe.");
      setTipoMensagem("erro");
      return;
    }

    setCarregando(true);

    try {
      const usuarios = obterUsuarios();

      const usuario = usuarios.find(
        (item) =>
          String(item.email || "").trim().toLowerCase() === email
      );

      if (
        !usuario ||
        (usuario.senha !== senha &&
          usuario.password !== senha)
      ) {
        setMensagem("Email ou palavra-passe incorrectos.");
        setTipoMensagem("erro");
        return;
      }

      if (usuario.ativo === false) {
        setMensagem(
          "A sua conta encontra-se desactivada. Contacte o administrador."
        );
        setTipoMensagem("erro");
        return;
      }

      const tipo = obterTipoUsuario(usuario);

      if (!["paciente", "medico", "admin"].includes(tipo)) {
        setMensagem("Esta conta tem um tipo de utilizador inválido.");
        setTipoMensagem("erro");
        return;
      }

      
      guardarUsuarioAutenticado({
        ...usuario,
        role: tipo,
        tipo,
      });

      // A primeira palavra-passe é temporária.
      // O médico deve alterá-la antes de aceder à área médica.
      if (tipo === "medico" && usuario.deveAlterarSenha === true) {
        navegar("/medico/alterar-senha-inicial", {
          replace: true,
        });
        return;
      }

      const destinoSolicitado = location.state?.from?.pathname;
      // O destino original só será respeitado se corresponder
      // à área autorizada para este tipo de utilizador.
      if (destinoSolicitado) {
        if (
          destinoSolicitado.startsWith("/admin") &&
          tipo === "admin"
        ) {
          navegar(destinoSolicitado, { replace: true });
          return;
        }

        if (
          destinoSolicitado.startsWith("/medico") &&
          tipo === "medico"
        ) {
          const perfil = obterMedicoDaConta(usuario.id);

          navegar(
            perfil
              ? destinoSolicitado
              : "/medico/perfil-pendente",
            { replace: true }
          );
          return;
        }

        if (
          destinoSolicitado.startsWith("/paciente") &&
          tipo === "paciente"
        ) {
          navegar(destinoSolicitado, { replace: true });
          return;
        }
      }

      if (tipo === "admin") {
        navegar("/admin/dashboard", { replace: true });
        return;
      }

      if (tipo === "medico") {
        const perfil = obterMedicoDaConta(usuario.id);

        navegar(
          perfil
            ? "/medico/dashboard"
            : "/medico/perfil-pendente",
          { replace: true }
        );
        return;
      }

      navegar("/paciente/dashboard", { replace: true });
    } catch (erro) {
      setMensagem(
        erro.message || "Não foi possível iniciar sessão."
      );
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  }

    function loginComGoogle() {

    setCarregandoGoogle(true)

    setMensagem("")
    setTipoMensagem("")


    setTimeout(() => {

      setCarregandoGoogle(false)

      setMensagem(
        "O início de sessão com Google será implementado posteriormente."
      )

      setTipoMensagem("sucesso")

    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        <section className="hidden lg:flex bg-primaria text-white p-9 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
                <span className="text-texto font-bold text-lg">M</span>
              </div>

              <div>
                <p className="font-bold">Sistema Médico</p>
                <p className="text-blue-100 text-xs">
                  Marcação de consultas online
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-md">

              <p className="
                text-xs
                uppercase
                tracking-widest
                text-blue-100
                font-semibold
              ">
                Cuide da sua saúde
              </p>


              <h1 className="
                text-3xl
                font-bold
                mt-3
                leading-tight
              ">
                Marque a sua consulta de forma simples e segura.
              </h1>


              <p className="
                mt-5
                text-blue-100
                text-base
                leading-relaxed
              ">
                Encontre médicos, marque consultas e acompanhe
                os seus atendimentos através de uma única plataforma.
              </p>


              <div className="mt-8 space-y-4">


                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    bg-white/20
                    rounded-full
                    flex
                    items-center
                    justify-center
                  " />

                  <p className="text-blue-50 text-sm">
                    Consulte médicos disponíveis
                  </p>

                </div>


                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    bg-white/20
                    rounded-full
                    flex
                    items-center
                    justify-center
                  " />

                  <p className="text-blue-50 text-sm">
                    Marque e acompanhe as suas consultas
                  </p>

                </div>


                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    bg-white/20
                    rounded-full
                    flex
                    items-center
                    justify-center
                  " />

                  <p className="text-blue-50 text-sm">
                    Tenha tudo organizado num só lugar
                  </p>

                </div>

              </div>

            </div>
          </div>

          <p className="text-blue-100 text-xs">
            A sua saúde merece cuidado e organização.
          </p>
        </section>

        <section className="p-6 sm:p-8 lg:p-9">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primaria/10 rounded-xl flex items-center justify-center">
              <span className="text-texto font-bold text-lg">M</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-texto mt-4">
              Bem-vindo de volta
            </h1>

            <p className="text-texto-secundario text-sm mt-2">
              Entre na sua conta para gerir as suas consultas.
            </p>
          </div>

          <form onSubmit={fazerLogin} className="mt-7">
            <div>
              <label htmlFor="email" className="block text-texto text-sm font-medium mb-2">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formulario.email}
                onChange={alterarCampo}
                placeholder="exemplo@email.com"
                autoComplete="email"
                required
                className="w-full border border-borda rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primaria"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="senha" className="block text-texto text-sm font-medium mb-2">
                Palavra-passe
              </label>

              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={formulario.senha}
                  onChange={alterarCampo}
                  placeholder="Digite a sua palavra-passe"
                  autoComplete="current-password"
                  required
                  className="w-full border border-borda rounded-lg px-4 py-2.5 pr-20 text-sm outline-none focus:ring-2 focus:ring-primaria"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:underline"
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm">
                  <Link to="/esqueci-senha" className="font-medium text-blue-600 hover:text-blue-500">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
            </div>

            {mensagem && (
              <div
                role="status"
                className={`mt-4 px-4 py-2.5 rounded-lg text-sm ${
                  tipoMensagem === "erro"
                    ? "bg-red-50 border border-red-200 text-erro"
                    : "bg-green-50 border border-green-200 text-sucesso"
                }`}
              >
                {mensagem}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full mt-5 bg-primaria text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primaria-hover disabled:opacity-60"
            >
              {carregando ? "A verificar..." : "Entrar"}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                { /*
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    console.log("Token do Google recebido:", credentialResponse.credential);
                    
                  }}
                  onError={() => {
                    console.log('Login do Google falhou');
                  }}
                  useOneTap
                />
                */}
              </div>
            </div>
          </form>

          <p className="text-center text-texto-secundario text-sm mt-5">
            Ainda não tem uma conta?
          </p>

          <button
            type="button"
            onClick={() => navegar("/registro")}
            className="w-full mt-2.5 border border-borda py-2.5 rounded-lg text-sm hover:bg-gray-50"
          >
            Criar uma conta
          </button>
        </section>
      </div>
    </main>
  );
}

export default Login;
