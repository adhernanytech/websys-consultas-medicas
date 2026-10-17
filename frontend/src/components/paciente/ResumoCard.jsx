function ResumoCard({
  titulo,
  valor,
  descricao
}) {

  return (
    <div className="bg-white border border-borda rounded-2xl p-6 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-texto-secundario">
            {titulo}
          </p>

          <p className="text-3xl font-bold text-texto mt-3">
            {valor}
          </p>

          <p className="text-sm text-texto-secundario mt-2">
            {descricao}
          </p>

        </div>


        <div className="w-11 h-11 rounded-xl bg-primaria/10 flex items-center justify-center">

          <span className="text-primaria font-bold text-lg">
            +
          </span>

        </div>

      </div>

    </div>
  )
}

export default ResumoCard