import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import DoctorCard from "../components/CardMedico"
import EspecialidadeCard from "../components/EspecialidadeCard"

import medicos from "../data/medicos"
import especialidades from "../data/especialidades"


function Home() {

  const [pesquisa, setPesquisa] = useState("")
  const [mensagemPesquisa, setMensagemPesquisa] = useState("")

  const navegar = useNavigate()


  /*
    MÉDICOS EM DESTAQUE

    Por enquanto mostramos apenas alguns médicos.
    A página /medicos continuará a mostrar todos.
  */

  const medicosDestaque = medicos.slice(0, 3)


  /*
    ESPECIALIDADES EM DESTAQUE

    Por enquanto mostramos apenas algumas.
    A página /especialidades continuará a mostrar todas.
  */

  const especialidadesDestaque = especialidades.slice(0, 3)


  /*
    PESQUISA
  */

  function pesquisarMedicos(evento) {

    evento.preventDefault()

    const termo = pesquisa.trim()

    if (termo === "") {
      setMensagemPesquisa(
        "Digite o nome de um médico ou especialidade."
      )
      return
    }

    if (termo.length < 2) {
      setMensagemPesquisa(
        "Digite pelo menos 2 caracteres."
      )
      return
    }

    /*
      A pesquisa da Home serve principalmente
      como ponto de entrada.

      Depois podemos melhorar isto para transportar
      o termo directamente para /medicos.
    */

    navegar(`/medicos?pesquisa=${encodeURIComponent(termo)}`)
  }


  return (

    <main className="bg-fundo min-h-screen">


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="bg-white">

        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 lg:py-24">

          <div className="max-w-4xl mx-auto text-center">

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              Cuidados de saúde mais acessíveis
            </p>

            <h1 className="
              text-4xl
              sm:text-5xl
              lg:text-6xl
              font-bold
              text-texto
              mt-4
              leading-tight
            ">
              Encontre o médico certo
              <span className="block text-primaria">
                para a sua consulta.
              </span>
            </h1>

            <p className="
              text-lg
              sm:text-xl
              text-texto-secundario
              mt-6
              max-w-2xl
              mx-auto
              leading-relaxed
            ">
              Consulte médicos e especialidades disponíveis,
              encontre o profissional que procura e marque
              a sua consulta de forma simples e conveniente.
            </p>


            {/* PESQUISA */}

            <form
              onSubmit={pesquisarMedicos}
              className="
                mt-8
                max-w-2xl
                mx-auto
              "
            >

              <div className="
                flex
                flex-col
                sm:flex-row
                gap-3
              ">

                <input
                  type="search"
                  placeholder="Pesquisar médico ou especialidade"
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

              </div>

            </form>


            {mensagemPesquisa && (

              <p className="mt-3 text-sm text-red-600">
                {mensagemPesquisa}
              </p>

            )}


            {/* BOTÕES PRINCIPAIS */}

            <div className="
              flex
              flex-col
              sm:flex-row
              justify-center
              gap-3
              mt-6
            ">

              <button
                type="button"
                onClick={() => navegar("/medicos")}
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
                Encontrar um médico
              </button>


              <Link
                to="/registro"
                className="
                  border
                  border-primaria
                  text-primaria
                  px-6
                  py-3
                  rounded-lg
                  font-medium
                  hover:bg-primaria/5
                  transition
                "
              >
                Criar uma conta
              </Link>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          ESPECIALIDADES
      ====================================================== */}

      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-end
          sm:justify-between
          gap-4
        ">

          <div>

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              Especialidades
            </p>

            <h2 className="
              text-3xl
              font-bold
              text-texto
              mt-2
            ">
              Cuidados para diferentes necessidades
            </h2>

            <p className="
              text-texto-secundario
              mt-3
              max-w-2xl
            ">
              Conheça algumas das especialidades disponíveis
              na nossa instituição.
            </p>

          </div>


          <Link
            to="/especialidades"
            className="
              text-primaria
              font-medium
              hover:text-primaria-hover
              transition
            "
          >
            Ver todas →
          </Link>

        </div>


        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
          mt-8
        ">

          {especialidadesDestaque.map((especialidade) => (

            <EspecialidadeCard
              key={especialidade.id}
              nome={especialidade.nome}
              descricao={especialidade.descricao}
            />

          ))}

        </div>

      </section>



      {/* =====================================================
          MÉDICOS EM DESTAQUE
      ====================================================== */}

      <section className="bg-white border-y border-borda">

        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            sm:justify-between
            gap-4
          ">

            <div>

              <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
                Profissionais
              </p>

              <h2 className="
                text-3xl
                font-bold
                text-texto
                mt-2
              ">
                Conheça os nossos médicos
              </h2>

              <p className="
                text-texto-secundario
                mt-3
                max-w-2xl
              ">
                Consulte os profissionais disponíveis e
                conheça as suas áreas de especialização.
              </p>

            </div>


            <Link
              to="/medicos"
              className="
                text-primaria
                font-medium
                hover:text-primaria-hover
                transition
              "
            >
              Ver todos →
            </Link>

          </div>


          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            mt-8
          ">

            {medicosDestaque.map((medico) => (

              <DoctorCard
                key={medico.id}
                id={medico.id}
                nome={medico.nome}
                especialidade={medico.especialidade}
                experiencia={medico.experiencia}
              />

            ))}

          </div>

        </div>

      </section>



      {/* =====================================================
          COMO FUNCIONA
      ====================================================== */}

      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

        <div className="text-center max-w-2xl mx-auto">

          <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
            Como funciona
          </p>

          <h2 className="
            text-3xl
            font-bold
            text-texto
            mt-3
          ">
            Marcar uma consulta é simples
          </h2>

          <p className="
            text-texto-secundario
            mt-4
            leading-relaxed
          ">
            Em poucos passos pode encontrar um profissional,
            escolher um horário disponível e acompanhar
            a sua consulta através da plataforma.
          </p>

        </div>


        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-6
          mt-10
        ">


          {/* PASSO 1 */}

          <article className="text-center p-5">

            <div className="
              mx-auto
              w-12
              h-12
              rounded-full
              bg-primaria
              text-white
              flex
              items-center
              justify-center
              font-bold
            ">
              1
            </div>

            <h3 className="font-bold text-texto mt-4">
              Encontre
            </h3>

            <p className="
              text-sm
              text-texto-secundario
              mt-2
              leading-relaxed
            ">
              Procure um médico ou uma especialidade.
            </p>

          </article>


          {/* PASSO 2 */}

          <article className="text-center p-5">

            <div className="
              mx-auto
              w-12
              h-12
              rounded-full
              bg-primaria
              text-white
              flex
              items-center
              justify-center
              font-bold
            ">
              2
            </div>

            <h3 className="font-bold text-texto mt-4">
              Escolha
            </h3>

            <p className="
              text-sm
              text-texto-secundario
              mt-2
              leading-relaxed
            ">
              Consulte o perfil e as informações do médico.
            </p>

          </article>


          {/* PASSO 3 */}

          <article className="text-center p-5">

            <div className="
              mx-auto
              w-12
              h-12
              rounded-full
              bg-primaria
              text-white
              flex
              items-center
              justify-center
              font-bold
            ">
              3
            </div>

            <h3 className="font-bold text-texto mt-4">
              Marque
            </h3>

            <p className="
              text-sm
              text-texto-secundario
              mt-2
              leading-relaxed
            ">
              Escolha uma data e horário disponíveis.
            </p>

          </article>


          {/* PASSO 4 */}

          <article className="text-center p-5">

            <div className="
              mx-auto
              w-12
              h-12
              rounded-full
              bg-primaria
              text-white
              flex
              items-center
              justify-center
              font-bold
            ">
              4
            </div>

            <h3 className="font-bold text-texto mt-4">
              Acompanhe
            </h3>

            <p className="
              text-sm
              text-texto-secundario
              mt-2
              leading-relaxed
            ">
              Consulte e acompanhe as suas consultas.
            </p>

          </article>

        </div>

      </section>



      {/* =====================================================
          VANTAGENS
      ====================================================== */}

      <section className="bg-white border-y border-borda">

        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              A plataforma
            </p>

            <h2 className="
              text-3xl
              font-bold
              text-texto
              mt-3
            ">
              Pensada para facilitar o seu atendimento
            </h2>

          </div>


          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-6
            mt-10
          ">


            <article className="
              border
              border-borda
              rounded-2xl
              p-6
            ">

              <h3 className="text-lg font-bold text-texto">
                Simples
              </h3>

              <p className="
                text-texto-secundario
                mt-3
                leading-relaxed
              ">
                Uma experiência simples para encontrar
                médicos e gerir as suas consultas.
              </p>

            </article>


            <article className="
              border
              border-borda
              rounded-2xl
              p-6
            ">

              <h3 className="text-lg font-bold text-texto">
                Organizado
              </h3>

              <p className="
                text-texto-secundario
                mt-3
                leading-relaxed
              ">
                Tenha as informações das suas consultas
                organizadas num único espaço.
              </p>

            </article>


            <article className="
              border
              border-borda
              rounded-2xl
              p-6
            ">

              <h3 className="text-lg font-bold text-texto">
                Conveniente
              </h3>

              <p className="
                text-texto-secundario
                mt-3
                leading-relaxed
              ">
                Consulte informações e realize determinadas
                tarefas sem depender exclusivamente do atendimento presencial.
              </p>

            </article>


            <article className="
              border
              border-borda
              rounded-2xl
              p-6
            ">

              <h3 className="text-lg font-bold text-texto">
                Acompanhamento
              </h3>

              <p className="
                text-texto-secundario
                mt-3
                leading-relaxed
              ">
                Acompanhe as suas consultas e tenha acesso
                às informações importantes da sua marcação.
              </p>

            </article>

          </div>

        </div>

      </section>



      {/* =====================================================
          SOBRE A INSTITUIÇÃO
      ====================================================== */}

      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-10
          items-center
        ">

          <div>

            <p className="
              text-sm
              uppercase
              tracking-widest
              font-semibold
              text-primaria
            ">
              Sobre a instituição
            </p>

            <h2 className="
              text-3xl
              font-bold
              text-texto
              mt-3
            ">
              Uma plataforma criada para aproximar pacientes e profissionais
            </h2>

            <p className="
              text-texto-secundario
              mt-5
              leading-relaxed
            ">
              A nossa plataforma foi desenvolvida para facilitar
              o acesso aos serviços da instituição e tornar o processo
              de marcação e acompanhamento das consultas mais organizado.
            </p>

            <Link
              to="/sobre"
              className="
                inline-block
                mt-6
                text-primaria
                font-medium
                hover:text-primaria-hover
                transition
              "
            >
              Conheça a instituição →
            </Link>

          </div>


          <div className="
            bg-primaria
            text-white
            rounded-2xl
            p-8
            sm:p-10
          ">

            <h3 className="text-2xl font-bold">
              O cuidado começa antes da consulta.
            </h3>

            <p className="
              text-blue-100
              mt-4
              leading-relaxed
            ">
              Desde a escolha do profissional até ao acompanhamento
              da consulta, procuramos tornar cada etapa mais simples
              para o paciente.
            </p>

          </div>

        </div>

      </section>



      {/* =====================================================
          CTA FINAL
      ====================================================== */}

      <section className="max-w-6xl mx-auto px-6 pb-16">

        <div className="
          bg-primaria
          text-white
          rounded-2xl
          px-6
          py-10
          sm:px-10
          sm:py-12
          text-center
        ">

          <h2 className="
            text-2xl
            sm:text-3xl
            font-bold
          ">
            Pronto para encontrar o seu médico?
          </h2>

          <p className="
            text-blue-100
            mt-3
            max-w-2xl
            mx-auto
          ">
            Encontre um profissional ou crie a sua conta
            para começar a utilizar a plataforma.
          </p>


          <div className="
            flex
            flex-col
            sm:flex-row
            justify-center
            gap-3
            mt-7
          ">

            <Link
              to="/medicos"
              className="
                bg-white
                text-primaria
                px-6
                py-3
                rounded-lg
                font-medium
                hover:bg-gray-100
                transition
              "
            >
              Encontrar médicos
            </Link>


            <Link
              to="/registro"
              className="
                border
                border-white/40
                text-white
                px-6
                py-3
                rounded-lg
                font-medium
                hover:bg-white/10
                transition
              "
            >
              Criar uma conta
            </Link>

          </div>

        </div>

      </section>

    </main>
  )
}

export default Home