import {
  obterUsuarioAutenticado,
  usuarioIsMedico,
} from "./usuarios"

const CHAVE_MEDICOS = "medicos"

export function obterMedicos() {
  try {
    const guardados = JSON.parse(
      localStorage.getItem(CHAVE_MEDICOS)
    )

    if (Array.isArray(guardados)) {
      // Migração de demonstrações antigas: só permanecem perfis criados com conta real.
      const perfisValidos = guardados.filter((medico) => medico && medico.usuarioId != null)
      if (perfisValidos.length !== guardados.length) {
        localStorage.setItem(CHAVE_MEDICOS, JSON.stringify(perfisValidos))
      }
      return perfisValidos
    }
  } catch {
    // Recupera os dados iniciais.
  }

  return []
}

export function guardarMedicos(medicos) {
  if (!Array.isArray(medicos)) {
    throw new Error(
      "A lista de médicos deve ser um array."
    )
  }

  localStorage.setItem(
    CHAVE_MEDICOS,
    JSON.stringify(medicos)
  )
}

export function obterMedicoPorId(id) {
  return (
    obterMedicos().find(
      (medico) =>
        String(medico.id) ===
        String(id)
    ) || null
  )
}

export function obterMedicoDaConta(
  usuarioId
) {
  if (usuarioId == null) {
    return null
  }

  return (
    obterMedicos().find(
      (medico) =>
        medico.usuarioId != null &&
        String(medico.usuarioId) ===
          String(usuarioId)
    ) || null
  )
}

export function obterMedicoAutenticado() {
  const usuario =
    obterUsuarioAutenticado()

  if (
    !usuario ||
    !usuarioIsMedico(usuario)
  ) {
    return null
  }

  return obterMedicoDaConta(
    usuario.id
  )
}

export function actualizarPerfilMedico(
  medicoId,
  usuarioId,
  {
    telefone,
    biografia,
    foto,
  } = {}
) {
  if (
    medicoId == null ||
    usuarioId == null
  ) {
    throw new Error(
      "Não foi possível identificar o perfil médico autenticado."
    )
  }

  const medicos =
    obterMedicos()

  const indice =
    medicos.findIndex(
      (medico) =>
        String(medico.id) ===
          String(medicoId) &&
        String(medico.usuarioId) ===
          String(usuarioId)
    )

  if (indice === -1) {
    throw new Error(
      "O perfil médico não pertence à conta autenticada."
    )
  }

  const telefoneFinal =
    String(
      telefone || ""
    ).trim()

  const biografiaFinal =
    String(
      biografia || ""
    ).trim()

  if (telefoneFinal.length > 40) {
    throw new Error(
      "O telefone não pode ultrapassar 40 caracteres."
    )
  }

  if (biografiaFinal.length > 1200) {
    throw new Error(
      "A biografia não pode ultrapassar 1200 caracteres."
    )
  }

  if (
    foto !== undefined &&
    foto !== ""
  ) {
    let fotoValida =
      typeof foto === "string" &&
      foto.startsWith(
        "data:image/"
      ) &&
      foto.length <= 600000

    if (
      !fotoValida &&
      typeof foto === "string" &&
      foto.length <= 2000
    ) {
      try {
        const url =
          new URL(foto)

        fotoValida =
          url.protocol ===
            "https:" ||
          url.protocol ===
            "http:"
      } catch {
        fotoValida = false
      }
    }

    if (!fotoValida) {
      throw new Error(
        "A fotografia seleccionada não é válida."
      )
    }
  }

  medicos[indice] = {
    ...medicos[indice],

    telefone:
      telefoneFinal,

    biografia:
      biografiaFinal,

    ...(foto !== undefined
      ? {
          foto:
            foto || null,
        }
      : {}),
  }

  guardarMedicos(medicos)

  return medicos[indice]
}

export function eliminarMedicoPorId(id) {
  const medicos = obterMedicos()
  const medico = medicos.find((item) => String(item.id) === String(id))
  if (!medico) throw new Error("Médico não encontrado.")
  guardarMedicos(medicos.filter((item) => String(item.id) !== String(id)))
  return medico
}

export default obterMedicos