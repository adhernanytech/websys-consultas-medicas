import {
  obterConsultasPorMedico
} from "../data/consultas"

import {
  obterDisponibilidadePorData
} from "../data/disponibilidade"

import {
  gerarHorarios
} from "./horarios"


export function obterHorariosDoDia(
  doctorId,
  data,
  duracao = 30
) {
  const disponibilidades =
    obterDisponibilidadePorData(
      doctorId,
      data
    )

  const consultas =
    obterConsultasPorMedico(
      doctorId
    )

  const consultasDoDia =
    consultas.filter(
      (consulta) => {
        if (
          consulta.status ===
          "cancelada"
        ) {
          return false
        }

        const disponibilidade =
          disponibilidades.find(
            (item) =>
              String(item.id) ===
              String(
                consulta.disponibilidade_id
              )
          )

        return Boolean(
          disponibilidade
        )
      }
    )

  const horarios = []

  disponibilidades.forEach(
    (disponibilidade) => {
      const horariosDisponiveis =
        gerarHorarios(
          disponibilidade.start_time,
          disponibilidade.end_time,
          duracao
        )

      horariosDisponiveis.forEach(
        (hora) => {
          const ocupado =
            consultasDoDia.some(
              (consulta) => {
                const mesmaDisponibilidade =
                  String(
                    consulta.disponibilidade_id
                  ) ===
                  String(
                    disponibilidade.id
                  )

                const mesmaHora =
                  consulta.hora === hora

                return (
                  mesmaDisponibilidade &&
                  mesmaHora
                )
              }
            )

          horarios.push({
            hora,
            disponibilidade_id:
              disponibilidade.id,
            disponivel: !ocupado
          })
        }
      )
    }
  )

  return horarios
}