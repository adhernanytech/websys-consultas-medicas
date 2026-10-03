import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import medicos from "../data/medicos"
import DoctorCard from "../components/CardMedico"


function Medicos() {

  const [searchParams, setSearchParams] = useSearchParams()

  /*
    =========
    PARÂMETROS DA URL
    =========

    Podemos receber:

    /medicos?pesquisa=cardiologia

    ou:

    /medicos?especialidade=Cardiologia
  */

  const pesquisaInicial = searchParams.get("pesquisa") || ""
  const especialidadeInicial =
    searchParams.get("especialidade") || ""


  /*
    =========
    ESTADOS
    =========
  */

  const [pesquisa, setPesquisa] = useState(pesquisaInicial)

  const [termoPesquisado, setTermoPesquisado] =
    useState(pesquisaInicial)

  const [especialidadeSelecionada, setEspecialidadeSelecionada] =
    useState(especialidadeInicial)

  const [mensagemPesquisa, setMensagemPesquisa] =
    useState("")



  /*
    =========
    ACTUALIZAR ESTADOS QUANDO A URL MUDAR
    =========

    Isto permite que páginas como:

    /medicos?especialidade=Cardiologia

    funcionem correctamente.
  */

  useEffect(() => {

    const termo =
      searchParams.get("pesquisa") || ""

    const especialidade =
      searchParams.get("especialidade") || ""


    setPesquisa(termo)

    setTermoPesquisado(termo)

    setEspecialidadeSelecionada(especialidade)

  }, [searchParams])



  /*
    =========
    RESULTADOS
    =========

    Existem agora dois tipos de filtro:

    1. Pesquisa por nome ou especialidade
    2. Filtro directo por especialidade

    Os dois podem funcionar separadamente.
  */

  const medicosFiltrados = medicos.filter((medico) => {

    const termo =
      termoPesquisado
        .trim()
        .toLowerCase()

    const especialidade =
      especialidadeSelecionada
        .trim()
        .toLowerCase()


    /*
      --------------------------------------------------------
      PESQUISA POR TEXTO
      --------------------------------------------------------

      Se não existir pesquisa, todos passam nesta condição.
    */

    const correspondePesquisa =
      termo === "" ||
      medico.nome
        .toLowerCase()
        .includes(termo) ||
      medico.especialidade
        .toLowerCase()
        .includes(termo)


    /*
      --------------------------------------------------------
      FILTRO POR ESPECIALIDADE
      --------------------------------------------------------
    */

    const correspondeEspecialidade =
      especialidade === "" ||
      medico.especialidade
        .toLowerCase() === especialidade


    /*
      O médico só aparece se corresponder
      aos filtros activos.
    */

    return (
      correspondePesquisa &&
      correspondeEspecialidade
    )

  })



  /*
    =========
    EXECUTAR PESQUISA
    =========
  */

  function pesquisarMedicos(evento) {

    evento.preventDefault()

    const termo = pesquisa.trim()


    /*
      Campo vazio
    */

    if (termo === "") {

      setMensagemPesquisa(
        "Digite o nome de um médico ou especialidade."
      )

      return

    }


    /*
      Poucos caracteres
    */

    if (termo.length < 2) {

      setMensagemPesquisa(
        "Digite pelo menos 2 caracteres."
      )

      return

    }


    /*
      Pesquisa válida
    */

    setMensagemPesquisa("")


    /*
      Quando fazemos uma nova pesquisa,
      usamos apenas o parâmetro "pesquisa".

      Isto também remove uma eventual
      especialidade que tenha vindo da página
      de Especialidades.
    */

    setSearchParams({
      pesquisa: termo
    })

  }



  /*
    =========
    LIMPAR FILTROS
    =========
  */

  function limparPesquisa() {

    setPesquisa("")

    setMensagemPesquisa("")

    setSearchParams({})

  }



  /*
    =========
    EXISTE ALGUM FILTRO?
    =========
  */

  const existeFiltro =
    termoPesquisado.trim() !== "" ||
    especialidadeSelecionada.trim() !== ""



  return (

    <main className="min-h-screen bg-fundo">


      {/* ====
          CABEÇALHO
      ====*/}

      <section className="bg-white">

        <div className="
          max-w-6xl
          mx-auto
          px-6
          py-14
          sm:py-16
        ">

          <div className="max-w-3xl">

            <p className="
              text-sm
              uppercase
              tracking-widest
              font-semibold
              text-primaria
            ">
              Profissionais
            </p>


            <h1 className="
              text-4xl
              sm:text-5xl
              font-bold
              text-texto
              mt-3
            ">
              Encontre um médico
            </h1>


            <p className="
              text-lg
              text-texto-secundario
              mt-5
              leading-relaxed
            ">
              Pesquise pelo nome do médico ou pela
              especialidade que procura.
            </p>

          </div>



          {/* 
              PESQUISA
          */}

          <form
            onSubmit={pesquisarMedicos}
            className="mt-8 max-w-3xl"
          >

            <div className="
              flex
              flex-col
              sm:flex-row
              gap-3
            ">


              <input
                type="search"
                placeholder="Nome do médico ou especialidade"
                value={pesquisa}
                onChange={(evento) => {
                  setPesquisa(evento.target.value)
                  setMensagemPesquisa("")
                }}
                className="
                  flex-1
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                  outline-none
                  focus:border-primaria
                  focus:ring-2
                  focus:ring-primaria/20
                "
              />


              <button
                type="submit"
                className="
                  bg-primaria
                  text-white
                  px-6
                  py-3
                  rounded-lg
                  font-medium
                  hover:bg-primaria-hover
                  transition
                  cursor-pointer
                "
              >
                Pesquisar
              </button>


              {existeFiltro && (

                <button
                  type="button"
                  onClick={limparPesquisa}
                  className="
                    border
                    border-gray-300
                    text-texto
                    px-6
                    py-3
                    rounded-lg
                    font-medium
                    hover:bg-gray-50
                    transition
                    cursor-pointer
                  "
                >
                  Limpar
                </button>

              )}

            </div>


            {mensagemPesquisa && (

              <p className="
                mt-3
                text-sm
                text-red-600
              ">
                {mensagemPesquisa}
              </p>

            )}

          </form>

        </div>

      </section>



      {/* ====
          RESULTADOS
      ====*/}

      <section className="
        max-w-6xl
        mx-auto
        px-6
        py-12
      ">


        {/* 
            INFORMAÇÃO DO FILTRO
        */}

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
          mb-6
        ">


          <div>


            {/* FILTRO POR ESPECIALIDADE */}

            {especialidadeSelecionada ? (

              <>

                <p className="
                  text-sm
                  text-texto-secundario
                ">
                  Especialidade seleccionada
                </p>


                <h2 className="
                  text-2xl
                  font-bold
                  text-texto
                  mt-1
                ">
                  {especialidadeSelecionada}
                </h2>

              </>


            ) : termoPesquisado ? (

              /* PESQUISA NORMAL */

              <>

                <h2 className="
                  text-2xl
                  font-bold
                  text-texto
                ">
                  Resultados da pesquisa
                </h2>


                <p className="
                  text-texto-secundario
                  mt-1
                ">
                  Resultados para:
                  {" "}

                  <span className="
                    font-medium
                    text-texto
                  ">
                    "{termoPesquisado}"
                  </span>
                </p>

              </>


            ) : (

              /* SEM FILTROS */

              <>

                <h2 className="
                  text-2xl
                  font-bold
                  text-texto
                ">
                  Médicos disponíveis
                </h2>


                <p className="
                  text-texto-secundario
                  mt-1
                ">
                  Consulte os profissionais disponíveis.
                </p>

              </>

            )}

          </div>



          {/* 
              CONTADOR
          */}

          <p className="
            text-sm
            text-texto-secundario
          ">

            {medicosFiltrados.length}

            {" "}

            {medicosFiltrados.length === 1
              ? "médico encontrado"
              : "médicos encontrados"
            }

          </p>

        </div>



        {/* 
            LISTA DE MÉDICOS
        */}

        {medicosFiltrados.length > 0 ? (

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">


            {medicosFiltrados.map((medico) => (

              <DoctorCard
                key={medico.id}
                id={medico.id}
                nome={medico.nome}
                especialidade={medico.especialidade}
                experiencia={medico.experiencia}
              />

            ))}


          </div>


        ) : (

          /* 
             NENHUM RESULTADO
          */

          <div className="
            bg-white
            border
            border-borda
            rounded-2xl
            p-10
            text-center
          ">

            <h3 className="
              text-xl
              font-bold
              text-texto
            ">
              Nenhum médico encontrado
            </h3>


            <p className="
              text-texto-secundario
              mt-3
            ">
              Não encontrámos médicos correspondentes
              aos filtros seleccionados.
            </p>


            <button
              type="button"
              onClick={limparPesquisa}
              className="
                mt-6
                bg-primaria
                text-white
                px-5
                py-2.5
                rounded-lg
                font-medium
                hover:bg-primaria-hover
                transition
                cursor-pointer
              "
            >
              Ver todos os médicos
            </button>

          </div>

        )}

      </section>

    </main>

  )

}

export default Medicos