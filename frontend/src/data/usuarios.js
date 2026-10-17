
export const CHAVE_USUARIOS = "usuarios";
export const CHAVE_USUARIO_AUTENTICADO = "usuarioAutenticado";

export const TIPOS_USUARIO = {
  ADMIN: "admin",
  MEDICO: "medico",
  PACIENTE: "paciente",
};

function normalizarTipo(tipo) {
  const valor = String(tipo || "").trim().toLowerCase();

  if (valor === "médico") return "medico";
  if (valor === "administrador") return "admin";

  return valor;
}

function normalizarUsuario(usuario) {
  if (!usuario || typeof usuario !== "object") return null;

  const tipo = normalizarTipo(usuario.tipo || usuario.role);

  return {
    ...usuario,
    ...(tipo ? { tipo, role: tipo } : {}),
  };
}

export function obterUsuarios() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
    return Array.isArray(dados)
      ? dados.map(normalizarUsuario).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function guardarUsuarios(usuarios) {
  if (!Array.isArray(usuarios)) {
    throw new Error("A lista de utilizadores deve ser um array.");
  }

  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

export function obterUsuarioPorId(id) {
  return obterUsuarios().find(
    (usuario) => String(usuario.id) === String(id)
  ) || null;
}

export function obterUsuarioPorEmail(email) {
  const normalizado = String(email || "").trim().toLowerCase();
  if (!normalizado) return null;

  return obterUsuarios().find(
    (usuario) =>
      String(usuario.email || "").trim().toLowerCase() === normalizado
  ) || null;
}

export function obterUsuarioAutenticado() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_USUARIO_AUTENTICADO)
    );
    return normalizarUsuario(dados);
  } catch {
    return null;
  }
}

export function guardarUsuarioAutenticado(usuario) {
  if (!usuario) {
    removerUsuarioAutenticado();
    return;
  }

  localStorage.setItem(
    CHAVE_USUARIO_AUTENTICADO,
    JSON.stringify(normalizarUsuario(usuario))
  );
}

export function removerUsuarioAutenticado() {
  localStorage.removeItem(CHAVE_USUARIO_AUTENTICADO);
}

export function obterTipoUsuario(usuario) {
  if (!usuario) return null;
  return normalizarTipo(usuario.tipo || usuario.role) || null;
}

export function usuarioIsAdmin(usuario) {
  return obterTipoUsuario(usuario) === TIPOS_USUARIO.ADMIN;
}

export function usuarioIsMedico(usuario) {
  return obterTipoUsuario(usuario) === TIPOS_USUARIO.MEDICO;
}

export function usuarioIsPaciente(usuario) {
  return obterTipoUsuario(usuario) === TIPOS_USUARIO.PACIENTE;
}

export function actualizarUsuario(id, dadosActualizados) {
  const usuarios = obterUsuarios();
  const indice = usuarios.findIndex(
    (usuario) => String(usuario.id) === String(id)
  );

  if (indice === -1) return null;

  const actual = usuarios[indice];
  const { id: idIgnorado, ...dados } = dadosActualizados || {};

  const actualizado = normalizarUsuario({
    ...actual,
    ...dados,
    id: actual.id,
  });

  const email = String(actualizado.email || "").trim().toLowerCase();

  if (
    email &&
    usuarios.some(
      (usuario, i) =>
        i !== indice &&
        String(usuario.email || "").trim().toLowerCase() === email
    )
  ) {
    throw new Error("Já existe uma conta com este endereço de email.");
  }

  usuarios[indice] = actualizado;
  guardarUsuarios(usuarios);

  const autenticado = obterUsuarioAutenticado();

  if (autenticado && String(autenticado.id) === String(id)) {
    guardarUsuarioAutenticado(actualizado);
  }

  return actualizado;
}

function gerarIdUsuario(usuarios) {
  const ids = usuarios
    .map((usuario) => Number(usuario.id))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  return ids.length ? Math.max(...ids) + 1 : 1;
}

/**
 * Cria um utilizador e preserva os registos existentes.
 * A autorização para criar contas privilegiadas deve ser
 * validada pela operação administrativa que chama esta função.
 */
export function criarUsuario(dadosUsuario) {
  const nome = String(dadosUsuario?.nome || "").trim();
  const email = String(dadosUsuario?.email || "").trim().toLowerCase();
  const senha = String(dadosUsuario?.senha || "");
  const passwordHash = dadosUsuario?.password_hash;

  const tipo = normalizarTipo(
    dadosUsuario?.tipo || dadosUsuario?.role
  );

  if (!nome || !email) {
    throw new Error("O nome e o email são obrigatórios.");
  }

  if (!senha && !passwordHash) {
    throw new Error("A palavra-passe é obrigatória.");
  }

  if (!Object.values(TIPOS_USUARIO).includes(tipo)) {
    throw new Error("Tipo de utilizador inválido.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Indique um endereço de email válido.");
  }

  if (obterUsuarioPorEmail(email)) {
    throw new Error("Já existe uma conta com este endereço de email.");
  }

  const usuarios = obterUsuarios();

  const novoUsuario = normalizarUsuario({
    ...dadosUsuario,
    id: gerarIdUsuario(usuarios),
    nome,
    email,
    tipo,
    role: tipo,
  });

  guardarUsuarios([...usuarios, novoUsuario]);

  return novoUsuario;
}
