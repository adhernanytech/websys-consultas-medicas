import { Link } from "react-router-dom"

import especialidades from "../data/especialidades"

function Especialidades() {
  return (
    <main className="min-h-screen bg-fundo">
      {/* Cabeçalho */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              Especialidades médicas
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold text-texto mt-3">
              Conheça as nossas especialidades
            </h1>

            <p className="text-lg text-texto-secundario mt-5 leading-relaxed">
              Explore as áreas médicas disponíveis na instituição e encontre
              profissionais de acordo com a especialidade que procura.
            </p>
          </div>
        </div>
      </section>

      {/* Lista de especialidades */}
      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-texto">
              Especialidades disponíveis
            </h2>

            <p className="text-texto-secundario mt-2">
              Seleccione uma especialidade para conhecer os médicos disponíveis.
            </p>
          </div>

          <span className="text-sm text-texto-secundario">
            {especialidades.length} especialidades
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialidades.map((especialidade) => (
            <article
              key={especialidade.id}
              className="bg-white border border-borda rounded-2xl p-6 shadow-sm flex flex-col"
            >
              {/* Ícone/letra */}
              <div className="w-12 h-12 rounded-xl bg-primaria/10 flex items-center justify-center text-primaria font-bold text-lg">
                {especialidade.nome.charAt(0).toUpperCase()}
              </div>

              {/* Nome */}
              <h3 className="text-xl font-bold text-texto mt-5">
                {especialidade.nome}
              </h3>

              {/* Descrição */}
              <p className="text-texto-secundario mt-3 leading-relaxed flex-1">
                {especialidade.descricao}
              </p>

              {/* Ver médicos */}
              <Link
                to={`/medicos?especialidade=${encodeURIComponent(
                  especialidade.nome
                )}`}
                className="mt-6 inline-flex justify-center bg-primaria text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primaria-hover transition"
              >
                Ver médicos
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white border border-borda rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-texto">
            Já sabe qual médico procura?
          </h2>

          <p className="text-texto-secundario mt-3">
            Pesquise directamente pelo nome do médico ou pela especialidade.
          </p>

          <Link
            to="/medicos"
            className="inline-block mt-6 bg-primaria text-white px-6 py-3 rounded-lg font-medium hover:bg-primaria-hover transition"
          >
            Procurar médicos
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Especialidades