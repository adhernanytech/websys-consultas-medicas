/*
  Horários de atendimento dos médicos.

  Esta estrutura é temporária enquanto o projecto
  ainda não possui backend.

  Mais tarde estes dados virão da base de dados.
*/

const horariosMedicos = {

  /*
    Médico ID 4
  */
  4: {
    1: ["09:00", "09:30", "10:00", "10:30", "11:00"],
    2: ["14:00", "14:30", "15:00", "15:30", "16:00"],
    3: ["09:00", "09:30", "10:00", "10:30"],
    4: ["14:00", "14:30", "15:00", "15:30"],
    5: ["09:00", "09:30", "10:00", "10:30", "11:00"]
  },

  /*
    Médico ID 2
  */
  2: {
    1: ["08:00", "08:30", "09:00", "09:30"],
    3: ["14:00", "14:30", "15:00", "15:30"],
    5: ["08:00", "08:30", "09:00", "09:30"]
  },

  /*
    Médico ID 3
  */
  3: {
    2: ["09:00", "09:30", "10:00", "10:30"],
    4: ["14:00", "14:30", "15:00", "15:30"]
  }

}

export default horariosMedicos