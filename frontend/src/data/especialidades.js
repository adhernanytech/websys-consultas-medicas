
import {
  obterUsuarioAutenticado,
  usuarioIsAdmin,
} from "./usuarios"

const CHAVE_ESPECIALIDADES = "especialidades"

const especialidadesIniciais = [
  { id: 1, nome: "Cardiologia", descricao: "", ativo: true },
  { id: 2, nome: "Pediatria", descricao: "", ativo: true },
  { id: 3, nome: "Dermatologia", descricao: "", ativo: true },
  { id: 4, nome: "Ortopedia", descricao: "", ativo: true },
  { id: 5, nome: "Neurologia", descricao: "", ativo: true },
  { id: 6, nome: "Oftalmologia", descricao: "", ativo: true },
  { id: 7, nome: "Cirurgia Geral", descricao: "", ativo: true },
]

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

  guardarEspecialidades(especialidadesIniciais)
  return especialidadesIniciais
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

  return especialidades[indice]
}

export default especialidadesIniciais