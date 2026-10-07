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

function obterDataLocal() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data) return "Data não definida";

  const [ano, mes, dia] = String(data).split("-");

  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

function CartaoResumo({
  titulo,
  valor,
  descricao,
  simbolo,
  cor = "bg-blue-50 text-blue-700",
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-texto-secundario">
            {titulo}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-texto">
            {valor}
          </p>

          <p className="mt-2 text-sm text-texto-secundario">
            {descricao}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${cor}`}
          aria-hidden="true"
        >
          {simbolo}
        </div>
      </div>
    </article>
  );
}

function EstadoConsulta({ estado }) {
  const estilos = {
    Agendada: "bg-blue-50 text-blue-700",
    Confirmada: "bg-indigo-50 text-indigo-700",
    Realizada: "bg-green-50 text-green-700",
    Concluída: "bg-green-50 text-green-700",
    Cancelada: "bg-gray-100 text-gray-600",
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

export default function DashboardMedico() {
  const medico = obterMedicoAutenticado();

  if (!medico) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl">
            !
          </div>

          <h1 className="mt-4 text-2xl font-bold text-texto">
            Perfil médico não associado
          </h1>

          <p className="mt-2 max-w-2xl text-texto-secundario">
            A conta autenticada ainda não está associada a um perfil
            médico. Contacte a administração para concluir a associação.
          </p>
        </section>
      </main>
    );
  }

  const disponibilidades =
    obterAgendaDoMedico(medico.id) || [];

  const consultas =
    obterConsultasDoMedico(medico.id) || [];

  const hoje = obterDataLocal();

  const consultasAgendadas = consultas.filter(
    (consulta) =>
      consulta.estado === "Agendada" ||
      consulta.estado === "Confirmada"
  );

  const consultasHoje = consultasAgendadas.filter(
    (consulta) => consulta.data === hoje
  );

  const horariosLivres = disponibilidades.filter(
    (item) => item.estado === "Disponível"
  );

  const proximasConsultas = consultasAgendadas
    .filter((consulta) => consulta.data >= hoje)
    .sort((a, b) => {
      const dataA = `${a.data || ""} ${a.horario || ""}`;
      const dataB = `${b.data || ""} ${b.horario || ""}`;

      return dataA.localeCompare(dataB);
    })
    .slice(0, 5);

  const nomeMedico =
    medico.nome || "Profissional de saúde";

  return (
    <main className="min-h-[70vh] bg-gray-50/70">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Cabeçalho de boas-vindas */}

        <header className="relative mb-8 overflow-hidden rounded-3xl bg-primaria px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/10"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-white/5"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Área profissional
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Bem-vindo/a, {nomeMedico}
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
              Consulte a sua agenda, acompanhe as marcações e
              mantenha os seus horários actualizados.
            </p>

            <p className="mt-3 text-sm font-medium text-white/90">
              {medico.especialidade || "Especialidade não definida"}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/medico/disponibilidades"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primaria transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primaria"
              >
                Gerir disponibilidades
              </Link>

              <a
                href="#proximas-consultas"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Ver próximas consultas
              </a>
            </div>
          </div>
        </header>

        {/* Indicadores */}

        <section aria-labelledby="titulo-resumo">
          <div className="mb-4">
            <h2
              id="titulo-resumo"
              className="text-xl font-bold text-texto"
            >
              Resumo da actividade
            </h2>

            <p className="mt-1 text-sm text-texto-secundario">
              Visão geral da sua agenda.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CartaoResumo
              titulo="Consultas por atender"
              valor={consultasAgendadas.length}
              descricao="Agendadas e confirmadas"
              simbolo="C"
              cor="bg-blue-50 text-blue-700"
            />

            <CartaoResumo
              titulo="Consultas de hoje"
              valor={consultasHoje.length}
              descricao="Marcações para hoje"
              simbolo="H"
              cor="bg-violet-50 text-violet-700"
            />

            <CartaoResumo
              titulo="Horários disponíveis"
              valor={horariosLivres.length}
              descricao="Horários livres registados"
              simbolo="D"
              cor="bg-green-50 text-green-700"
            />

            <CartaoResumo
              titulo="Disponibilidades"
              valor={disponibilidades.length}
              descricao="Registos da sua agenda"
              simbolo="A"
              cor="bg-amber-50 text-amber-700"
            />
          </div>
        </section>

        {/* Conteúdo principal */}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">

          {/* Próximas consultas */}

          <section
            id="proximas-consultas"
            aria-labelledby="titulo-proximas-consultas"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  id="titulo-proximas-consultas"
                  className="text-xl font-bold text-texto"
                >
                  Próximas consultas
                </h2>

                <p className="mt-1 text-sm text-texto-secundario">
                  As próximas marcações agendadas ou confirmadas.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {consultasAgendadas.length} agendada(s)
              </span>
            </div>

            {proximasConsultas.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500">
                  C
                </div>

                <h3 className="mt-4 font-semibold text-texto">
                  Sem próximas consultas
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-texto-secundario">
                  Quando existirem consultas agendadas para hoje ou
                  para os próximos dias, serão apresentadas aqui.
                </p>

                <Link
                  to="/medico/disponibilidades"
                  className="mt-5 inline-flex rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primaria-hover"
                >
                  Actualizar disponibilidades
                </Link>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-gray-100">
                {proximasConsultas.map((consulta) => (
                  <Link
                    key={consulta.id}
                    to={`/medico/agenda/${consulta.id}`}
                    className="flex flex-col gap-3 py-5 first:pt-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <span className="text-xs font-medium">
                          {consulta.data
                            ? consulta.data.split("-")[2]
                            : "--"}
                        </span>

                        <span className="text-[10px] font-semibold uppercase">
                          {consulta.data
                            ? consulta.data.split("-")[1]
                            : "--"}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-texto">
                          {consulta.pacienteNome ||
                            "Paciente sem nome registado"}
                        </h3>

                        <p className="mt-1 text-sm text-texto-secundario">
                          {formatarData(consulta.data)}
                          {consulta.horario
                            ? ` · ${consulta.horario}`
                            : ""}
                          {consulta.horaFim
                            ? ` – ${consulta.horaFim}`
                            : ""}
                        </p>

                        {consulta.motivo && (
                          <p className="mt-1 break-words text-sm text-texto-secundario">
                            Motivo: {consulta.motivo}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:shrink-0">
                      <EstadoConsulta estado={consulta.estado} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Acessos rápidos */}

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-texto">
                Acessos rápidos
              </h2>

              <p className="mt-1 text-sm text-texto-secundario">
                As tarefas mais frequentes da sua área.
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  to="/medico/disponibilidades"
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-primaria hover:bg-blue-50/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-700">
                    +
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-texto">
                      Gerir disponibilidades
                    </span>

                    <span className="mt-1 block text-sm text-texto-secundario">
                      Adicionar ou remover horários.
                    </span>
                  </span>

                  <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-primaria">
                    →
                  </span>
                </Link>

                <Link
                  to="/medico/pacientes"
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-primaria hover:bg-blue-50/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 font-bold text-violet-700">
                    P
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-texto">
                      Consultar pacientes
                    </span>
                    <span className="mt-1 block text-sm text-texto-secundario">
                      Pesquisar pacientes e rever o histórico clínico.
                    </span>
                  </span>
                  <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-primaria">
                    →
                  </span>
                </Link>

                <Link
                  to="/medico/agenda"
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-primaria hover:bg-blue-50/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 font-bold text-green-700">
                    C
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-texto">
                      Consultar agenda
                    </span>

                    <span className="mt-1 block text-sm text-texto-secundario">
                      Ver as próximas marcações.
                    </span>
                  </span>

                  <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-primaria">
                    →
                  </span>
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
              <h2 className="font-bold text-texto">
                Lembrete profissional
              </h2>

              <p className="mt-2 text-sm leading-6 text-texto-secundario">
                Mantenha os horários actualizados para que os
                pacientes possam encontrar períodos disponíveis
                para marcação.
              </p>

              <Link
                to="/medico/disponibilidades"
                className="mt-4 inline-flex font-semibold text-primaria underline-offset-4 hover:underline"
              >
                Rever horários
              </Link>
            </section>
          </aside>
        </div>

        {/* Rodapé interno do dashboard */}

        <p className="mt-8 text-center text-xs text-texto-secundario">
          Informação apresentada com base nos registos da sua conta.
        </p>
      </div>
    </main>
  );
}
