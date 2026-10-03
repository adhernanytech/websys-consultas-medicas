
import { useEffect, useState } from "react";

import {
  obterMedicoAutenticado,
} from "../../data/medicos";

import {
  obterAgendaDoMedico,
  adicionarDisponibilidade,
  removerDisponibilidade,
} from "../../data/disponibilidades";

export default function GerirDisponibilidade() {
  const [medico, setMedico] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [formulario, setFormulario] = useState({
    data: "",
    horaInicio: "09:00",
    horaFim: "09:30",
  });

  function carregarAgenda() {
    const medicoActual = obterMedicoAutenticado();

    setMedico(medicoActual);

    if (medicoActual) {
      setAgenda(
        obterAgendaDoMedico(medicoActual.id)
      );
    } else {
      setAgenda([]);
    }
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function submeter(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!medico) {
      setErro(
        "A conta autenticada não está associada a um perfil médico."
      );
      return;
    }

    try {
      adicionarDisponibilidade({
        medicoId: medico.id,
        data: formulario.data,
        horaInicio: formulario.horaInicio,
        horaFim: formulario.horaFim,
      });

      setSucesso(
        "Disponibilidade registada com sucesso."
      );

      setFormulario({
        data: "",
        horaInicio: "09:00",
        horaFim: "09:30",
      });

      carregarAgenda();
    } catch (error) {
      setErro(
        error.message ||
        "Não foi possível registar a disponibilidade."
      );
    }
  }

  function remover(id) {
    setErro("");
    setSucesso("");

    const confirmar = window.confirm(
      "Pretende remover esta disponibilidade?"
    );

    if (!confirmar) return;

    try {
      removerDisponibilidade(id, medico.id);

      setSucesso("Disponibilidade removida.");
      carregarAgenda();
    } catch (error) {
      setErro(
        error.message ||
        "Não foi possível remover a disponibilidade."
      );
    }
  }

  function formatarData(data) {
    return new Date(`${data}T12:00:00`).toLocaleDateString(
      "pt-PT",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (!medico) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">
          Perfil médico não associado
        </h1>

        <p className="mt-3 text-gray-600">
          A conta autenticada não está ligada a um perfil médico.
          Solicite a associação da conta ao perfil correcto antes
          de gerir disponibilidades.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-7">
        <p className="text-sm text-blue-700">
          Área do médico
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Gerir disponibilidades
        </h1>

        <p className="mt-2 text-gray-600">
          {medico.nome} — {medico.especialidade}
        </p>
      </header>

      {erro && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-red-700"
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-green-700"
        >
          {sucesso}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Adicionar horário
        </h2>

        <form
          onSubmit={submeter}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label
              htmlFor="data"
              className="mb-1 block text-sm font-medium"
            >
              Data
            </label>

            <input
              id="data"
              name="data"
              type="date"
              value={formulario.data}
              min={new Date().toLocaleDateString("en-CA")}
              onChange={alterarCampo}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label
              htmlFor="horaInicio"
              className="mb-1 block text-sm font-medium"
            >
              Hora de início
            </label>

            <input
              id="horaInicio"
              name="horaInicio"
              type="time"
              value={formulario.horaInicio}
              onChange={alterarCampo}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label
              htmlFor="horaFim"
              className="mb-1 block text-sm font-medium"
            >
              Hora de fim
            </label>

            <input
              id="horaFim"
              name="horaFim"
              type="time"
              value={formulario.horaFim}
              onChange={alterarCampo}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Registar disponibilidade
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          A minha agenda de disponibilidades
        </h2>

        {agenda.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
            Ainda não existem disponibilidades registadas para este perfil.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {agenda.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatarData(item.data)}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {item.horaInicio} – {item.horaFim}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Estado: {item.estado}
                  </p>
                </div>

                {item.estado === "Disponível" && (
                  <button
                    type="button"
                    onClick={() => remover(item.id)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Remover
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
