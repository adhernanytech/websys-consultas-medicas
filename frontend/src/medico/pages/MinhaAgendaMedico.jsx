import { useMemo } from "react";

import { obterMedicoAutenticado } from "../../data/medicos";
import { obterConsultasDoMedico } from "../../data/consultas";

function obterDataHoje() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data) return "Data não definida";

  const partes = String(data).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function EstadoConsulta({ estado }) {
  const estilos = {
    Agendada: "bg-blue-50 text-aviso",
    Realizada: "bg-green-50 text-sucesso",
    Cancelada: "bg-red-50 text-erro",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[estado] || "bg-gray-100 text-gray-600"
      }`}
    >
      {estado || "Sem estado"}
    </span>
  );
}

function CartaoConsulta({ consulta }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 gap-4">

          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primaria/10 text-primaria">
            <span className="text-lg font-bold">
              {consulta.horario || "--"}
            </span>

            {consulta.horaFim && (
              <span className="text-[10px] font-medium">
                até {consulta.horaFim}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-texto">
              {consulta.pacienteNome || "Paciente"}
            </h3>

            <p className="mt-1 text-sm text-texto-secundario">
              {formatarData(consulta.data)}
            </p>

            {consulta.pacienteEmail && (
              <p className="mt-1 break-all text-sm text-texto-secundario">
                {consulta.pacienteEmail}
              </p>
            )}
          </div>

        </div>

        <EstadoConsulta estado={consulta.estado} />

      </div>

      {consulta.motivo && (
        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
            Motivo da consulta
          </p>

          <p className="mt-2 text-sm leading-6 text-texto">
            {consulta.motivo}
          </p>
        </div>
      )}

    </article>
  );
}

export default function MinhaAgendaMedico() {
  const medico = obterMedicoAutenticado();

  const consultas = useMemo(() => {
    if (!medico) return [];

    return obterConsultasDoMedico(medico.id) || [];
  }, [medico]);

  const hoje = obterDataHoje();

  const consultasAgendadas = consultas
    .filter((consulta) => consulta.estado === "Agendada")
    .sort((a, b) => {
      const dataA = `${a.data || ""} ${a.horario || ""}`;
      const dataB = `${b.data || ""} ${b.horario || ""}`;

      return dataA.localeCompare(dataB);
    });

  const consultasHoje = consultasAgendadas.filter(
    (consulta) => consulta.data === hoje
  );

  const proximasConsultas = consultasAgendadas.filter(
    (consulta) => consulta.data > hoje
  );

  if (!medico) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-bold text-texto">
            Perfil médico não associado
          </h1>

          <p className="mt-2 text-texto-secundario">
            Não foi possível carregar a agenda médica.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50/70">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Cabeçalho */}

        <header className="mb-8">
          <span className="inline-flex rounded-full bg-white border border-primaria px-3 py-1 text-xs font-semibold uppercase tracking-wide text-texto">
            Agenda médica
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-texto">
            Minha agenda
          </h1>

          <p className="mt-2 max-w-2xl text-texto-secundario">
            Consulte as marcações dos seus pacientes e acompanhe
            a sua agenda.
          </p>
        </header>

        {/* Resumo */}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-texto-secundario">
              Consultas de hoje
            </p>

            <p className="mt-2 text-3xl font-bold text-texto">
              {consultasHoje.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-texto-secundario">
              Próximas consultas
            </p>

            <p className="mt-2 text-3xl font-bold text-texto">
              {proximasConsultas.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-texto-secundario">
              Total agendado
            </p>

            <p className="mt-2 text-3xl font-bold text-texto">
              {consultasAgendadas.length}
            </p>
          </div>
        </section>

        {/* Consultas de hoje */}

        <section aria-labelledby="consultas-hoje">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="consultas-hoje"
                className="text-xl font-bold text-texto"
              >
                Hoje
              </h2>

              <p className="mt-1 text-sm text-texto-secundario">
                Consultas marcadas para hoje.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {consultasHoje.length}
            </span>
          </div>

          {consultasHoje.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-semibold text-texto">
                Não existem consultas marcadas para hoje.
              </p>

              <p className="mt-2 text-sm text-texto-secundario">
                A sua agenda de hoje está livre.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultasHoje.map((consulta) => (
                <CartaoConsulta
                  key={consulta.id}
                  consulta={consulta}
                />
              ))}
            </div>
          )}
        </section>

        {/* Próximas consultas */}

        <section
          aria-labelledby="proximas-consultas"
          className="mt-10"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="proximas-consultas"
                className="text-xl font-bold text-texto"
              >
                Próximas consultas
              </h2>

              <p className="mt-1 text-sm text-texto-secundario">
                Consultas agendadas para os próximos dias.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
              {proximasConsultas.length}
            </span>
          </div>

          {proximasConsultas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-semibold text-texto">
                Não existem próximas consultas.
              </p>

              <p className="mt-2 text-sm text-texto-secundario">
                Novas marcações aparecerão automaticamente nesta área.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proximasConsultas.map((consulta) => (
                <CartaoConsulta
                  key={consulta.id}
                  consulta={consulta}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
