
export const CHAVE_USUARIOS = "usuarios";
export const CHAVE_USUARIO_AUTENTICADO =
  "usuarioAutenticado";

export const TIPOS_USUARIO = {
  ADMIN: "admin",
  MEDICO: "medico",
  PACIENTE: "paciente",
};

function normalizarTipo(tipo) {
  const valor = String(tipo || "")
    .trim()
    .toLowerCase();

  if (valor === "médico") return "medico";
  if (valor === "administrador") return "admin";
  if (valor === "administrador") return "admin";

  return valor;
}

function normalizarUsuario(usuario) {
  if (!usuario || typeof usuario !== "object") {
    return null;
  }

  const tipo = normalizarTipo(
    usuario.tipo || usuario.role
  );

  return {
    ...usuario,
    ...(tipo ? { role: tipo, tipo } : {}),
  };
}

export function obterUsuarios() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_USUARIOS)
    );

    return Array.isArray(dados)
      ? dados.map(normalizarUsuario).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function guardarUsuarios(usuarios) {
  if (!Array.isArray(usuarios)) {
    throw new Error(
      "A lista de utilizadores deve ser um array."
    );
  }

  localStorage.setItem(
    CHAVE_USUARIOS,
    JSON.stringify(usuarios)
  );
}

export function obterUsuarioPorId(id) {
  return obterUsuarios().find(
    (usuario) =>
      String(usuario.id) === String(id)
  ) || null;
}

export function obterUsuarioPorEmail(email) {
  const emailNormalizado = String(email || "")
    .trim()
    .toLowerCase();

  if (!emailNormalizado) return null;

  return obterUsuarios().find(
    (usuario) =>
      String(usuario.email || "")
        .trim()
        .toLowerCase() === emailNormalizado
  ) || null;
}

export function obterUsuarioAutenticado() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(
        CHAVE_USUARIO_AUTENTICADO
      )
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
  localStorage.removeItem(
    CHAVE_USUARIO_AUTENTICADO
  );
}

export function obterTipoUsuario(usuario) {
  if (!usuario) return null;

  return normalizarTipo(
    usuario.tipo || usuario.role
  ) || null;
}

export function usuarioIsAdmin(usuario) {
  return obterTipoUsuario(usuario) === "admin";
}

export function usuarioIsMedico(usuario) {
  return obterTipoUsuario(usuario) === "medico";
}

export function usuarioIsPaciente(usuario) {
  return obterTipoUsuario(usuario) === "paciente";
}

export function actualizarUsuario(
  id,
  dadosActualizados
) {
  const usuarios = obterUsuarios();

  const indice = usuarios.findIndex(
    (usuario) =>
      String(usuario.id) === String(id)
  );

  if (indice === -1) return null;

  const actual = usuarios[indice];

  // O ID não pode ser alterado por esta função.
  const {
    id: idIgnorado,
    ...dados
  } = dadosActualizados || {};

  const usuarioActualizado = normalizarUsuario({
    ...actual,
    ...dados,
    id: actual.id,
  });

  if (!usuarioActualizado) return null;

  const novoEmail = String(
    usuarioActualizado.email || ""
  ).trim().toLowerCase();

  if (
    novoEmail &&
    usuarios.some(
      (usuario, i) =>
        i !== indice &&
        String(usuario.email || "")
          .trim()
          .toLowerCase() === novoEmail
    )
  ) {
    throw new Error(
      "Já existe uma conta com este endereço de email."
    );
  }

  usuarios[indice] = usuarioActualizado;
  guardarUsuarios(usuarios);

  const autenticado = obterUsuarioAutenticado();

  if (
    autenticado &&
    String(autenticado.id) === String(id)
  ) {
    guardarUsuarioAutenticado(
      usuarioActualizado
    );
  }

  return usuarioActualizado;
}

/**
 * Cria uma conta de forma controlada.
 * Por defeito, apenas permite contas de paciente.
 * A criação de contas administrativas ou médicas
 * deve ser feita por operações próprias e protegidas.
 */
export function criarUsuario(dadosUsuario) {
  const nome = String(
    dadosUsuario?.nome || ""
  ).trim();

  const email = String(
    dadosUsuario?.email || ""
  ).trim().toLowerCase();

  const passwordHash = dadosUsuario?.password_hash;
  const password = dadosUsuario?.password;

  const tipo = normalizarTipo(
    dadosUsuario?.tipo || dadosUsuario?.role
  );

  if (!nome || !email) {
    throw new Error(
      "O nome e o email são obrigatórios."
    );
  }

  if (!passwordHash && !password) {
    throw new Error(
      "A palavra-passe é obrigatória."
    );
  }

  if (
    tipo !== TIPOS_USUARIO.PACIENTE &&
    tipo !== TIPOS_USUARIO.MEDICO &&
    tipo !== TIPOS_USUARIO.ADMIN
  ) {
    throw new Error("Tipo de utilizador inválido.");
  }

  if (obterUsuarioPorEmail(email)) {
    throw new Error(
      "Já existe uma conta com este endereço de email."
    );
  }

  const usuarios = obterUsuarios();

  const novoUsuario = {
    ...dadosUsuario,
    id: gerarIdUsuario(usuarios),
    nome,
    email,
    role: tipo,
    tipo,
  };

  guardarUsuarios([...usuarios, novoUsuario]);

  return novoUsuario;
}

function gerarIdUsuario(usuarios) {
  const idsNumericos = usuarios
    .map((usuario) => Number(usuario.id))
    .filter(
      (id) => Number.isInteger(id) && id > 0
    );

  return idsNumericos.length
    ? Math.max(...idsNumericos) + 1
    : 1;
}
