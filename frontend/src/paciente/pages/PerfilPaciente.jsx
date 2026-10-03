import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  obterUsuarioAutenticado,
  actualizarUsuario
} from "../../data/usuarios"

import { prepararImagem } from "../../utils/imagem"


function PerfilPaciente() {

  const navegar = useNavigate()

  const [paciente, setPaciente] = useState(null)

  const [modoEdicao, setModoEdicao] = useState(false)

  const [formulario, setFormulario] = useState({
    nome: "",
    telefone: ""
  })

  const [fotoPrevisualizacao, setFotoPrevisualizacao] =
    useState(null)

  const [processandoFoto, setProcessandoFoto] =
    useState(false)

  const [guardando, setGuardando] =
    useState(false)

  const [mensagem, setMensagem] =
    useState("")

  const [erro, setErro] =
    useState("")


  /* 
     CARREGAR PACIENTE
   */

  useEffect(() => {

    const usuario = obterUsuarioAutenticado()

    if (!usuario) {
      navegar("/login")
      return
    }

    if (usuario.tipo !== "paciente") {
      navegar("/")
      return
    }

    setPaciente(usuario)

    setFormulario({
      nome: usuario.nome || "",
      telefone: usuario.telefone || ""
    })

    setFotoPrevisualizacao(
      usuario.foto || null
    )

  }, [navegar])


  /* 
     ALTERAR CAMPOS
   */

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
        "Seleccione um ficheiro de imagem válido."
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
        "Não foi possível processar a fotografia."
      )

    } finally {

      setProcessandoFoto(false)

    }

  }


  /* 
     CANCELAR EDIÇÃO
   */

  function cancelarEdicao() {

    if (!paciente) {
      return
    }


    setFormulario({
      nome: paciente.nome || "",
      telefone: paciente.telefone || ""
    })

    setFotoPrevisualizacao(
      paciente.foto || null
    )

    setErro("")
    setMensagem("")

    setModoEdicao(false)

  }


  /* 
     GUARDAR ALTERAÇÕES
   */

  function guardarAlteracoes(evento) {

    evento.preventDefault()

    if (!paciente) {
      return
    }


    setErro("")
    setMensagem("")


    const nome =
      formulario.nome.trim()

    const telefone =
      formulario.telefone.trim()


    /* Validação do nome */

    if (!nome) {

      setErro(
        "O nome completo é obrigatório."
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
          paciente.id,
          {
            nome,
            telefone,
            foto: fotoPrevisualizacao || null
          }
        )


      if (!usuarioAtualizado) {

        setErro(
          "Não foi possível actualizar os dados."
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

  if (!paciente) {
    return null
  }


  const inicial =
    paciente.nome?.charAt(0)?.toUpperCase() || "P"


  return (
    <div className="max-w-xl mx-auto">

      {/* 
          CABEÇALHO
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
            CABEÇALHO DO PERFIL
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
                      alt="Pré-visualização da fotografia"
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

                paciente.foto ? (

                  <img
                    src={paciente.foto}
                    alt={`Fotografia de ${paciente.nome}`}
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


            {/* IDENTIFICAÇÃO */}

            <div className="text-center sm:text-left">

              <h2 className="text-2xl font-bold text-texto">
                {paciente.nome}
              </h2>

              <p className="text-texto-secundario mt-1">
                Paciente
              </p>

              <p className="text-sm text-texto-secundario mt-3">
                Membro desde{" "}
                {paciente.criadoEm
                  ? new Date(
                      paciente.criadoEm
                    ).toLocaleDateString("pt-PT")
                  : "—"
                }
              </p>

            </div>

          </div>

        </div>


        {/* 
            CONTEÚDO
        = */}

        <div className="p-6 sm:p-8">


          {!modoEdicao ? (

            <>
              <h3 className="text-xl font-bold text-texto">
                Dados pessoais
              </h3>

              <p className="text-sm text-texto-secundario mt-1">
                Informações associadas à sua conta.
              </p>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">


                {/* Nome */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Nome completo
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    {paciente.nome || "—"}
                  </p>

                </div>


                {/* Email */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Email
                  </p>

                  <p className="font-semibold text-texto mt-1 break-all">
                    {paciente.email || "—"}
                  </p>

                </div>


                {/* Telefone */}

                <div>

                  <p className="text-sm text-texto-secundario">
                    Telefone
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    {paciente.telefone || "—"}
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


              {/* ACÇÕES */}

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
               FORMULÁRIO DE EDIÇÃO
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
                    value={paciente.email || ""}
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
                    O email não pode ser alterado nesta área.
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


              {/* BOTÕES */}

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
                    : "Guardar alterações"
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