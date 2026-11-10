/** Estado vazio acessível para tabelas, listas e secções de dashboard. */
function EmptyState({ title = "Sem resultados", description, action, icon = "○" }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
      <div aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primaria/10 text-xl font-semibold text-primaria">
        {icon}
      </div>
      <h2 className="mt-4 text-base font-semibold text-texto">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-texto-secundario">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export default EmptyState
