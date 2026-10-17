import { Link } from "react-router-dom"

function SobreNos() {

  return (

    <main className="min-h-screen bg-fundo">

      {/* 
          APRESENTAÇÃO
      */}

      <section className="bg-white">

        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">

          <div className="max-w-3xl">

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              SobreNos a instituição
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold text-texto mt-4 leading-tight">
              Cuidamos da sua saúde com proximidade e organização.
            </h1>

            <p className="text-lg text-texto-secundario mt-6 leading-relaxed">
              Esta plataforma foi criada para facilitar o acesso aos
              serviços da clínica, permitindo que os pacientes encontrem
              médicos, conheçam as especialidades disponíveis e realizem
              a marcação das suas consultas de forma simples e conveniente.
            </p>

          </div>

        </div>

      </section>


      {/* 
          QUEM SOMOS
      */}

      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          <div>

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              Quem somos
            </p>

            <h2 className="text-3xl font-bold text-texto mt-3">
              Uma instituição dedicada ao cuidado dos seus pacientes
            </h2>

            <p className="text-texto-secundario mt-5 leading-relaxed">
              Somos uma instituição de saúde comprometida em prestar
              cuidados médicos de forma responsável, próxima e organizada.
              A nossa atuação procura colocar o paciente no centro do
              atendimento, proporcionando uma experiência cada vez mais
              simples desde a marcação da consulta até ao atendimento.
            </p>

            <p className="text-texto-secundario mt-4 leading-relaxed">
              A plataforma online complementa esse compromisso ao permitir
              que os pacientes tenham acesso aos serviços da instituição
              sem depender exclusivamente do atendimento presencial para
              realizar determinadas tarefas.
            </p>

          </div>


          <div className="
            bg-primaria
            text-white
            rounded-2xl
            p-8
            sm:p-10
          ">

            <p className="text-blue-100 text-sm uppercase tracking-widest font-semibold">
              O nosso compromisso
            </p>

            <h3 className="text-2xl font-bold mt-3">
              Tornar o acesso aos cuidados de saúde mais simples.
            </h3>

            <p className="text-blue-50 mt-5 leading-relaxed">
              Trabalhamos para oferecer um atendimento organizado,
              acessível e centrado nas necessidades dos nossos pacientes.
            </p>

          </div>

        </div>

      </section>


      {/* 
          MISSÃO / VISÃO / VALORES
      */}

      <section className="bg-white border-y border-borda">

        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              Os nossos princípios
            </p>

            <h2 className="text-3xl font-bold text-texto mt-3">
              O que orienta o nosso trabalho
            </h2>

            <p className="text-texto-secundario mt-4">
              Estes princípios representam a forma como procuramos
              prestar os nossos serviços aos pacientes.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">


            {/* MISSÃO */}

            <article className="
              border
              border-borda
              rounded-2xl
              p-6
              bg-fundo
            ">

              <div className="
                w-12
                h-12
                rounded-xl
                bg-primaria/10
                flex
                items-center
                justify-center
                text-primaria
                font-bold
                text-lg
              ">
                M
              </div>

              <h3 className="text-xl font-bold text-texto mt-5">
                Missão
              </h3>

              <p className="text-texto-secundario mt-3 leading-relaxed">
                Prestar cuidados de saúde com responsabilidade,
                proximidade e atenção às necessidades de cada paciente.
              </p>

            </article>


            {/* VISÃO */}

            <article className="
              border
              border-borda
              rounded-2xl
              p-6
              bg-fundo
            ">

              <div className="
                w-12
                h-12
                rounded-xl
                bg-primaria/10
                flex
                items-center
                justify-center
                text-primaria
                font-bold
                text-lg
              ">
                V
              </div>

              <h3 className="text-xl font-bold text-texto mt-5">
                Visão
              </h3>

              <p className="text-texto-secundario mt-3 leading-relaxed">
                Evoluir continuamente os nossos serviços e utilizar
                a tecnologia para tornar o atendimento mais acessível
                e organizado.
              </p>

            </article>


            {/* VALORES */}

            <article className="
              border
              border-borda
              rounded-2xl
              p-6
              bg-fundo
            ">

              <div className="
                w-12
                h-12
                rounded-xl
                bg-primaria/10
                flex
                items-center
                justify-center
                text-primaria
                font-bold
                text-lg
              ">
                V
              </div>

              <h3 className="text-xl font-bold text-texto mt-5">
                Valores
              </h3>

              <p className="text-texto-secundario mt-3 leading-relaxed">
                Respeito, responsabilidade, ética, qualidade e
                compromisso com o bem-estar dos nossos pacientes.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* 
          SERVIÇOS
      */}

      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

        <div className="max-w-2xl">

          <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
            Os nossos serviços
          </p>

          <h2 className="text-3xl font-bold text-texto mt-3">
            Cuidados e serviços disponíveis
          </h2>

          <p className="text-texto-secundario mt-4 leading-relaxed">
            A instituição disponibiliza diferentes serviços de saúde
            de acordo com as especialidades e profissionais disponíveis.
          </p>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">


          <article className="
            bg-white
            border
            border-borda
            rounded-2xl
            p-6
            shadow-sm
          ">

            <h3 className="text-xl font-bold text-texto">
              Consultas médicas
            </h3>

            <p className="text-texto-secundario mt-3 leading-relaxed">
              Acesso a consultas com profissionais de diferentes
              especialidades disponíveis na instituição.
            </p>

          </article>


          <article className="
            bg-white
            border
            border-borda
            rounded-2xl
            p-6
            shadow-sm
          ">

            <h3 className="text-xl font-bold text-texto">
              Atendimento especializado
            </h3>

            <p className="text-texto-secundario mt-3 leading-relaxed">
              Serviços realizados por profissionais especializados
              de acordo com as áreas médicas disponíveis.
            </p>

          </article>


          <article className="
            bg-white
            border
            border-borda
            rounded-2xl
            p-6
            shadow-sm
          ">

            <h3 className="text-xl font-bold text-texto">
              Marcação de consultas
            </h3>

            <p className="text-texto-secundario mt-3 leading-relaxed">
              Possibilidade de consultar médicos disponíveis e
              solicitar consultas através da plataforma online.
            </p>

          </article>

        </div>

      </section>


      {/* 
          PLATAFORMA
      */}

      <section className="bg-white border-y border-borda">

        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm uppercase tracking-widest font-semibold text-primaria">
              Atendimento online
            </p>

            <h2 className="text-3xl font-bold text-texto mt-3">
              Uma forma mais simples de gerir as suas consultas
            </h2>

            <p className="text-texto-secundario mt-4 leading-relaxed">
              A plataforma permite que o paciente encontre médicos,
              consulte especialidades, marque consultas e acompanhe
              os seus agendamentos num único espaço.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">


            <div className="text-center p-5">

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

              <p className="text-sm text-texto-secundario mt-2">
                Procure médicos e especialidades.
              </p>

            </div>


            <div className="text-center p-5">

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

              <p className="text-sm text-texto-secundario mt-2">
                Consulte o perfil do médico.
              </p>

            </div>


            <div className="text-center p-5">

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

              <p className="text-sm text-texto-secundario mt-2">
                Escolha uma data e horário disponíveis.
              </p>

            </div>


            <div className="text-center p-5">

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

              <p className="text-sm text-texto-secundario mt-2">
                Consulte e acompanhe as suas consultas.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* 
          CTA
      */}

      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-16">

        <div className="
          bg-primaria
          text-white
          rounded-2xl
          px-6
          py-10
          sm:px-10
          text-center
        ">

          <h2 className="text-2xl sm:text-3xl font-bold">
            Cuide da sua saúde com mais facilidade.
          </h2>

          <p className="text-blue-100 mt-3 max-w-2xl mx-auto">
            Crie a sua conta para encontrar médicos e gerir
            as suas consultas através da nossa plataforma.
          </p>


          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">

            <Link
              to="/registro"
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
              Criar uma conta
            </Link>


            <Link
              to="/medicos"
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
              Encontrar médicos
            </Link>

          </div>

        </div>

      </section>

    </main>

  )
}

export default SobreNos