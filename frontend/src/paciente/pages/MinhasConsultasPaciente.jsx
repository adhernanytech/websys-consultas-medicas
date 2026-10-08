
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import medicos from "../../data/medicos";
import {
  obterConsultasDoPaciente,
  cancelarConsulta,
} from "../../data/consultas";
import { obterUsuarioAutenticado } from "../../data/usuarios";

export default function MinhasConsultas() {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");

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
      setErro(error.message || "Não foi possível cancelar a consulta.");
    }
  }

  function formatarData(data) {
    return new Date(`${data}T12:00:00`).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
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

      {erro && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {erro}
        </div>
      )}

      {consultas.length === 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">Ainda não tem consultas</h2>
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
      ) : (
        <div className="space-y-4">
          {consultas.map((consulta) => {
            const medico = medicos.find(
              (item) => String(item.id) === String(consulta.medicoId)
            );

            return (
              <article
                key={consulta.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-texto">
                      {consulta.medicoNome || medico?.nome || "Médico"}
                    </h2>
                    <p className="text-sm text-texto-secundario">
                      {consulta.especialidade || medico?.especialidade}
                    </p>
                  </div>

                  <span
                    className={`rounded-full font-semibold px-3 py-1 text-sm ${
                      consulta.estado === "Agendada"
                        ? "bg-blue-50 border border-blue-200 text-blue-800"
                        : consulta.estado === "Cancelada"
                          ? "bg-gray-100 text-erro"
                          : "bg-green-100 text-sucesso"
                    }`}
                  >
                    {consulta.estado}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <strong>Data:</strong> {formatarData(consulta.data)}
                  </p>
                  <p>
                    <strong>Horário:</strong> {consulta.horario}
                    {consulta.horaFim ? ` – ${consulta.horaFim}` : ""}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium">Motivo</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {consulta.motivo}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/paciente/minhas-consultas/${consulta.id}`}
                    className="rounded-lg bg-primaria px-4 py-2 text-sm font-medium text-white hover:bg-primaria-hover transition"
                  >
                    Ver detalhes
                  </Link>

                  {consulta.estado === "Agendada" && (
                    <button
                      type="button"
                      onClick={() => tratarCancelamento(consulta.id)}
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
