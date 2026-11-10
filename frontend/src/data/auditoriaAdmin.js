import { obterUsuarioAutenticado, usuarioIsAdmin } from "./usuarios"

const CHAVE = "auditoriaAdministrativa"

export function registarAccaoAdmin(acao, entidade = "sistema", detalhes = "") {
  const utilizador = obterUsuarioAutenticado()
  if (!utilizador || !usuarioIsAdmin(utilizador) || utilizador.ativo === false) return
  let registos = []
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]")
    if (Array.isArray(dados)) registos = dados
  } catch { /* recupera a lista de auditoria se o valor local estiver inválido */ }
  registos.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    data: new Date().toISOString(),
    utilizadorId: utilizador.id,
    utilizadorNome: utilizador.nome || utilizador.email || "Administrador",
    acao: String(acao || "Operação administrativa"),
    entidade: String(entidade || "sistema"),
    detalhes: String(detalhes || ""),
  })
  try { localStorage.setItem(CHAVE, JSON.stringify(registos.slice(0, 2000))) } catch { /* não bloquear a operação administrativa por falta de espaço */ }
}

export function registarAccaoUtilizador(acao, entidade = "interface", detalhes = "") {
  const utilizador = obterUsuarioAutenticado()
  if (!utilizador) return
  let registos = []
  try { const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]"); if (Array.isArray(dados)) registos = dados } catch { /* registo corrompido */ }
  registos.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, data: new Date().toISOString(), utilizadorId: utilizador.id, utilizadorNome: utilizador.nome || utilizador.email || "Utilizador", utilizadorTipo: utilizador.tipo || utilizador.role || "desconhecido", acao: String(acao || "Acção de utilizador"), entidade: String(entidade || "interface"), detalhes: String(detalhes || "") })
  try { localStorage.setItem(CHAVE, JSON.stringify(registos.slice(0, 2000))) } catch { /* a auditoria nunca deve bloquear a operação principal */ }
}

export function obterAuditoriaAdmin() {
  // Os registos de auditoria são consultáveis apenas pela conta administrativa.
  // Esta verificação protege a interface; a futura API deverá impor a mesma regra no servidor.
  const utilizador = obterUsuarioAutenticado()
  if (!utilizador || !usuarioIsAdmin(utilizador) || utilizador.ativo === false) return []
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]")
    return Array.isArray(dados) ? dados : []
  } catch { return [] }
}

export const CHAVE_AUDITORIA_ADMIN = CHAVE
