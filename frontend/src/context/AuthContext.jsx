import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

const CHAVE_TOKEN = "token";
const CHAVE_USUARIO = "usuarioAutenticado";

function lerSessaoLocal() {
  try {
    const token = localStorage.getItem(CHAVE_TOKEN);
    const raw = localStorage.getItem(CHAVE_USUARIO);
    if (!token || !raw) return { token: null, usuario: null };
    return { token, usuario: JSON.parse(raw) };
  } catch {
    return { token: null, usuario: null };
  }
}

export function AuthProvider({ children }) {
  const sessaoInicial = lerSessaoLocal();
  const [usuario, setUsuario] = useState(sessaoInicial.usuario);
  const [token, setToken] = useState(sessaoInicial.token);
  const [carregando, setCarregando] = useState(false);

  // Persiste sessão
  function persistirSessao(novoToken, novoUsuario) {
    localStorage.setItem(CHAVE_TOKEN, novoToken);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(novoUsuario));
    setToken(novoToken);
    setUsuario(novoUsuario);
  }

  // Remove sessão
  function limparSessao() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    setToken(null);
    setUsuario(null);
  }

  // Login
  const login = useCallback(async (email, senha) => {
    setCarregando(true);
    try {
      const { data } = await authAPI.login({ email, senha });
      persistirSessao(data.token, data.usuario);
      return data;
    } finally {
      setCarregando(false);
    }
  }, []);

  // Registo (público — apenas pacientes)
  const registar = useCallback(async (dados) => {
    setCarregando(true);
    try {
      const { data } = await authAPI.registar(dados);
      return data;
    } finally {
      setCarregando(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    limparSessao();
  }, []);

  // Alterar senha inicial (médicos)
  const alterarSenhaInicial = useCallback(async (novaSenha, confirmacao) => {
    setCarregando(true);
    try {
      const { data } = await authAPI.alterarSenhaInicial({ novaSenha, confirmacao });
      // Actualiza estado local: o médico já não precisa de alterar a senha
      if (usuario) {
        const actualizado = { ...usuario, deve_alterar_senha: false };
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(actualizado));
        setUsuario(actualizado);
      }
      return data;
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  // Revalida a sessão contra o backend ao montar (detecta tokens expirados)
  useEffect(() => {
    if (!token) return;
    authAPI.obterSessao()
      .then(({ data }) => {
        // Actualiza os dados do utilizador com a versão mais recente
        const actualizado = { ...usuario, ...data.usuario };
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(actualizado));
        setUsuario(actualizado);
      })
      .catch(() => {
        // Token inválido ou expirado
        limparSessao();
      });
    // Executado apenas uma vez ao montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers de role
  const eAdmin = usuario?.tipo === "admin";
  const eMedico = usuario?.tipo === "medico";
  const ePaciente = usuario?.tipo === "paciente";
  const autenticado = Boolean(token && usuario);
  const deveAlterarSenha = Boolean(usuario?.deve_alterar_senha);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        autenticado,
        eAdmin,
        eMedico,
        ePaciente,
        deveAlterarSenha,
        login,
        registar,
        logout,
        alterarSenhaInicial,
        // Permite actualizar dados locais do utilizador sem re-login
        actualizarUsuario: (dadosParciais) => {
          if (!usuario) return;
          const actualizado = { ...usuario, ...dadosParciais };
          localStorage.setItem(CHAVE_USUARIO, JSON.stringify(actualizado));
          setUsuario(actualizado);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir o contexto
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}

export default AuthContext;
