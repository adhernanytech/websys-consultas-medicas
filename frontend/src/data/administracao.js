
import {
  obterUsuarios,
  obterUsuarioAutenticado,
  usuarioIsAdmin,
  criarUsuario,
  guardarUsuarios,
} from "./usuarios";

import {
  obterMedicos,
  obterMedicoPorId,
  obterMedicoDaConta,
  associarContaAMedico,
} from "./medicos";

function exigirAdministrador() {
  const usuario = obterUsuarioAutenticado();

  if (!usuario || !usuarioIsAdmin(usuario)) {
    throw new Error(
      "Não tem autorização para executar esta operação."
    );
  }

  if (usuario.ativo === false) {
    throw new Error(
      "A conta administrativa está desactivada."
    );
  }

  return usuario;
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function obterTipo(usuario) {
  return String(usuario?.role || usuario?.tipo || "")
    .trim()
    .toLowerCase();
}

function validarDadosConta({ nome, email, senha }) {
  if (!nome || nome.trim().length < 3) {
    throw new Error(
      "O nome deve ter pelo menos 3 caracteres."
    );
  }

  if (!emailValido(email)) {
    throw new Error("Indique um endereço de email válido.");
  }

  if (!senha || senha.length < 8) {
    throw new Error(
      "A palavra-passe deve ter pelo menos 8 caracteres."
    );
  }
}

function verificarEmailDisponivel(email) {
  const existe = obterUsuarios().some(
    (usuario) =>
      normalizarEmail(usuario.email) === email
  );

  if (existe) {
    throw new Error(
      "Já existe uma conta registada com este email."
    );
  }
}

/**
 * Indica se já existe uma conta administrativa.
 * Considera também contas desactivadas.
 */
export function existeAdministrador() {
  return obterUsuarios().some((usuario) =>
    ["admin", "administrador"].includes(
      obterTipo(usuario)
    )
  );
}

/**
 * Configura a primeira conta administrativa.
 * Só funciona se ainda não existir qualquer administrador.
 */
export function configurarPrimeiroAdministrador(dados) {
  if (existeAdministrador()) {
    throw new Error(
      "Já existe uma conta administrativa."
    );
  }

  const nome = String(dados?.nome || "").trim();
  const email = normalizarEmail(dados?.email);
  const senha = String(dados?.senha || "");

  validarDadosConta({ nome, email, senha });
  verificarEmailDisponivel(email);

  return criarUsuario({
    nome,
    email,
    senha,
    tipo: "admin",
    role: "admin",
    ativo: true,
    criadoEm: new Date().toISOString(),
  });
}

/**
 * Lista os perfis médicos e o estado das respectivas contas.
 */
export function listarEstadoContasMedicas() {
  exigirAdministrador();

  const medicos = obterMedicos();
  const usuarios = obterUsuarios();

  return medicos.map((medico) => {
    const conta = medico.usuarioId == null
      ? null
      : usuarios.find(
          (usuario) =>
            String(usuario.id) ===
            String(medico.usuarioId)
        ) || null;

    return {
      ...medico,
      contaEmail: conta?.email || "",
      contaAtiva: conta ? conta.ativo !== false : false,
      temConta: Boolean(conta),
    };
  });
}

/**
 * Cria uma conta médica e associa-a a um perfil existente.
 */
export function criarContaMedica(dados) {
  exigirAdministrador();

  const medico = obterMedicoPorId(dados?.medicoId);

  if (!medico) {
    throw new Error("Perfil médico não encontrado.");
  }

  if (medico.usuarioId != null) {
    throw new Error(
      "Este perfil médico já tem uma conta associada."
    );
  }

  const nome = String(dados?.nome || "").trim();
  const email = normalizarEmail(dados?.email);
  const senha = String(dados?.senha || "");

  validarDadosConta({ nome, email, senha });
  verificarEmailDisponivel(email);

  const novoUsuario = criarUsuario({
    nome,
    email,
    senha,
    tipo: "medico",
    role: "medico",
    ativo: true,
    criadoEm: new Date().toISOString(),
  });

  try {
    associarContaAMedico(medico.id, novoUsuario.id);
  } catch (erro) {
    // Reverte a conta criada caso a associação falhe.
    const usuariosRestantes = obterUsuarios().filter(
      (usuario) =>
        String(usuario.id) !== String(novoUsuario.id)
    );

    guardarUsuarios(usuariosRestantes);

    throw erro;
  }

  return {
    usuario: novoUsuario,
    medico: obterMedicoPorId(medico.id),
  };
}

/**
 * Associa uma conta médica existente a um perfil sem conta.
 */
export function associarContaMedicaExistente(
  usuarioId,
  medicoId
) {
  exigirAdministrador();

  const usuario = obterUsuarios().find(
    (item) => String(item.id) === String(usuarioId)
  );

  if (!usuario) {
    throw new Error("Conta de utilizador não encontrada.");
  }

  if (!["medico", "médico"].includes(obterTipo(usuario))) {
    throw new Error("A conta seleccionada não é médica.");
  }

  if (usuario.ativo === false) {
    throw new Error("A conta médica está desactivada.");
  }

  if (obterMedicoDaConta(usuario.id)) {
    throw new Error(
      "Esta conta já está associada a um perfil médico."
    );
  }

  const medico = obterMedicoPorId(medicoId);

  if (!medico) {
    throw new Error("Perfil médico não encontrado.");
  }

  if (medico.usuarioId != null) {
    throw new Error(
      "Este perfil já tem uma conta associada."
    );
  }

  return associarContaAMedico(medico.id, usuario.id);
}
