import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import medicos from "../../data/medicos";
import {
  obterConsultasDoPaciente,
  cancelarConsulta,
} from "../../data/consultas";
import { obterUsuarioAutenticado } from "../../data/usuarios";
import { useStorageSync } from "../../hooks/useStorageSync";

export default function MinhasConsultas() {
  const navigate = useNavigate();

  // Forçar re-render quando consultas em localStorage mudam
  useStorageSync("consultas");

  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  const paciente = obterUsuarioAutenticado();

  if (!paciente) {
    navigate("/login");
    return null;
  }

  if (
    paciente.tipo !== "paciente" &&
    paciente.role !== "paciente"
  ) {
    navigate("/");
    return null;
  }

  if (paciente.ativo === false) {
    navigate("/login");
    return null;
  }

  const consultas = obterConsultasDoPaciente(paciente.id);

  // Filtrar consultas de acordo com o estado selecionado
  const consultasFiltradas =
    filtro === "Todas"
      ? consultas
      : consultas.filter(
          (consulta) => consulta.estado === filtro
        );

  function tratarCancelamento(consultaId) {
    const pacienteAtual = obterUsuarioAutenticado();

    if (!pacienteAtual) {
      navigate("/login");
      return;
    }

    const confirmar = window.confirm(
      "Tem a certeza de que pretende cancelar esta consulta?"
    );

    if (!confirmar) return;

    try {
      cancelarConsulta(consultaId, pacienteAtual.id);
      setErro("");
    } catch (error) {
      setErro(
        error.message || "Não foi possível cancelar a consulta."
      );
    }
  }

  function formatarData(data) {
    return new Date(`${data}T12:00:00`).toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  // Configuração dos filtros
  const filtros = [
    {
      nome: "Todas",
      quantidade: consultas.length,
    },
    {
      nome: "Agendada",
      quantidade: consultas.filter(
        (consulta) => consulta.estado === "Agendada"
      ).length,
    },
    {
      nome: "Confirmada",
      quantidade: consultas.filter(
        (consulta) => consulta.estado === "Confirmada"
      ).length,
    },
    {
      nome: "Realizada",
      quantidade: consultas.filter(
        (consulta) =>
          consulta.estado === "Realizada" ||
          consulta.estado === "Realizada"
      ).length,
    },
    {
      nome: "Cancelada",
      quantidade: consultas.filter(
        (consulta) => consulta.estado === "Cancelada"
      ).length,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-texto">
            Minhas consultas
          </h1>

          <p className="mt-1 text-texto-secundario">
            Consulte as suas marcações e respectivos estados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/paciente/medicos")}
          className="rounded-lg bg-primaria px-4 py-2 text-white hover:bg-primaria-hover"
        >
          Marcar consulta
        </button>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-red-700"
        >
          {erro}
        </div>
      )}

      {/* Filtros */}
      {consultas.length > 0 && (
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-texto">
              Filtrar consultas
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {filtros.map((item) => {
              const ativo = filtro === item.nome;

              return (
                <button
                  key={item.nome}
                  type="button"
                  onClick={() => setFiltro(item.nome)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    ativo
                      ? "border-primaria bg-primaria text-white"
                      : "border-gray-200 bg-white text-texto hover:bg-gray-50"
                  }`}
                >
                  {item.nome}

                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      ativo
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.quantidade}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Nenhuma consulta */}
      {consultas.length === 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">
            Ainda não tem consultas
          </h2>

          <p className="mt-2 text-gray-600">
            Escolha um médico para consultar os horários disponíveis.
          </p>

          <button
            type="button"
            onClick={() => navigate("/medicos")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Ver médicos
          </button>
        </section>
      ) : consultasFiltradas.length === 0 ? (
        /* Nenhuma consulta encontrada para o filtro */
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-texto">
            Nenhuma consulta encontrada
          </h2>

          <p className="mt-2 text-gray-600">
            Não existem consultas com o estado "{filtro}".
          </p>

          <button
            type="button"
            onClick={() => setFiltro("Todas")}
            className="mt-4 rounded-lg bg-primaria px-4 py-2 text-white hover:bg-primaria-hover"
          >
            Ver todas
          </button>
        </section>
      ) : (
        /* Lista de consultas */
        <div className="space-y-4">
          {consultasFiltradas.map((consulta) => {
            const medico = medicos.find(
              (item) =>
                String(item.id) === String(consulta.medicoId)
            );

            return (
              <article
                key={consulta.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-texto">
                      {consulta.medicoNome ||
                        medico?.nome ||
                        "Médico"}
                    </h2>

                    <p className="text-sm text-texto-secundario">
                      {consulta.especialidade ||
                        medico?.especialidade}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      consulta.estado === "Agendada"
                        ? "border border-blue-200 bg-blue-50 text-blue-800"
                        : consulta.estado === "Confirmada"
                          ? "border border-green-200 bg-green-50 text-green-800"
                          : consulta.estado === "Cancelada"
                            ? "bg-gray-100 text-erro"
                            : "border border-purple-200 bg-purple-50 text-purple-800"
                    }`}
                  >
                    {consulta.estado}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <strong>Data:</strong>{" "}
                    {formatarData(consulta.data)}
                  </p>

                  <p>
                    <strong>Horário:</strong>{" "}
                    {consulta.horario}
                    {consulta.horaFim
                      ? ` – ${consulta.horaFim}`
                      : ""}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium">
                    Motivo
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {consulta.motivo}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/paciente/minhas-consultas/${consulta.id}`}
                    className="rounded-lg bg-primaria px-4 py-2 text-sm font-medium text-white transition hover:bg-primaria-hover"
                  >
                    Ver detalhes
                  </Link>

                  {consulta.estado === "Agendada" && (
                    <button
                      type="button"
                      onClick={() =>
                        tratarCancelamento(consulta.id)
                      }
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Cancelar consulta
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

