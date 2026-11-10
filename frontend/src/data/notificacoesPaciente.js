import { obterConsultasDoPaciente } from "./consultas"
import { registarAccaoUtilizador } from "./auditoriaAdmin"

function chaveLeituras(pacienteId) { return `notificacoesPacienteLeituras:${pacienteId}` }
function obterLeituras(pacienteId) {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveLeituras(pacienteId)) || "[]")
    return Array.isArray(dados) ? dados.map(String) : []
  } catch { return [] }
}
function dataHoraConsulta(consulta) {
  if (!consulta?.data) return null
  const hora = consulta.horario || "00:00"
  const data = new Date(`${consulta.data}T${hora}:00`)
  return Number.isNaN(data.getTime()) ? null : data
}

/** Notificações derivadas das consultas locais; não substituem notificações enviadas pelo servidor. */
export function obterNotificacoesPaciente(pacienteId) {
  if (pacienteId == null) return []
  const consultas = obterConsultasDoPaciente(pacienteId)
  const leituras = new Set(obterLeituras(pacienteId))
  const notificacoes = []

  for (const consulta of consultas) {
    const estado = String(consulta.estado || "Agendada")
    const idEstado = `consulta-${consulta.id}-estado-${estado}`
    const dataTexto = consulta.data ? new Date(`${consulta.data}T12:00:00`).toLocaleDateString("pt-PT") : "data por definir"
    const medico = consulta.medicoNome || "o médico seleccionado"
    let titulo = "Actualização da consulta"
    let mensagem = `A sua consulta com ${medico}, prevista para ${dataTexto}, está com o estado: ${estado}.`
    let tipo = "consulta"

    if (estado === "Agendada") { titulo = "Pedido de consulta registado"; mensagem = `A marcação com ${medico} para ${dataTexto} foi registada e aguarda confirmação.` }
    else if (estado === "Confirmada") { titulo = "Consulta confirmada"; mensagem = `A consulta com ${medico} em ${dataTexto} está confirmada.` }
    else if (estado === "Cancelada") { titulo = "Consulta cancelada"; mensagem = `A consulta com ${medico} prevista para ${dataTexto} foi cancelada.`; tipo = "aviso" }
    else if (["Concluída", "Realizada"].includes(estado)) { titulo = "Consulta concluída"; mensagem = `A consulta com ${medico} em ${dataTexto} foi registada como realizada.`; tipo = "sucesso" }
    else if (estado === "Não compareceu") { titulo = "Falta registada"; mensagem = `Foi registada uma falta à consulta com ${medico} em ${dataTexto}.`; tipo = "aviso" }

    notificacoes.push({ id: idEstado, consultaId: consulta.id, titulo, mensagem, tipo, data: consulta.actualizadaEm || consulta.atualizadaEm || consulta.criadaEm || `${consulta.data}T${consulta.horario || "00:00"}:00`, lida: leituras.has(idEstado), link: `/paciente/minhas-consultas/${consulta.id}` })

    const quando = dataHoraConsulta(consulta)
    if (quando && quando.getTime() > Date.now() && quando.getTime() - Date.now() <= 48 * 60 * 60 * 1000 && ["Agendada", "Confirmada"].includes(estado)) {
      const idLembrete = `consulta-${consulta.id}-lembrete-${consulta.data}`
      notificacoes.push({ id: idLembrete, consultaId: consulta.id, titulo: "Consulta próxima", mensagem: `Tem uma consulta ${estado.toLowerCase()} com ${medico} em ${dataTexto}, às ${consulta.horario || "hora por confirmar"}.`, tipo: "lembrete", data: quando.toISOString(), lida: leituras.has(idLembrete), link: `/paciente/minhas-consultas/${consulta.id}` })
    }
  }

  return notificacoes.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0))
}

export function marcarNotificacaoComoLida(pacienteId, notificacaoId) {
  if (pacienteId == null || !notificacaoId) return
  const leituras = new Set(obterLeituras(pacienteId))
  leituras.add(String(notificacaoId))
  localStorage.setItem(chaveLeituras(pacienteId), JSON.stringify([...leituras]))
  registarAccaoUtilizador("Notificação marcada como lida", "notificação", `Paciente ID ${pacienteId}; notificação ${notificacaoId}`)
}

export function marcarTodasNotificacoesComoLidas(pacienteId) {
  if (pacienteId == null) return
  const ids = obterNotificacoesPaciente(pacienteId).map((item) => String(item.id))
  const leituras = new Set([...obterLeituras(pacienteId), ...ids])
  localStorage.setItem(chaveLeituras(pacienteId), JSON.stringify([...leituras]))
  registarAccaoUtilizador("Todas as notificações marcadas como lidas", "notificação", `Paciente ID ${pacienteId}; total ${ids.length}`)
}
