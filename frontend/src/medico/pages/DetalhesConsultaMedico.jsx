import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obterMedicoAutenticado,
} from "../../data/medicos";

import {
  obterConsultasDoMedico,
  marcarConsultaComoRealizada,
  cancelarConsultaPeloMedico,
} from "../../data/consultas";

function formatarData(data) {
  if (!data) return "Data não definida";

  const partes = String(data).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function EstadoConsulta({ estado }) {
  const estilos = {
    Agendada: "bg-blue-50 text-blue-700",
    Realizada: "bg-green-50 text-green-700",
    Cancelada: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estilos[estado] || "bg-gray-100 text-gray-600"
        }`}
    >
      {estado || "Sem estado"}
    </span>
  );
}

export default function DetalhesConsultaMedico() {
  const { id } = useParams();
  const navegar = useNavigate();

  const medico = obterMedicoAutenticado();

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const consultas = medico
    ? obterConsultasDoMedico(medico.id) || []
    : [];

  const consulta = consultas.find(
    (item) => String(item.id) === String(id)
  );

  function executarAcao(acao) {
    setMensagem("");
    setErro("");

    const confirmar = window.confirm(
      acao === "realizada"
        ? "Confirmar que esta consulta foi realizada?"
        : "Tem a certeza de que deseja cancelar esta consulta?"
    );

    if (!confirmar) return;

    try {
      if (acao === "realizada") {
        marcarConsultaComoRealizada(
          consulta.id,
          medico.id
        );

        setMensagem(
          "Consulta marcada como realizada com sucesso."
        );
      } else {
        cancelarConsultaPeloMedico(
          consulta.id,
          medico.id
        );

        setMensagem(
          "Consulta cancelada com sucesso."
        );
      }
    } catch (error) {
      setErro(
        error?.message ||
        "Não foi possível actualizar a consulta."
      );
    }
  }

  if (!medico) {
    return null;
  }

  if (!consulta) {
    return (
      <main className="min-h-[70vh] bg-gray-50/70">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-texto">
              Consulta não encontrada
            </h1>

            <p className="mt-2 text-texto-secundario">
              A consulta não existe ou não pertence à sua agenda.
            </p>

            <Link
              to="/medico/agenda"
              className="mt-6 inline-flex rounded-xl bg-primaria px-5 py-3 font-semibold text-white hover:bg-primaria-hover"
            >
              Voltar à agenda
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50/70">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <Link
          to="/medico/agenda"
          className="text-sm font-semibold text-primaria hover:underline"
        >
          ← Voltar à agenda
        </Link>

        <header className="mt-5 mb-6">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Consulta
          </span>

          <h1 className="mt-3 text-3xl font-bold text-texto">
            Detalhes da consulta
          </h1>
        </header>

        {mensagem && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {erro}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-texto">
                {consulta.pacienteNome || "Paciente"}
              </h2>

              <p className="mt-1 text-sm text-texto-secundario">
                {consulta.pacienteEmail ||
                  "E-mail não disponível"}
              </p>
            </div>

            <EstadoConsulta estado={consulta.estado} />
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Data
              </p>

              <p className="mt-2 font-semibold text-texto">
                {formatarData(consulta.data)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Horário
              </p>

              <p className="mt-2 font-semibold text-texto">
                {consulta.horario || "--"}
                {consulta.horaFim
                  ? ` – ${consulta.horaFim}`
                  : ""}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Motivo
              </p>

              <p className="mt-2 leading-7 text-texto">
                {consulta.motivo ||
                  "O paciente não indicou um motivo."}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Especialidade
              </p>

              <p className="mt-2 font-semibold text-texto">
                {consulta.especialidade ||
                  medico.especialidade ||
                  "Não definida"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">
                Consulta criada em
              </p>

              <p className="mt-2 font-semibold text-texto">
                {consulta.criadaEm
                  ? new Date(
                    consulta.criadaEm
                  ).toLocaleString("pt-PT")
                  : "Não disponível"}
              </p>
            </div>

            {consulta.estado === "Realizada" && (
              <Link
                to={`/medico/agenda/${consulta.id}/registo-clinico`}
                className="rounded-lg bg-primaria px-5 py-2.5 font-semibold text-white hover:opacity-90"
              >
                Registo clínico
              </Link>
            )}
            {consulta.pacienteId && (
              <Link
                to={`/medico/pacientes/${consulta.pacienteId}`}
                className="inline-flex items-center justify-center rounded-lg bg-primaria px-5 py-2.5 font-medium text-white transition hover:opacity-90"
              >
                Ver perfil do paciente
              </Link>
            )}

          </div>

          {consulta.estado === "Agendada" && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => executarAcao("cancelada")}
                className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                Cancelar consulta
              </button>

              <button
                type="button"
                onClick={() => executarAcao("realizada")}
                className="rounded-xl bg-primaria px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaria-hover"
              >
                Marcar como realizada
              </button>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

