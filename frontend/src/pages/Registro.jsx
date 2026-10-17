import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

import {
  obterUsuarios,
  criarUsuario,
  guardarUsuarioAutenticado,
} from "../data/usuarios";

import { prepararImagem } from "../utils/imagem"

function Registro() {

  const navegar = useNavigate()

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: ""
  })

  const [foto, setFoto] = useState(null)
  const [previsualizacaoFoto, setPrevisualizacaoFoto] = useState("")

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)

  const [aceitouTermos, setAceitouTermos] = useState(false)

  const [mensagem, setMensagem] = useState("")
  const [tipoMensagem, setTipoMensagem] = useState("")

  const [carregando, setCarregando] = useState(false)
  const [carregandoGoogle, setCarregandoGoogle] = useState(false)

  function alterarCampo(evento) {

    const { name, value } = evento.target

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value
    }))
  }

  async function alterarFoto(evento) {

    const ficheiro = evento.target.files?.[0]

    if (!ficheiro) {
      return
    }

    if (!ficheiro.type.startsWith("image/")) {
      setMensagem("Seleccione um ficheiro de imagem válido.")
      setTipoMensagem("erro")
      return
    }

    const tamanhoMaximo = 5 * 1024 * 1024

    if (ficheiro.size > tamanhoMaximo) {
      setMensagem(
        "A fotografia deve ter no máximo 5 MB."
      )
      setTipoMensagem("erro")
      return
    }

    try {

      const imagemPreparada =
        await prepararImagem(ficheiro)

      setFoto(ficheiro)
      setPrevisualizacaoFoto(imagemPreparada)

      setMensagem("")
      setTipoMensagem("")

    } catch (erro) {

      console.error(erro)

      setMensagem(
        "Não foi possível processar a fotografia."
      )

      setTipoMensagem("erro")
    }
  }

  function removerFoto() {

    setFoto(null)
    setPrevisualizacaoFoto("")

    const campoFoto =
      document.getElementById("foto")

    if (campoFoto) {
      campoFoto.value = ""
    }
  }

  async function criarConta(evento) {

    evento.preventDefault()

    setMensagem("")
    setTipoMensagem("")

    if (formulario.nome.trim() === "") {
      setMensagem("Digite o seu nome completo.")
      setTipoMensagem("erro")
      return
    }

    if (formulario.nome.trim().length < 3) {
      setMensagem(
        "O nome deve ter pelo menos 3 caracteres."
      )
      setTipoMensagem("erro")
      return
    }

    if (formulario.email.trim() === "") {
      setMensagem("Digite o seu email.")
      setTipoMensagem("erro")
      return
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(formulario.email.trim())) {
      setMensagem("Digite um email válido.")
      setTipoMensagem("erro")
      return
    }

    if (formulario.telefone.trim() === "") {
      setMensagem(
        "Digite o seu número de telefone."
      )
      setTipoMensagem("erro")
      return
    }

    if (formulario.telefone.trim().length < 9) {
      setMensagem(
        "Digite um número de telefone válido."
      )
      setTipoMensagem("erro")
      return
    }

    if (formulario.senha === "") {
      setMensagem("Crie uma palavra-passe.")
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

    if (formulario.confirmarSenha === "") {
      setMensagem(
        "Confirme a sua palavra-passe."
      )
      setTipoMensagem("erro")
      return
    }

    if (
      formulario.senha !==
      formulario.confirmarSenha
    ) {
      setMensagem(
        "As palavras-passe não coincidem."
      )
      setTipoMensagem("erro")
      return
    }

    if (!aceitouTermos) {
      setMensagem(
        "É necessário aceitar os Termos e Condições."
      )
      setTipoMensagem("erro")
      return
    }

    const emailNormalizado =
      formulario.email.trim().toLowerCase()

    const usuariosExistentes = obterUsuarios()

    const emailJaExiste =
      usuariosExistentes.some(
        (usuario) =>
          usuario.email.toLowerCase() ===
          emailNormalizado
      )

    if (emailJaExiste) {
      setMensagem(
        "Já existe uma conta associada a este email."
      )
      setTipoMensagem("erro")
      return
    }

    setCarregando(true)

    setMensagem(
      "A criar a sua conta..."
    )

    setTipoMensagem("sucesso")

    try {
      const novoUsuario = criarUsuario({
        nome: formulario.nome.trim(),
        email: formulario.email.trim().toLowerCase(),
        telefone: formulario.telefone.trim(),
        senha: formulario.senha,
        tipo: "paciente",
        role: "paciente",
        foto: previsualizacaoFoto || null,
        ativo: true,
        aceitouTermos: true,
        criadoEm: new Date().toISOString(),
      });

      guardarUsuarioAutenticado(novoUsuario);

      setMensagem("Conta criada com sucesso!");
      setTipoMensagem("sucesso");

      setTimeout(() => {
        navegar("/paciente/dashboard", { replace: true });
      }, 800);
    } catch (erro) {

      console.error(erro)

      setMensagem(
        "Ocorreu um erro ao criar a conta."
      )

      setTipoMensagem("erro")

      setCarregando(false)
    }
  }

  function registroComGoogle() {

    setCarregandoGoogle(true)

    setMensagem("")
    setTipoMensagem("")

    setTimeout(() => {

      setCarregandoGoogle(false)

      setMensagem(
        "O registo com Google será implementado posteriormente."
      )

      setTipoMensagem("sucesso")

    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 sm:p-10">

        {/* Cabeçalho */}

        <div className="text-center">

          <div className="mx-auto w-14 h-14 bg-primaria/10 rounded-2xl flex items-center justify-center">

            <span className="text-primaria font-bold text-xl">
              M
            </span>

          </div>

          <h1 className="text-3xl font-bold text-texto mt-5">
            Criar uma conta
          </h1>

          <p className="text-texto-secundario mt-2">
            Crie a sua conta para começar a utilizar o sistema.
          </p>

        </div>

        {/* Mensagem */}

        {mensagem && (
          <div
            className={`
              mt-6
              p-4
              rounded-lg
              text-sm
              ${tipoMensagem === "erro"
                ? "bg-red-50 text-erro"
                : "bg-green-50 text-sucesso"
              }
            `}
          >
            {mensagem}
          </div>
        )}

        {/* Formulário */}

        <form
          onSubmit={criarConta}
          className="mt-8"
        >

          {/* Fotografia */}

          <div>

            <label className="block text-texto font-medium mb-2">
              Fotografia
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">

              <div className="w-28 h-28 rounded-full border-2 border-borda overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">

                {previsualizacaoFoto ? (

                  <img
                    src={previsualizacaoFoto}
                    alt="Pré-visualização da fotografia"
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <span className="text-texto-secundario text-sm text-center px-3">
                    Sem fotografia
                  </span>

                )}

              </div>

              <div className="flex-1 w-full">

                <input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={alterarFoto}
                  className="
                    w-full
                    border
                    border-borda
                    rounded-lg
                    px-4
                    py-3
                    text-sm
                    bg-white
                    cursor-pointer
                  "
                />

                <p className="text-xs text-texto-secundario mt-2">
                  Opcional. Prefira uma fotografia tipo-passe.
                  Tamanho máximo: 5 MB.
                </p>

                {previsualizacaoFoto && (

                  <button
                    type="button"
                    onClick={removerFoto}
                    className="
                      mt-2
                      text-sm
                      text-erro
                      hover:underline
                      cursor-pointer
                    "
                  >
                    Remover fotografia
                  </button>

                )}

              </div>

            </div>

          </div>

          {/* Nome */}

          <div className="mt-5">

            <label className="block text-texto font-medium mb-2">
              Nome completo
            </label>

            <input
              type="text"
              name="nome"
              value={formulario.nome}
              onChange={alterarCampo}
              placeholder="Digite o seu nome completo"
              className="
                w-full
                border
                border-borda
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-primaria
              "
            />

          </div>

          {/* Email */}

          <div className="mt-5">

            <label className="block text-texto font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={alterarCampo}
              placeholder="exemplo@email.com"
              className="
                w-full
                border
                border-borda
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-primaria
              "
            />

          </div>

          {/* Telefone */}

          <div className="mt-5">

            <label className="block text-texto font-medium mb-2">
              Telefone
            </label>

            <input
              type="tel"
              name="telefone"
              value={formulario.telefone}
              onChange={alterarCampo}
              placeholder="Digite o seu número de telefone"
              className="
                w-full
                border
                border-borda
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-primaria
              "
            />

          </div>

          {/* Palavra-passe */}

          <div className="mt-5">

            <label className="block text-texto font-medium mb-2">
              Palavra-passe
            </label>

            <div className="relative">

              <input
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                name="senha"
                value={formulario.senha}
                onChange={alterarCampo}
                placeholder="Crie uma palavra-passe"
                className="
                  w-full
                  border
                  border-borda
                  rounded-lg
                  px-4
                  py-3
                  pr-20
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
                  : "Mostrar"}
              </button>

            </div>

          </div>

          {/* Confirmar palavra-passe */}

          <div className="mt-5">

            <label className="block text-texto font-medium mb-2">
              Confirmar palavra-passe
            </label>

            <div className="relative">

              <input
                type={
                  mostrarConfirmarSenha
                    ? "text"
                    : "password"
                }
                name="confirmarSenha"
                value={formulario.confirmarSenha}
                onChange={alterarCampo}
                placeholder="Digite novamente a palavra-passe"
                className="
                  w-full
                  border
                  border-borda
                  rounded-lg
                  px-4
                  py-3
                  pr-20
                  outline-none
                  focus:ring-2
                  focus:ring-primaria
                "
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmarSenha(
                    !mostrarConfirmarSenha
                  )
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
                {mostrarConfirmarSenha
                  ? "Ocultar"
                  : "Mostrar"}
              </button>

            </div>

          </div>

          {/* Termos */}

          <div className="mt-6 flex items-start gap-3">

            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(evento) =>
                setAceitouTermos(
                  evento.target.checked
                )
              }
              className="mt-1 w-4 h-4"
            />

            <p className="text-sm text-texto-secundario">

              Li e aceito os{" "}

              <button
                type="button"
                className="text-primaria hover:underline"
              >
                Termos e Condições
              </button>

              {" "}e a{" "}

              <button
                type="button"
                className="text-primaria hover:underline"
              >
                Política de Privacidade
              </button>

            </p>

          </div>

          {/* Criar conta */}

          <button
            type="submit"
            disabled={carregando}
            className="
              w-full
              mt-6
              bg-primaria
              text-white
              py-3
              rounded-lg
              font-medium
              hover:bg-primaria-hover
              disabled:bg-primaria-fraca
              disabled:cursor-not-allowed
              cursor-pointer
            "
          >

            {carregando
              ? "A criar conta..."
              : "Criar conta"}

          </button>

          {/* Separador Google */}

          <div className="flex items-center gap-4 my-6">

            <div className="flex-1 h-px bg-gray-300"></div>

            <span className="text-sm text-gray-500">
              ou
            </span>

            <div className="flex-1 h-px bg-gray-300"></div>

          </div>

          {/* Google */}

          <button
            type="button"
            onClick={registroComGoogle}
            disabled={carregandoGoogle}
            className="
              w-full
              border
              border-gray-300
              bg-white
              text-texto-secundario
              py-3
              rounded-lg
              font-medium
              hover:bg-gray-50
              disabled:bg-gray-100
              disabled:cursor-not-allowed
              flex
              items-center
              justify-center
              gap-3
              cursor-pointer
            "
          >

            <span className="font-bold">
              G
            </span>

            {carregandoGoogle
              ? "A ligar ao Google..."
              : "Continuar com Google"}

          </button>

          {/* Ir para Login */}

          <p className="text-center text-texto-secundario mt-6">
            Já possui uma conta?
          </p>

          <button
            type="button"
            onClick={() => navegar("/login")}
            className="
              w-full
              mt-3
              border
              border-borda
              text-texto-secundario
              py-3
              rounded-lg
              hover:bg-gray-50
              cursor-pointer
            "
          >
            Entrar na minha conta
          </button>

        </form>

      </div>

    </main>
  )
}

export default Registro