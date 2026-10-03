function EspecialidadeCard({ nome, descricao}) {
  return (
    <div className="bg-white border border-borda-1 rounded-xl p-5 shadow-md">

      <h3 className="text-xl font-bold text-texto">
        {nome}
      </h3>

      <p className="text-texto-secundario mt-2">
        {descricao}
      </p>
      
      <button className="mt-4 text-primaria font-medium hover:text-primaria-hover">
        Ver médicos
      </button>

    </div>
  )
}

export default EspecialidadeCard