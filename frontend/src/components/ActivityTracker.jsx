import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { registarAccaoUtilizador } from "../data/auditoriaAdmin"

/** Regista navegação entre áreas relevantes, sem guardar cliques ou valores de formulários. */
export default function ActivityTracker() {
  const location = useLocation()
  const { usuario } = useAuth()
  const previous = useRef("")

  useEffect(() => {
    // Guardamos apenas o caminho, nunca parâmetros da URL que possam conter tokens ou dados sensíveis.
    const path = location.pathname
    if (usuario && previous.current !== path) {
      registarAccaoUtilizador("Página/área consultada", "navegação", path)
    }
    previous.current = path
  }, [location.pathname, usuario])

  return null
}
