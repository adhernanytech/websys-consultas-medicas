/** Cabeçalho reutilizável para páginas internas dos painéis. */
function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primaria">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-texto sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-texto-secundario sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export default PageHeader
