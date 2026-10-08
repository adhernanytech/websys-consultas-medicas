import { Link } from "react-router-dom"

function AcoesRapidas() {


  return (
    <div className="bg-white border border-borda rounded-2xl shadow-sm p-6">

      <h2 className="text-xl font-bold text-texto">
        Ações rápidas
      </h2>

      <p className="text-sm text-texto-secundario mt-1">
        Aceda rapidamente às principais funcionalidades.
      </p>



      <div className="space-y-3 mt-6">

        {/* Encontrar medicos */}

        <Link
          to="/paciente/medicos"
          className="
          bg-white
            border border-borda
            rounded-xl
            p-6
            text-left
            shadow-sm
            hover:shadow-md
            hover:-translate-y-0.5
            transition
            cursor-pointer
            block
          "
        >
          <h3 className="font-semibold text-texto">
            Encontrar médicos
          </h3>

          <p className="text-sm text-texto-secundario mt-1">
            Encontre médicos e consulte as especialidades disponíveis.
          </p>
        </Link>


        {/* Marcar consulta */}

        <Link
          to="/paciente/marcar-consulta"
          className="
          bg-white
            border border-borda
            rounded-xl
            p-6
            text-left
            shadow-sm
            hover:shadow-md
            hover:-translate-y-0.5
            transition
            cursor-pointer
            block
          "
        >
          <p className="font-semibold text-texto">
            Marcar consulta
          </p>

          <p className="text-sm text-texto-secundario mt-1">
            Encontre um médico e marque uma nova consulta.
          </p>

        </Link>


        {/* Minhas consultas */}

        <Link
          to="/paciente/minhas-consultas"
          className="
          bg-white
            border border-borda
            rounded-xl
            p-6
            text-left
            shadow-sm
            hover:shadow-md
            hover:-translate-y-0.5
            transition
            cursor-pointer
            block
          "
        >
          <p className="font-semibold text-texto">
            Minhas consultas
          </p>

          <p className="text-sm text-texto-secundario mt-1">
            Consulte o seu histórico e consultas futuras.
          </p>

        </Link>

        {/* Histórico clínico */}

        <Link
          to="/paciente/historico-clinico"
          className="
          bg-white
            border border-borda
            rounded-xl
            p-6
            text-left
            shadow-sm
            hover:shadow-md
            hover:-translate-y-0.5
            transition
            cursor-pointer
            block
          "
        >
          <p className="font-semibold text-texto">
            Histórico clínico
          </p>

          <p className="text-sm text-texto-secundario mt-1">
            Consulte todos os seus registos clínicos.
          </p>

        </Link>


      </div>

    </div>
  )
}

export default AcoesRapidas