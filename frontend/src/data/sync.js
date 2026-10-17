// Sistema de sincronização de dados em localStorage
// Permite que múltiplas abas/componentes se mantenham sincronizados

const listeners = {}

export function obterStorage(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave))
    return dados || null
  } catch {
    return null
  }
}

export function guardarStorage(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados))
  dispararMudanca(chave)
}

export function adicionarOuvinte(chave, callback) {
  if (!listeners[chave]) {
    listeners[chave] = []
  }

  listeners[chave].push(callback)

  // Retornar função para remover listener
  return () => {
    listeners[chave] = listeners[chave].filter(
      (cb) => cb !== callback
    )
  }
}

export function dispararMudanca(chave) {
  if (listeners[chave]) {
    listeners[chave].forEach((callback) => {
      try {
        callback()
      } catch (erro) {
        console.error(`Erro ao executar listener para ${chave}:`, erro)
      }
    })
  }
}

// Sincronizar com outras abas/janelas
window.addEventListener("storage", (evento) => {
  if (evento.key) {
    dispararMudanca(evento.key)
  }
})

// Sincronizar quando a página ganha foco (volta da aba inativa)
window.addEventListener("focus", () => {
  // Revalidar todos os dados importantes
  const chaves = ["consultas", "usuarios", "registosClinicos", "disponibilidades"]
  chaves.forEach((chave) => dispararMudanca(chave))
})
