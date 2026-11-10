import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { obterUsuarioAutenticado } from "../data/usuarios"
import { registarAccaoUtilizador } from "../data/auditoriaAdmin"

/** Regista navegação entre áreas relevantes, sem guardar cliques ou valores de formulários. */
export default function ActivityTracker() {
  const location = useLocation()
  const previous = useRef("")

  useEffect(() => {
    const user = obterUsuarioAutenticado()
    // Guardamos apenas o caminho, nunca parâmetros da URL que possam conter tokens ou dados sensíveis.
    const path = location.pathname
    if (user && previous.current !== path) {
      registarAccaoUtilizador("Página/área consultada", "navegação", path)
    }
    previous.current = path
  }, [location.pathname, location.search])

  return null
}
