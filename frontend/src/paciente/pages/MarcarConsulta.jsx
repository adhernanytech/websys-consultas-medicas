
import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import medicos from "../../data/medicos";
import {
  obterDisponibilidadesDoMedico,
} from "../../data/disponibilidades";
import { criarConsulta } from "../../data/consultas";
import { obterUsuarioAutenticado } from "../../data/usuarios";

export default function MarcarConsulta() {
  const { medicoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const medico = medicos.find(
    (item) => String(item.id) === String(medicoId)
  );

  const [disponibilidadeId, setDisponibilidadeId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);

  const disponibilidades = useMemo(() => {
    if (!medico) return [];

    return obterDisponibilidadesDoMedico(medico.id);
  }, [medico, atualizacao]);

  useEffect(() => {
    if (
      disponibilidadeId &&
      !disponibilidades.some(
        (item) => String(item.id) === String(disponibilidadeId)
      )
    ) {
      setDisponibilidadeId("");
    }
  }, [disponibilidades, disponibilidadeId]);

  if (!medico) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-texto">Médico não encontrado</h1>
        <p className="mt-2 text-texto-secundario">
          O médico seleccionado não existe ou já não está disponível.
        </p>
        <button
          type="button"
          onClick={() => navigate("/paciente/medicos")}
          className="mt-4 rounded-lg bg-primaria px-4 py-2 text-white"
        >
          Ver médicos
        </button>
      </main>
    );
  }

  function submeterFormulario(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const paciente = obterUsuarioAutenticado();

    if (!paciente) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (
      paciente.tipo !== "paciente" &&
      paciente.role !== "paciente"
    ) {
      setErro("Só uma conta de paciente pode marcar consultas.");
      return;
    }

    if (!disponibilidadeId) {
      setErro("Seleccione uma data e um horário.");
      return;
    }

    if (motivo.trim().length < 10) {
      setErro("Descreva o motivo da consulta com pelo menos 10 caracteres.");
      return;
    }

    setAGuardar(true);

    try {
      criarConsulta({
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        pacienteEmail: paciente.email,
        medicoNome: medico.nome,
        especialidade: medico.especialidade,
        disponibilidadeId,
        motivo,
      });

      setMensagem("Consulta marcada com sucesso!");
      setMotivo("");
      setDisponibilidadeId("");
      setAtualizacao((valor) => valor + 1);

      window.setTimeout(() => {
        navigate(
          location.pathname.startsWith("/paciente")
            ? "/paciente/minhas-consultas"
            : "/"
        );
      }, 1000);
    } catch (error) {
      setErro(error.message || "Não foi possível marcar a consulta.");
      setAtualizacao((valor) => valor + 1);
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 text-sm text-texto-secundario hover:underline"
      >
        ← Voltar
      </button>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-texto">
          Marcar consulta
        </h1>

        <div className="mt-4 rounded-xl bg-blue-50 p-4">
          <h2 className="font-bold text-xl text-texto">{medico.nome}</h2>
          <p className="text-sm text-texto">
            {medico.especialidade}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {medico.experiencia}
          </p>
        </div>

        {erro && (
          <div
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        {mensagem && (
          <div
            role="status"
            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {mensagem}
          </div>
        )}

        <form onSubmit={submeterFormulario} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="disponibilidade"
              className="mb-2 block font-medium text-gray-800"
            >
              Data e horário disponíveis
            </label>

            {disponibilidades.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Este médico não tem horários disponíveis neste momento.
              </div>
            ) : (
              <select
                id="disponibilidade"
                value={disponibilidadeId}
                onChange={(event) =>
                  setDisponibilidadeId(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              >
                <option value="">Seleccione uma opção</option>

                {disponibilidades.map((item) => (
                  <option key={item.id} value={item.id}>
                    {new Date(`${item.data}T12:00:00`).toLocaleDateString(
                      "pt-PT",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}{" "}
                    — {item.horaInicio} às {item.horaFim}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="motivo"
              className="mb-2 block font-medium text-gray-800"
            >
              Motivo da consulta
            </label>

            <textarea
              id="motivo"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              rows={4}
              minLength={10}
              maxLength={1000}
              required
              placeholder="Descreva brevemente o motivo da consulta..."
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mínimo de 10 caracteres.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              aGuardar ||
              disponibilidades.length === 0 ||
              !disponibilidadeId
            }
            className="w-full rounded-lg bg-primaria px-5 py-3 font-semibold text-white hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aGuardar ? "A marcar consulta..." : "Confirmar marcação"}
          </button>
        </form>
      </section>
    </main>
  );
}
