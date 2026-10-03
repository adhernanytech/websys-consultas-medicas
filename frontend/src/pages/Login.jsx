import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  obterUsuarios,
  guardarUsuarioAutenticado
} from "../data/usuarios"


function Login() {

  const navegar = useNavigate()
  const location = useLocation()


  const [formulario, setFormulario] = useState({
    email: "",
    senha: ""
  })


  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const [carregando, setCarregando] = useState(false)
  const [carregandoGoogle, setCarregandoGoogle] = useState(false)


  /*
     ALTERAR CAMPOS
  */

  function alterarCampo(evento) {

    const { name, value } = evento.target

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value
    }))

    setMensagem("")
    setTipoMensagem("")
  }


  /*
     FAZER LOGIN
  */

  function fazerLogin(evento) {

    evento.preventDefault()

    setMensagem("")
    setTipoMensagem("")


    /*
       VALIDAR EMAIL
    */

    const email =
      formulario.email.trim().toLowerCase()


    if (email === "") {

      setMensagem("Digite o seu email.")
      setTipoMensagem("erro")

      return
    }


    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/


    if (!emailValido.test(email)) {

      setMensagem("Digite um email válido.")
      setTipoMensagem("erro")

      return
    }


    /*
       VALIDAR PALAVRA-PASSE
    */

    if (formulario.senha.trim() === "") {

      setMensagem(
        "Digite a sua palavra-passe."
      )

      setTipoMensagem("erro")

      return
    }


    if (formulario.senha.length < 6) {

      setMensagem(
        "A palavra-passe deve ter pelo menos 6 caracteres."
      )

      setTipoMensagem("erro")

      return
    }


    setCarregando(true)

    setMensagem("A verificar os seus dados...")
    setTipoMensagem("sucesso")


    /*
       OBTER UTILIZADORES REGISTADOS
    */

    const usuarios =
      obterUsuarios()


    /*
       PROCURAR UTILIZADOR PELO EMAIL
    */

    const usuario =
      usuarios.find(
        (item) =>
          item.email?.toLowerCase() === email
      )


    /*
       VERIFICAR EMAIL E PALAVRA-PASSE
    */

    if (
      !usuario ||
      usuario.senha !== formulario.senha
    ) {

      setCarregando(false)

      setMensagem(
        "Email ou palavra-passe incorrectos."
      )

      setTipoMensagem("erro")

      return
    }


    /*
       VERIFICAR SE A CONTA ESTÁ ACTIVA
    */

    if (usuario.ativo === false) {

      setCarregando(false)

      setMensagem(
        "A sua conta encontra-se desactivada. Contacte o administrador."
      )

      setTipoMensagem("erro")

      return
    }


    /*
       GUARDAR UTILIZADOR AUTENTICADO
    */

    guardarUsuarioAutenticado(usuario)


    setMensagem(
      "Login realizado com sucesso!"
    )

    setTipoMensagem("sucesso")


    /*
       REDIRECCIONAR
    */

    setTimeout(() => {

      setCarregando(false)


      /*
         Se no futuro uma rota protegida
         mandar o utilizador para o login,
         podemos devolvê-lo para essa rota.
      */

      const destino =
        location.state?.from?.pathname


      if (destino) {

        navegar(
          destino,
          { replace: true }
        )

        return
      }


      /*
         PACIENTE
      */

      if (usuario.tipo === "paciente") {

        navegar(
          "/paciente/dashboard",
          { replace: true }
        )

        return
      }


      /*
         MÉDICO / ADMINISTRADOR
         
         Estas áreas serão implementadas
         posteriormente.
      */

      navegar("/", { replace: true })

    }, 900)
  }


  /*
     LOGIN COM GOOGLE
  */

  function loginComGoogle() {

    setCarregandoGoogle(true)

    setMensagem("")
    setTipoMensagem("")


    setTimeout(() => {

      setCarregandoGoogle(false)

      setMensagem(
        "O início de sessão com Google será implementado posteriormente."
      )

      setTipoMensagem("sucesso")

    }, 1000)
  }


  return (

    <main className="
      min-h-screen
      bg-gray-100
      flex
      items-center
      justify-center
      px-4
      sm:px-6
      py-8
      sm:py-10
    ">

      <div className="
        w-full
        max-w-5xl
        grid
        grid-cols-1
        lg:grid-cols-2
        bg-white
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">


        {/* Área de apresentação */}

        <section className="
          hidden
          lg:flex
          bg-primaria
          text-white
          p-9
          xl:p-10
          flex-col
          justify-between
        ">

          <div>

            <div className="flex items-center gap-3">

              <div className="
                w-11
                h-11
                bg-white
                rounded-xl
                flex
                items-center
                justify-center
              ">

                <span className="text-texto font-bold text-lg">
                  M
                </span>

              </div>


              <div>

                <p className="font-bold text-base">
                  Sistema Médico
                </p>

                <p className="text-blue-100 text-xs">
                  Marcação de consultas online
                </p>

              </div>

            </div>


            <div className="mt-12 max-w-md">

              <p className="
                text-xs
                uppercase
                tracking-widest
                text-blue-100
                font-semibold
              ">
                Cuide da sua saúde
              </p>


              <h1 className="
                text-3xl
                font-bold
                mt-3
                leading-tight
              ">
                Marque a sua consulta de forma simples e segura.
              </h1>


              <p className="
                mt-5
                text-blue-100
                text-base
                leading-relaxed
              ">
                Encontre médicos, marque consultas e acompanhe
                os seus atendimentos através de uma única plataforma.
              </p>


              <div className="mt-8 space-y-4">


                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    bg-white/20
                    rounded-full
                    flex
                    items-center
                    justify-center
                  " />

                  <p className="text-blue-50 text-sm">
                    Consulte médicos disponíveis
                  </p>

                </div>


                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    bg-white/20
                    rounded-full
                    flex
                    items-center
                    justify-center
                  " />

                  <p className="text-blue-50 text-sm">
                    Marque e acompanhe as suas consultas
                  </p>

                </div>


                <div className="flex items-center gap-3">

                  <div className="
                    w-9
                    h-9
                    bg-white/20
                    rounded-full
                    flex
                    items-center
                    justify-center
                  " />

                  <p className="text-blue-50 text-sm">
                    Tenha tudo organizado num só lugar
                  </p>

                </div>

              </div>

            </div>

          </div>


          <div className="mt-8">

            <p className="text-blue-100 text-xs">
              A sua saúde merece cuidado e organização.
            </p>

          </div>

        </section>


        {/* Área de Login */}

        <section className="
          p-6
          sm:p-8
          lg:p-9
          xl:p-10
        ">

          <div className="text-center">

            <div className="
              mx-auto
              w-12
              h-12
              bg-primaria/10
              rounded-xl
              flex
              items-center
              justify-center
            ">

              <span className="text-texto font-bold text-lg">
                M
              </span>

            </div>


            <h1 className="
              text-2xl
              sm:text-3xl
              font-bold
              text-texto
              mt-4
            ">
              Bem-vindo de volta
            </h1>


            <p className="
              text-texto-secundario
              text-sm
              mt-2
            ">
              Entre na sua conta para gerir as suas consultas.
            </p>

          </div>


          <form
            onSubmit={fazerLogin}
            className="mt-7"
          >


            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="
                  block
                  text-texto
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Email
              </label>


              <input
                id="email"
                type="email"
                name="email"
                value={formulario.email}
                onChange={alterarCampo}
                placeholder="exemplo@email.com"
                autoComplete="email"
                className="
                  w-full
                  border
                  border-borda
                  rounded-lg
                  px-4
                  py-2.5
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-primaria
                "
              />

            </div>


            {/* Palavra-passe */}

            <div className="mt-4">

              <label
                htmlFor="senha"
                className="
                  block
                  text-texto
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Palavra-passe
              </label>


              <div className="relative">

                <input
                  id="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  name="senha"
                  value={formulario.senha}
                  onChange={alterarCampo}
                  placeholder="Digite a sua palavra-passe"
                  autoComplete="current-password"
                  className="
                    w-full
                    border
                    border-borda
                    rounded-lg
                    px-4
                    py-2.5
                    pr-20
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-primaria
                  "
                />


                <button
                  type="button"
                  onClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-texto
                    hover:underline
                    cursor-pointer
                  "
                >
                  {mostrarSenha
                    ? "Ocultar"
                    : "Mostrar"
                  }
                </button>

              </div>


              <div className="text-right mt-2">

                <button
                  type="button"
                  className="
                    text-xs
                    text-texto
                    hover:underline
                    cursor-pointer
                  "
                >
                  Esqueceu a palavra-passe?
                </button>

              </div>

            </div>


            {/* Mensagem */}

            {mensagem && (

              <div
                className={`
                  mt-4
                  px-4
                  py-2.5
                  rounded-lg
                  text-sm

                  ${
                    tipoMensagem === "erro"
                      ? "bg-red-50 border border-red-200 text-erro"
                      : "bg-green-50 border border-green-200 text-sucesso"
                  }
                `}
              >
                {mensagem}
              </div>

            )}


            {/* Entrar */}

            <button
              type="submit"
              disabled={carregando}
              className="
                w-full
                mt-5
                bg-primaria
                text-white
                py-2.5
                rounded-lg
                font-medium
                text-sm
                hover:bg-primaria-hover
                border-0
                cursor-pointer
                disabled:bg-primaria-fraca
                disabled:cursor-not-allowed
              "
            >
              {carregando
                ? "A verificar..."
                : "Entrar"
              }
            </button>


            {/* Separador */}

            <div className="
              flex
              items-center
              gap-4
              my-5
            ">

              <div className="flex-1 h-px bg-gray-300" />

              <span className="text-xs text-gray-500">
                ou
              </span>

              <div className="flex-1 h-px bg-gray-300" />

            </div>


            {/* Google */}

            <button
              type="button"
              onClick={loginComGoogle}
              disabled={carregandoGoogle}
              className="
                w-full
                border
                border-gray-300
                bg-white
                text-texto-secundario
                py-2.5
                rounded-lg
                font-medium
                text-sm
                hover:bg-gray-50
                flex
                items-center
                justify-center
                gap-3
                cursor-pointer
                disabled:bg-gray-100
                disabled:cursor-not-allowed
              "
            >

              <span className="font-bold">
                G
              </span>

              {carregandoGoogle
                ? "A ligar ao Google"
                : "Continuar com Google"
              }

            </button>

          </form>


          {/* Criar conta */}

          <p className="
            text-center
            text-texto-secundario
            text-sm
            mt-5
          ">
            Ainda não tem uma conta?
          </p>


          <button
            type="button"
            onClick={() => navegar("/registro")}
            className="
              w-full
              mt-2.5
              border
              border-borda
              text-texto-secundario
              py-2.5
              rounded-lg
              text-sm
              hover:bg-gray-50
              cursor-pointer
            "
          >
            Criar uma conta
          </button>

        </section>

      </div>

    </main>
  )
}

export default Login