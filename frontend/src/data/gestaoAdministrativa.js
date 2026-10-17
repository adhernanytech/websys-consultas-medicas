import {
  obterUsuarios,
  obterUsuarioAutenticado,
  usuarioIsAdmin,
  actualizarUsuario,
} from "./usuarios"

import { obterMedicoDaConta } from "./medicos"

function exigirAdministrador() {
  const usuario = obterUsuarioAutenticado()

  if (!usuario || !usuarioIsAdmin(usuario)) {
    throw new Error(
      "Não tem autorização para executar esta operação."
    )
  }

  if (usuario.ativo === false) {
    throw new Error(
      "A conta administrativa está desactivada."
    )
  }

  return usuario
}

function obterTipo(usuario) {
  return String(
    usuario?.tipo ||
    usuario?.role ||
    ""
  )
    .trim()
    .toLowerCase()
    .replace("é", "e")
}

export function obterUtilizadoresAdministrativos() {
  exigirAdministrador()

  return obterUsuarios()
}

export function obterUtilizadoresPorTipo(tipo) {
  exigirAdministrador()

  const tipoNormalizado = String(
    tipo || ""
  )
    .trim()
    .toLowerCase()

  return obterUsuarios().filter(
    (usuario) =>
      obterTipo(usuario) === tipoNormalizado
  )
}

export function actualizarEstadoUtilizador(
  usuarioId,
  ativo
) {
  const administrador =
    exigirAdministrador()

  if (
    String(usuarioId) ===
    String(administrador.id)
  ) {
    throw new Error(
      "Não é possível alterar o estado da própria conta administrativa."
    )
  }

  const usuarios = obterUsuarios()

  const utilizador =
    usuarios.find(
      (usuario) =>
        String(usuario.id) ===
        String(usuarioId)
    )

  if (!utilizador) {
    throw new Error(
      "Utilizador não encontrado."
    )
  }

  const tipo =
    obterTipo(utilizador)

  if (
    tipo === "admin" ||
    tipo === "administrador"
  ) {
    const administradoresActivos =
      usuarios.filter(
        (usuario) =>
          ["admin", "administrador"].includes(
            obterTipo(usuario)
          ) &&
          usuario.ativo !== false
      )

    if (
      !ativo &&
      administradoresActivos.length <= 1
    ) {
      throw new Error(
        "Não é possível desactivar o último administrador activo."
      )
    }
  }

  return actualizarUsuario(
    utilizador.id,
    {
      ativo: Boolean(ativo),
      actualizadoEm:
        new Date().toISOString(),
    }
  )
}

export function obterEstadoContaMedica(
  usuarioId
) {
  exigirAdministrador()

  const usuario =
    obterUsuarios().find(
      (item) =>
        String(item.id) ===
        String(usuarioId)
    )

  if (!usuario) {
    return null
  }

  const medico =
    obterMedicoDaConta(usuario.id)

  return {
    usuario,
    medico,
    temPerfil: Boolean(medico),
    activa: usuario.ativo !== false,
  }
}