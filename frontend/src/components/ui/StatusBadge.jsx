const ESTILOS = {
  agendada: "bg-sky-50 text-sky-700 ring-sky-600/20",
  confirmada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  concluida: "bg-slate-100 text-slate-700 ring-slate-600/20",
  cancelada: "bg-rose-50 text-rose-700 ring-rose-600/20",
  pendente: "bg-amber-50 text-amber-800 ring-amber-600/20",
  activa: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactiva: "bg-slate-100 text-slate-600 ring-slate-500/20",
  disponivel: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  ocupada: "bg-amber-50 text-amber-800 ring-amber-600/20",
}

function normalizarEstado(estado) {
  return String(estado || "").trim().toLocaleLowerCase("pt-PT")
    .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
}

/** Badge puramente visual; não altera nem valida o estado de negócio. */
function StatusBadge({ estado, className = "" }) {
  const chave = normalizarEstado(estado)
  const estilo = ESTILOS[chave] || "bg-gray-100 text-gray-700 ring-gray-500/20"
  const rotulo = String(estado || "Sem estado")

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estilo} ${className}`.trim()}>
      {rotulo}
    </span>
  )
}

export default StatusBadge
