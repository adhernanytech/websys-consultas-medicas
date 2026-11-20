
function formatarData(valor) {
  if (!valor) return null;

  if (typeof valor === "string") {
    return valor.slice(0, 10);
  }

  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    throw new Error("Data de disponibilidade inválida.");
  }

  // PostgreSQL DATE: preservar o dia, sem conversão de fuso.
  return valor.toISOString().slice(0, 10);
}

function formatarHora(valor) {
  if (!valor) return null;

  if (typeof valor === "string") {
    const correspondencia = valor.match(
      /^([01]\d|2[0-3]):[0-5]\d/
    );

    if (!correspondencia) {
      throw new Error("Hora de disponibilidade inválida.");
    }

    return valor.slice(0, 5);
  }

  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    throw new Error("Hora de disponibilidade inválida.");
  }

  // PostgreSQL TIME: utilizar a componente UTC convencionada
  // pelo Prisma para representar a hora, sem converter o fuso.
  return valor.toISOString().slice(11, 16);
}

function formatarDisponibilidade(disponibilidade) {
  if (!disponibilidade) return disponibilidade;

  return {
    ...disponibilidade,
    data: formatarData(disponibilidade.data),
    hora_inicio: formatarHora(disponibilidade.hora_inicio),
    hora_fim: formatarHora(disponibilidade.hora_fim),
  };
}

module.exports = {
  formatarData,
  formatarHora,
  formatarDisponibilidade,
};
