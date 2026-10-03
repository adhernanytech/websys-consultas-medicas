const CHAVE_CONSULTAS = "consultas"


export function obterConsultas() {
  return JSON.parse(
    localStorage.getItem(CHAVE_CONSULTAS)
  ) || []
}


export function guardarConsultas(consultas) {
  localStorage.setItem(
    CHAVE_CONSULTAS,
    JSON.stringify(consultas)
  )
}


export function obterConsultaPorId(id) {
  const consultas = obterConsultas()

  return consultas.find(
    (consulta) =>
      String(consulta.id) === String(id)
  ) || null
}


export function actualizarConsulta(id, dados) {
  const consultas = obterConsultas()

  const novasConsultas = consultas.map(
    (consulta) => {
      if (String(consulta.id) === String(id)) {
        return {
          ...consulta,
          ...dados
        }
      }

      return consulta
    }
  )

  guardarConsultas(novasConsultas)

  return novasConsultas.find(
    (consulta) =>
      String(consulta.id) === String(id)
  ) || null
}


export function cancelarConsulta(id) {
  return actualizarConsulta(
    id,
    {
      estado: "Cancelada"
    }
  )
}


export function editarConsulta(id, dados) {
  const consulta = obterConsultaPorId(id)

  if (!consulta) {
    return null
  }

  /*
    Apenas consultas que ainda podem
    ser geridas podem ser alteradas.
  */
  if (
    consulta.estado !== "Agendada" &&
    consulta.estado !== "Confirmada"
  ) {
    return null
  }

  return actualizarConsulta(id, {
    data: dados.data,
    horario: dados.horario,
    motivo: dados.motivo.trim()
  })
}