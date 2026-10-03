import { Link } from "react-router-dom"

function ProximaConsulta({ consulta }) {

  /*
     SEM PRÓXIMA CONSULTA
  */

  if (!consulta) {

    return (
      <div className="bg-white border border-borda rounded-2xl shadow-sm">

        <div className="p-6">

          <h2 className="text-xl font-bold text-texto">
            Próxima consulta
          </h2>

          <p className="text-sm text-texto-secundario mt-1">
            Consulte os detalhes da sua próxima consulta.
          </p>

          <div className="mt-8 text-center py-8">

            <p className="text-texto font-medium">
              Não tem consultas agendadas.
            </p>

            <p className="text-sm text-texto-secundario mt-2">
              Quando marcar uma consulta, ela aparecerá aqui.
            </p>

          </div>

        </div>

      </div>
    )
  }


  /*
     CLASSE DO ESTADO
  */

  function classeEstado(estado) {

    if (
      estado === "Agendada" ||
      estado === "Confirmada"
    ) {
      return "bg-blue-50 border-blue-200 text-blue-800"
    }


    if (estado === "Concluída") {
      return "bg-blue-50 border-blue-200 text-blue-700"
    }


    if (estado === "Não compareceu") {
      return "bg-yellow-50 border-yellow-200 text-aviso"
    }


    if (estado === "Cancelada") {
      return "bg-red-50 border-red-200 text-erro"
    }


    return "bg-gray-50 border-gray-200 text-gray-700"
  }


  /*
     COM PRÓXIMA CONSULTA
  */

  return (

    <div className="bg-white border border-borda rounded-2xl shadow-sm">


      {/* Cabeçalho */}

      <div className="
        flex
        items-center
        justify-between
        gap-4
        p-6
        border-b
        border-borda
      ">

        <div>

          <h2 className="text-xl font-bold text-texto">
            Próxima consulta
          </h2>

          <p className="text-sm text-texto-secundario mt-1">
            Consulte os detalhes da sua próxima consulta.
          </p>

        </div>


        <span
          className={`
            px-3
            py-1
            rounded-full
            border
            text-sm
            font-medium
            ${classeEstado(consulta.estado)}
          `}
        >
          {consulta.estado}
        </span>

      </div>


      {/* Informações */}

      <div className="p-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


          {/* Data */}

          <div>

            <p className="text-sm text-texto-secundario">
              Data
            </p>

            <p className="font-semibold text-texto mt-1">
              {consulta.data}
            </p>

          </div>


          {/* Hora */}

          <div>

            <p className="text-sm text-texto-secundario">
              Hora
            </p>

            <p className="font-semibold text-texto mt-1">
              {consulta.horario || consulta.hora}
            </p>

          </div>


          {/* Médico */}

          <div>

            <p className="text-sm text-texto-secundario">
              Médico
            </p>

            <p className="font-semibold text-texto mt-1">
              {consulta.medicoNome || consulta.medico}
            </p>

          </div>


          {/* Especialidade */}

          <div>

            <p className="text-sm text-texto-secundario">
              Especialidade
            </p>

            <p className="font-semibold text-texto mt-1">
              {consulta.especialidade}
            </p>

          </div>

        </div>


        {/* Botões */}

        <div className="
          flex
          flex-col
          sm:flex-row
          gap-3
          mt-6
        ">

          <Link
            to={`/paciente/minhas-consultas/${consulta.id}`}
            className="
              flex-1
              bg-primaria
              text-white
              px-5
              py-3
              rounded-lg
              font-medium
              hover:bg-primaria-hover
              transition
              cursor-pointer
              text-center
            "
          >
            Ver detalhes
          </Link>


          <Link
            to={`/paciente/minhas-consultas/${consulta.id}`}
            className="
              flex-1
              border
              border-borda
              text-texto
              px-5
              py-3
              rounded-lg
              font-medium
              hover:bg-gray-50
              transition
              cursor-pointer
              text-center
            "
          >
            Gerir consulta
          </Link>

        </div>

      </div>

    </div>

  )
}

export default ProximaConsulta