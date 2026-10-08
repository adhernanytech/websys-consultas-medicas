import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  obterUsuarioAutenticado,
  actualizarUsuario
} from "../../data/usuarios"
import { useStorageSync } from "../../hooks/useStorageSync"

import { prepararImagem } from "../../utils/imagem"


function PerfilPaciente() {

  const navegar = useNavigate()
  
  // Forçar re-render quando utilizadores mudam
  useStorageSync("usuarios")
  
  // Todos os hooks no topo, antes de qualquer lógica condicional
  const [modoEdicao, setModoEdicao] = useState(false)
  const [processandoFoto, setProcessandoFoto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  
  const usuario = obterUsuarioAutenticado()
  
  const [formulario, setFormulario] = useState({
    nome: usuario?.nome || "",
    telefone: usuario?.telefone || ""
  })
  
  const [fotoPrevisualizacao, setFotoPrevisualizacao] = useState(
    usuario?.foto || null
  )

  // Verificações de autenticação
  if (!usuario) {
    navegar("/login")
    return null
  }

  if (usuario.tipo !== "paciente" && usuario.role !== "paciente") {
    navegar("/")
    return null
  }

  if (usuario.ativo === false) {
    navegar("/login")
    return null
  }

  function alterarCampo(evento) {

    const { name, value } =
      evento.target

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value
    }))

  }


  /* 
     ALTERAR FOTOGRAFIA
   */

  async function alterarFoto(evento) {

    const ficheiro =
      evento.target.files?.[0]

    if (!ficheiro) {
      return
    }


    if (!ficheiro.type.startsWith("image/")) {

      setErro(
        "Seleccione um ficheiro de imagem vÃ¡lido."
      )

      return
    }


    setErro("")
    setMensagem("")
    setProcessandoFoto(true)


    try {

      const imagem =
        await prepararImagem(ficheiro)

      setFotoPrevisualizacao(imagem)

    } catch (erro) {

      console.error(erro)

      setErro(
        "NÃ£o foi possÃ­vel processar a fotografia."
      )

    } finally {

      setProcessandoFoto(false)

    }

  }


  /* 
     CANCELAR EDIÃ‡ÃƒO
   */

  function cancelarEdicao() {

    if (!usuario) {
      return
    }


    setFormulario({
      nome: usuario.nome || "",
      telefone: usuario.telefone || ""
    })

    setFotoPrevisualizacao(
      usuario.foto || null
    )

    setErro("")
    setMensagem("")

    setModoEdicao(false)

  }


  /* 
     GUARDAR ALTERAÃ‡Ã•ES
   */

  function guardarAlteracoes(evento) {

    evento.preventDefault()

    if (!usuario) {
      return
    }


    setErro("")
    setMensagem("")


    const nome =
      formulario.nome.trim()

    const telefone =
      formulario.telefone.trim()


    /* ValidaÃ§Ã£o do nome */

    if (!nome) {

      setErro(
        "O nome completo Ã© obrigatÃ³rio."
      )

      return
    }


    if (nome.length < 3) {

      setErro(
        "O nome deve ter pelo menos 3 caracteres."
      )

      return
    }


    setGuardando(true)


    try {

      const usuarioAtualizado =
        actualizarUsuario(
          usuario.id,
          {
            nome,
            telefone,
            foto: fotoPrevisualizacao || null
          }
        )


      if (!usuarioAtualizado) {

        setErro(
          "NÃ£o foi possÃ­vel actualizar os dados."
        )

        return
      }


      setPaciente(usuarioAtualizado)

      setFormulario({
        nome: usuarioAtualizado.nome || "",
        telefone:
          usuarioAtualizado.telefone || ""
      })

      setFotoPrevisualizacao(
        usuarioAtualizado.foto || null
      )


      setModoEdicao(false)

      setMensagem(
        "Os seus dados foram actualizados com sucesso."
      )

    } catch (erro) {

      console.error(erro)

      setErro(
        "Ocorreu um erro ao actualizar o perfil."
      )

    } finally {

      setGuardando(false)

    }

  }


  /* 
     ESTADO INICIAL
  */

  if (!usuario) {
    return null
  }


  const inicial =
    usuario.nome?.charAt(0)?.toUpperCase() || "P"


  return (
    <div className="max-w-xl mx-auto">

      {/* 
          CABEÃ‡ALHO
       */}

      <div className="m-8">

        <h1 className="text-3xl font-bold text-texto">
          Meu perfil
        </h1>

        <p className="text-texto-secundario mt-2">
          Consulte e gere os seus dados pessoais.
        </p>

      </div>


      {/* 
          MENSAGEM DE SUCESSO
       */}

      {mensagem && (

        <div
          className="
            mb-6
            bg-green-50
            border border-green-200
            text-sucesso
            rounded-xl
            px-4 py-3
          "
        >
          {mensagem}
        </div>

      )}


      {/* 
          MENSAGEM DE ERRO
       */}

      {erro && (

        <div
          className="
            mb-6
            bg-red-50
            border border-red-200
            text-erro
            rounded-xl
            px-4 py-3
          "
        >
          {erro}
        </div>

      )}


      {/* 
          PERFIL
       */}

      <div className="bg-fundo border border-borda rounded-2xl shadow-sm overflow-hidden">

        {/* 
            CABEÃ‡ALHO DO PERFIL
        */}

        <div className="p-6 sm:p-8 border-b border-borda">

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">


            {/* FOTOGRAFIA */}

            <div className="shrink-0">

              {modoEdicao ? (

                <div className="flex flex-col items-center gap-3">

                  {fotoPrevisualizacao ? (

                    <img
                      src={fotoPrevisualizacao}
                      alt="PrÃ©-visualizaÃ§Ã£o da fotografia"
                      className="
                        w-32 h-32
                        rounded-full
                        object-cover
                        border-4
                        border-white
                        shadow-md
                      "
                    />

                  ) : (

                    <div
                      className="
                        w-32 h-32
                        rounded-full
                        bg-primaria
                        text-white
                        flex items-center justify-center
                        text-4xl
                        font-bold
                        shadow-md
                      "
                    >
                      {inicial}
                    </div>

                  )}


                  <label
                    className="
                      cursor-pointer
                      text-sm
                      font-medium
                      text-primaria
                      hover:underline
                    "
                  >

                    Alterar fotografia

                    <input
                      type="file"
                      accept="image/*"
                      onChange={alterarFoto}
                      className="hidden"
                    />

                  </label>


                  {processandoFoto && (

                    <p className="text-xs text-texto-secundario">
                      A processar fotografia...
                    </p>

                  )}

                </div>

              ) : (

                usuario.foto ? (

                  <img
                    src={usuario.foto}
                    alt={`Fotografia de ${usuario.nome}`}
                    className="
                      w-32 h-32
                      rounded-full
                      object-cover
                      border-4
                      border-white
                      shadow-md
                    "
                  />

                ) : (

                  <div
                    className="
                      w-32 h-32
                      rounded-full
                      bg-primaria
                      text-white
                      flex items-center justify-center
                      text-4xl
                      font-bold
                      shadow-md
                    "
                  >
                    {inicial}
                  </div>

                )

              )}

            </div>


            {/* IDENTIFICAÃ‡ÃƒO */}

            <div className="text-center sm:text-left">

              <h2 className="text-2xl font-bold text-texto">
                {usuario.nome}
              </h2>

              <p className="text-texto-secundario mt-1">
                Paciente
              </p>

              <p className="text-sm text-texto-secundario mt-3">
                Membro desde{" "}
                {usuario.criadoEm
                  ? new Date(
                      usuario.criadoEm
                    ).toLocaleDateString("pt-PT")
                  : "â€”"
                }
              </p>

            </div>

          </div>

        </div>


        {/* 
            CONTEÃšDO
        = */}

        <div className="p-6 sm:p-8">


          {!modoEdicao ? (

            <>
              <h3 className="text-xl font-bold text-texto">
                Dados pessoais
              </h3>

              <p className="text-sm text-texto-secundario mt-1">
                Informações associadas a sua conta.
              </p>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">


                {/* Nome */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Nome completo
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    {usuario.nome || "â€”"}
                  </p>

                </div>


                {/* Email */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Email
                  </p>

                  <p className="font-semibold text-texto mt-1 break-all">
                    {usuario.email || "â€”"}
                  </p>

                </div>


                {/* Telefone */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Telefone
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    {usuario.telefone || "â€”"}
                  </p>

                </div>


                {/* Tipo */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Tipo de conta
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    Paciente
                  </p>

                </div>

              </div>


              {/* ACÃ‡Ã•ES */}

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-borda">

                <button
                  type="button"
                  onClick={() => {
                    setMensagem("")
                    setErro("")
                    setModoEdicao(true)
                  }}
                  className="
                    flex-1
                    bg-primaria
                    text-white
                    px-5 py-3
                    rounded-lg
                    font-medium
                    hover:bg-primaria-hover
                    transition
                    cursor-pointer
                  "
                >
                  Editar perfil
                </button>


                <Link
                  to="/paciente/dashboard"
                  className="
                    flex-1
                    border border-borda
                    text-texto
                    px-5 py-3
                    rounded-lg
                    font-medium
                    hover:bg-gray-50
                    transition
                    text-center
                  "
                >
                  Voltar ao dashboard
                </Link>

              </div>

            </>

          ) : (


            /* =================================
               FORMULÃRIO DE EDIÃ‡ÃƒO
            ================================== */

            <form
              onSubmit={guardarAlteracoes}
            >

              <h3 className="text-xl font-bold text-texto">
                Editar perfil
              </h3>

              <p className="text-sm text-texto-secundario mt-1">
                Actualize os seus dados pessoais.
              </p>


              <div className="space-y-5 mt-6">


                {/* Nome */}

                <div>

                  <label
                    htmlFor="nome"
                    className="
                      block
                      text-sm
                      font-medium
                      text-texto
                      mb-2
                    "
                  >
                    Nome completo
                  </label>

                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formulario.nome}
                    onChange={alterarCampo}
                    autoComplete="name"
                    className="
                      w-full
                      border border-borda
                      rounded-lg
                      px-4 py-3
                      text-texto
                      bg-white
                      outline-none
                      focus:ring-2
                      focus:ring-primaria/20
                      focus:border-primaria
                    "
                  />

                </div>


                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                      block
                      text-sm
                      font-medium
                      text-texto
                      mb-2
                    "
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={usuario.email || ""}
                    disabled
                    className="
                      w-full
                      border border-borda
                      rounded-lg
                      px-4 py-3
                      text-texto-secundario
                      bg-gray-100
                      cursor-not-allowed
                    "
                  />

                  <p className="text-xs text-texto-secundario mt-2">
                    O email nÃ£o pode ser alterado nesta Ã¡rea.
                  </p>

                </div>


                {/* Telefone */}

                <div>

                  <label
                    htmlFor="telefone"
                    className="
                      block
                      text-sm
                      font-medium
                      text-texto
                      mb-2
                    "
                  >
                    Telefone
                  </label>

                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formulario.telefone}
                    onChange={alterarCampo}
                    autoComplete="tel"
                    placeholder="Ex.: 923 000 000"
                    className="
                      w-full
                      border border-borda
                      rounded-lg
                      px-4 py-3
                      text-texto
                      bg-white
                      outline-none
                      focus:ring-2
                      focus:ring-primaria/20
                      focus:border-primaria
                    "
                  />

                </div>


              </div>


              {/* BOTÃ•ES */}

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-borda">

                <button
                  type="submit"
                  disabled={
                    guardando ||
                    processandoFoto
                  }
                  className="
                    flex-1
                    bg-primaria
                    text-white
                    px-5 py-3
                    rounded-lg
                    font-medium
                    hover:bg-primaria-hover
                    transition
                    cursor-pointer
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {guardando
                    ? "A guardar..."
                    : "Guardar alteraÃ§Ãµes"
                  }
                </button>


                <button
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={guardando}
                  className="
                    flex-1
                    border border-borda
                    text-texto
                    px-5 py-3
                    rounded-lg
                    font-medium
                    hover:bg-gray-50
                    transition
                    cursor-pointer
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Cancelar
                </button>

              </div>

            </form>

          )}

        </div>

      </div>

    </div>
  )
}

export default PerfilPaciente


