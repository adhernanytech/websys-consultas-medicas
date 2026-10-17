import { useEffect, useState } from "react"
import { adicionarOuvinte } from "../data/sync"

// Hook customizado para sincronizar dados com localStorage
// Força re-render quando localStorage é atualizado
export function useStorageSync(chave) {
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    // Quando houver mudança no storage, incrementa versão para forçar re-render
    const removerOuvinte = adicionarOuvinte(chave, () => {
      setVersao((v) => v + 1)
    })

    return removerOuvinte
  }, [chave])

  // Retornar a versão atual (força re-render quando muda)
  return versao
}
