import { useEffect, useState } from "react"
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom"

import {
  obterConsultaPorId,
  cancelarConsulta,
  editarConsulta
} from "../../utils/consultas"


function DetalhesConsulta() {
  const { id } = useParams()

  const navegar = useNavigate()

  const [consulta, setConsulta] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const [editando, setEditando] = useState(false)

  const [formulario, setFormulario] = useState({
    data: "",
    horario: "",
    motivo: ""
  })

  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")


  function obterDataLocal() {
    const data = new Date()

    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, "0")
    const dia = String(data.getDate()).padStart(2, "0")

    return `${ano}-${mes}-${dia}`
  }


  const hoje = obterDataLocal()


  useEffect(() => {
    const consultaEncontrada =
      obterConsultaPorId(id)

    setConsulta(consultaEncontrada)

    if (consultaEncontrada) {
      setFormulario({
        data: consultaEncontrada.data || "",
        horario:
          consultaEncontrada.horario ||
          consultaEncontrada.hora ||
          "",
        motivo: consultaEncontrada.motivo || ""
      })
    }

    setCarregando(false)
  }, [id])


  function classeEstado(estado) {
    if (
      estado === "Confirmada" ||
      estado === "Agendada"
    ) {
      return "bg-green-50 border-green-200 text-sucesso"
    }

    if (estado === "Concluída") {
      return "bg-blue-50 border-blue-200 text-blue-700"
    }

    return "bg-red-50 border-red-200 text-erro"
  }


  function alterarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value
    }))
  }


  function iniciarEdicao() {
    setErro("")
    setMensagem("")

    setFormulario({
      data: consulta.data || "",
      horario:
        consulta.horario ||
        consulta.hora ||
        "",
      motivo: consulta.motivo || ""
    })

    setEditando(true)
  }


  function cancelarEdicao() {
    setErro("")
    setMensagem("")

    setFormulario({
      data: consulta.data || "",
      horario:
        consulta.horario ||
        consulta.hora ||
        "",
      motivo: consulta.motivo || ""
    })

    setEditando(false)
  }


  function guardarAlteracoes(evento) {
    evento.preventDefault()

    setErro("")
    setMensagem("")


    if (!formulario.data) {
      setErro("Seleccione uma data.")
      return
    }


    if (formulario.data < hoje) {
      setErro(
        "Não pode seleccionar uma data anterior à data actual."
      )
      return
    }


    if (!formulario.horario) {
      setErro("Seleccione um horário.")
      return
    }


    if (formulario.motivo.trim().length < 10) {
      setErro(
        "O motivo deve ter pelo menos 10 caracteres."
      )
      return
    }


    const consultaActualizada =
      editarConsulta(id, {
        data: formulario.data,
        horario: formulario.horario,
        motivo: formulario.motivo
      })


    if (!consultaActualizada) {
      setErro(
        "Não foi possível alterar esta consulta."
      )
      return
    }


    setConsulta(consultaActualizada)

    setFormulario({
      data: consultaActualizada.data,
      horario: consultaActualizada.horario,
      motivo: consultaActualizada.motivo
    })

    setEditando(false)

    setMensagem(
      "Consulta actualizada com sucesso."
    )
  }


  function cancelar() {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar esta consulta?"
    )

    if (!confirmar) {
      return
    }

    const consultaActualizada =
      cancelarConsulta(id)

    setConsulta(consultaActualizada)

    setEditando(false)
    setMensagem("Consulta cancelada com sucesso.")
    setErro("")
  }


  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8">

        <div className="max-w-4xl mx-auto">

          <p className="text-texto-secundario">
            A carregar os detalhes da consulta...
          </p>

        </div>

      </main>
    )
  }


  if (!consulta) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8">

        <div className="max-w-4xl mx-auto">

          <section className="bg-white border border-borda rounded-2xl shadow-sm p-8 text-center">

            <h1 className="text-2xl font-bold text-texto">
              Consulta não encontrada
            </h1>

            <p className="text-texto-secundario mt-2">
              A consulta que procura não existe ou já não está disponível.
            </p>

            <Link
              to="/paciente/minhas-consultas"
              className="inline-flex mt-6 bg-primaria text-white px-5 py-3 rounded-lg font-medium hover:bg-primaria-hover transition"
            >
              Voltar às minhas consultas
            </Link>

          </section>

        </div>

      </main>
    )
  }


  const podeGerir =
    consulta.estado === "Agendada" ||
    consulta.estado === "Confirmada"


  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8">

      <div className="max-w-4xl mx-auto">

        {/* CABEÇALHO */}

        <section className="mb-8">

          <Link
            to="/paciente/minhas-consultas"
            className="inline-flex items-center text-sm text-texto-secundario hover:text-texto transition"
          >
            ← Voltar às minhas consultas
          </Link>

          <p className="text-texto-secundario text-sm mt-6">
            Área do paciente
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">

            <div>

              <h1 className="text-3xl sm:text-4xl font-bold text-texto">
                Detalhes da consulta
              </h1>

              <p className="text-texto-secundario mt-2">
                Consulte e gira os dados da sua consulta médica.
              </p>

            </div>

            <span
              className={`
                self-start
                border px-3 py-1 rounded-full
                text-sm font-medium
                ${classeEstado(consulta.estado)}
              `}
            >
              {consulta.estado}
            </span>

          </div>

        </section>


        {/* MÉDICO */}

        <section className="bg-white border border-borda rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold text-texto">
            Médico
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>

              <p className="text-sm text-texto-secundario">
                Nome
              </p>

              <p className="font-semibold text-texto mt-1">
                {consulta.medicoNome || consulta.medico}
              </p>

            </div>


            <div>

              <p className="text-sm text-texto-secundario">
                Especialidade
              </p>

              <p className="font-semibold text-texto mt-1">
                {consulta.especialidade}
              </p>

            </div>


            {consulta.medicoId && (
              <div>

                <p className="text-sm text-texto-secundario">
                  Código do médico
                </p>

                <p className="font-semibold text-texto mt-1">
                  {consulta.medicoId}
                </p>

              </div>
            )}

          </div>

        </section>


        {/* DADOS / EDIÇÃO */}

        <section className="bg-white border border-borda rounded-2xl shadow-sm p-6 mt-6">

          {editando ? (

            <form onSubmit={guardarAlteracoes}>

              <h2 className="text-xl font-bold text-texto">
                Alterar consulta
              </h2>

              <p className="text-sm text-texto-secundario mt-1">
                Altere os dados necessários e guarde as alterações.
              </p>


              {/* DATA */}

              <div className="mt-6">

                <label
                  htmlFor="data"
                  className="block text-sm font-medium text-gray-700"
                >
                  Data da consulta
                </label>

                <input
                  id="data"
                  type="date"
                  name="data"
                  value={formulario.data}
                  onChange={alterarCampo}
                  min={hoje}
                  required
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3"
                />

              </div>


              {/* HORÁRIO */}

              <div className="mt-6">

                <label
                  htmlFor="horario"
                  className="block text-sm font-medium text-gray-700"
                >
                  Horário da consulta
                </label>

                <input
                  id="horario"
                  type="time"
                  name="horario"
                  value={formulario.horario}
                  onChange={alterarCampo}
                  required
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3"
                />

              </div>


              {/* MOTIVO */}

              <div className="mt-6">

                <label
                  htmlFor="motivo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Motivo da consulta
                </label>

                <textarea
                  id="motivo"
                  name="motivo"
                  value={formulario.motivo}
                  onChange={alterarCampo}
                  rows="4"
                  minLength="10"
                  required
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-3"
                />

              </div>


              {/* MENSAGENS */}

              {erro && (
                <p className="mt-4 text-sm text-erro">
                  {erro}
                </p>
              )}


              {mensagem && (
                <p className="mt-4 text-sm text-sucesso">
                  {mensagem}
                </p>
              )}


              {/* BOTÕES */}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <button
                  type="submit"
                  className="bg-primaria text-white px-5 py-3 rounded-lg font-medium hover:bg-primaria-hover transition cursor-pointer"
                >
                  Guardar alterações
                </button>

                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="border border-borda text-texto px-5 py-3 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar edição
                </button>

              </div>

            </form>

          ) : (

            <>

              <h2 className="text-xl font-bold text-texto">
                Dados da consulta
              </h2>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">

                <div>

                  <p className="text-sm text-texto-secundario">
                    Data
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    {consulta.data}
                  </p>

                </div>


                <div>

                  <p className="text-sm text-texto-secundario">
                    Horário
                  </p>

                  <p className="font-semibold text-texto mt-1">
                    {consulta.horario || consulta.hora}
                  </p>

                </div>


                <div className="sm:col-span-2">

                  <p className="text-sm text-texto-secundario">
                    Motivo da consulta
                  </p>

                  <p className="text-texto mt-1">
                    {consulta.motivo || "Nenhum motivo informado."}
                  </p>

                </div>

              </div>


              {mensagem && (
                <p className="mt-5 text-sm text-sucesso">
                  {mensagem}
                </p>
              )}

            </>

          )}

        </section>


        {/* GESTÃO */}

        {!editando && (
          <section className="bg-white border border-borda rounded-2xl shadow-sm p-6 mt-6">

            <h2 className="text-xl font-bold text-texto">
              Gestão da consulta
            </h2>

            <p className="text-sm text-texto-secundario mt-1">
              Acções disponíveis para esta consulta.
            </p>


            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              {podeGerir && (
                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="bg-primaria text-white px-5 py-3 rounded-lg font-medium hover:bg-primaria-hover transition cursor-pointer"
                >
                  Editar consulta
                </button>
              )}


              {podeGerir && (
                <button
                  type="button"
                  onClick={cancelar}
                  className="border border-erro text-erro px-5 py-3 rounded-lg font-medium hover:bg-red-50 transition cursor-pointer"
                >
                  Cancelar consulta
                </button>
              )}


              <Link
                to="/paciente/minhas-consultas"
                className="border border-borda text-texto px-5 py-3 rounded-lg font-medium hover:bg-gray-50 transition text-center"
              >
                Voltar às consultas
              </Link>

            </div>

          </section>
        )}

      </div>

    </main>
  )
}


export default DetalhesConsulta