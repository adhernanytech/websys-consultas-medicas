export function obterDestinoPainel(usuario) {
  const tipo = String(usuario?.tipo ?? usuario?.role ?? "").toLowerCase()

  if (tipo === "admin" || tipo === "administrador") {
    return "/admin/dashboard"
  }
  if (tipo === "medico" || tipo === "médico") {
    return "/medico/dashboard"
  }
  if (tipo === "paciente") {
    return "/paciente/dashboard"
  }

  return "/login"
}
