export function horaParaMinutos(hora) {
  const [horas, minutos] =
    hora.split(":").map(Number)

  return horas * 60 + minutos
}


export function minutosParaHora(
  minutos
) {
  const horas = Math.floor(
    minutos / 60
  )

  const minutosRestantes =
    minutos % 60

  return `${String(horas).padStart(
    2,
    "0"
  )}:${String(
    minutosRestantes
  ).padStart(2, "0")}`
}


export function gerarHorarios(
  horaInicio,
  horaFim,
  duracao = 30
) {
  const inicio =
    horaParaMinutos(horaInicio)

  const fim =
    horaParaMinutos(horaFim)

  const horarios = []

  for (
    let minutos = inicio;
    minutos + duracao <= fim;
    minutos += duracao
  ) {
    horarios.push(
      minutosParaHora(minutos)
    )
  }

  return horarios
}