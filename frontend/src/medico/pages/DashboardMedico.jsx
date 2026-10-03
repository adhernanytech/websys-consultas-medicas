
import { Link } from "react-router-dom";

import {
  obterMedicoAutenticado,
} from "../../data/medicos";

import {
  obterAgendaDoMedico,
} from "../../data/disponibilidades";

import {
  obterConsultasDoMedico,
} from "../../data/consultas";

export default function DashboardMedico() {
  const medico = obterMedicoAutenticado();

  if (!medico) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">
          Perfil médico não associado
        </h1>
        <p className="mt-2 text-texto-secundario">
          A conta autenticada não está associada a um perfil médico.
        </p>
      </main>
    );
  }

  const disponibilidades = obterAgendaDoMedico(medico.id);
  const consultas = obterConsultasDoMedico(medico.id);

  const consultasAgendadas = consultas.filter(
    (consulta) => consulta.estado === "Agendada"
  );

  const horariosLivres = disponibilidades.filter(
    (item) => item.estado === "Disponível"
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <p className="text-sm text-texto">
          Área do médico
        </p>

        <h1 className="mt-1 text-3xl font-bold text-texto">
          Bem-vindo, {medico.nome}
        </h1>

        <p className="mt-2 text-texto-secundario">
          {medico.especialidade}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-texto-secundario">
            Disponibilidades registadas
          </p>
          <p className="mt-2 text-3xl font-bold">
            {disponibilidades.length}
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-texto-secundario">
            Horários disponíveis
          </p>
          <p className="mt-2 text-3xl font-bold">
            {horariosLivres.length}
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-texto-secundario">
            Consultas agendadas
          </p>
          <p className="mt-2 text-3xl font-bold">
            {consultasAgendadas.length}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold">
          Gestão da agenda
        </h2>

        <p className="mt-2 text-texto-secundario">
          Registe os horários em que poderá receber pacientes.
        </p>

        <Link
          to="/medico/disponibilidades"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Gerir disponibilidades
        </Link>
      </section>
    </main>
  );
}
