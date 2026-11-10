function estiloLink({ isActive }) {
  return isActive
    ? "rounded-lg bg-white/12 px-3 py-2 font-semibold text-white shadow-sm underline decoration-white/60 underline-offset-8"
    : "rounded-lg px-3 py-2 font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
}
export default estiloLink
