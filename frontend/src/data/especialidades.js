
import {
  obterUsuarioAutenticado,
  usuarioIsAdmin,
} from "./usuarios"
import { obterMedicos } from "./medicos"
import { registarAccaoUtilizador } from "./auditoriaAdmin"

const CHAVE_ESPECIALIDADES = "especialidades"

function exigirAdministrador() {
  const usuario = obterUsuarioAutenticado()

  if (!usuario || !usuarioIsAdmin(usuario)) {
    throw new Error(
      "Não tem autorização para gerir especialidades."
    )
  }

  if (usuario.ativo === false) {
    throw new Error(
      "A conta administrativa está desactivada."
    )
  }
}

function normalizarNome(nome) {
  return String(nome || "").trim()
}

export function obterEspecialidades() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_ESPECIALIDADES)
    )

    if (Array.isArray(dados)) {
      return dados
    }
  } catch {
    // Os dados serão inicializados abaixo.
  }

  return []
}

export function guardarEspecialidades(especialidades) {
  if (!Array.isArray(especialidades)) {
    throw new Error(
      "A lista de especialidades deve ser um array."
    )
  }

  localStorage.setItem(
    CHAVE_ESPECIALIDADES,
    JSON.stringify(especialidades)
  )
}

export function obterEspecialidadePorId(id) {
  return obterEspecialidades().find(
    (item) => String(item.id) === String(id)
  ) || null
}

export function obterEspecialidadesActivas() {
  return obterEspecialidades().filter(
    (item) => item.ativo !== false
  )
}

export function criarEspecialidade({ nome, descricao = "" }) {
  exigirAdministrador()

  const nomeFinal = normalizarNome(nome)
  const descricaoFinal = String(descricao || "").trim()

  if (nomeFinal.length < 2) {
    throw new Error(
      "O nome da especialidade deve ter pelo menos 2 caracteres."
    )
  }

  const especialidades = obterEspecialidades()

  const duplicada = especialidades.some(
    (item) =>
      item.nome.toLowerCase() === nomeFinal.toLowerCase()
  )

  if (duplicada) {
    throw new Error(
      "Esta especialidade já está registada."
    )
  }

  const ids = especialidades
    .map((item) => Number(item.id))
    .filter((id) => Number.isSafeInteger(id) && id > 0)

  const novaEspecialidade = {
    id: ids.length ? Math.max(...ids) + 1 : 1,
    nome: nomeFinal,
    descricao: descricaoFinal,
    ativo: true,
  }

  guardarEspecialidades([
    ...especialidades,
    novaEspecialidade,
  ])
  registarAccaoUtilizador("Especialidade criada", "especialidade", `${nomeFinal} (ID ${novaEspecialidade.id})`)

  return novaEspecialidade
}

export function actualizarEspecialidade(id, dados) {
  exigirAdministrador()

  const especialidades = obterEspecialidades()
  const indice = especialidades.findIndex(
    (item) => String(item.id) === String(id)
  )

  if (indice === -1) {
    throw new Error("Especialidade não encontrada.")
  }

  const actual = especialidades[indice]
  const nome = normalizarNome(
    dados?.nome ?? actual.nome
  )
  const descricao = String(
    dados?.descricao ?? actual.descricao ?? ""
  ).trim()

  if (nome.length < 2) {
    throw new Error(
      "O nome da especialidade deve ter pelo menos 2 caracteres."
    )
  }

  const duplicada = especialidades.some(
    (item, i) =>
      i !== indice &&
      item.nome.toLowerCase() === nome.toLowerCase()
  )

  if (duplicada) {
    throw new Error(
      "Já existe outra especialidade com esse nome."
    )
  }

  const actualizada = {
    ...actual,
    nome,
    descricao,
  }

  especialidades[indice] = actualizada
  guardarEspecialidades(especialidades)
  registarAccaoUtilizador("Especialidade editada", "especialidade", `${actual.nome} → ${actualizada.nome} (ID ${id})`)

  return actualizada
}

export function actualizarEstadoEspecialidade(id, ativo) {
  exigirAdministrador()

  const especialidades = obterEspecialidades()
  const indice = especialidades.findIndex(
    (item) => String(item.id) === String(id)
  )

  if (indice === -1) {
    throw new Error("Especialidade não encontrada.")
  }

  especialidades[indice] = {
    ...especialidades[indice],
    ativo: Boolean(ativo),
  }

  guardarEspecialidades(especialidades)
  registarAccaoUtilizador(ativo ? "Especialidade activada" : "Especialidade desactivada", "especialidade", `${especialidades[indice].nome} (ID ${id})`)

  return especialidades[indice]
}

export function eliminarEspecialidade(id) {
  exigirAdministrador()
  const especialidades = obterEspecialidades()
  const alvo = especialidades.find((item) => String(item.id) === String(id))
  if (!alvo) throw new Error("Especialidade não encontrada.")
  const medicos = obterMedicos()
  if (medicos.some((medico) => String(medico.especialidadeId) === String(id))) {
    throw new Error("Não é possível eliminar esta especialidade porque está atribuída a um ou mais médicos. Altere primeiro a especialidade desses médicos.")
  }
  guardarEspecialidades(especialidades.filter((item) => String(item.id) !== String(id)))
  registarAccaoUtilizador("Especialidade eliminada", "especialidade", `${alvo.nome} (ID ${id})`)
  return alvo
}

export default obterEspecialidades