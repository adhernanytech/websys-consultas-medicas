
import { useEffect, useState } from "react";
import { medicosAPI, disponibilidadesAPI } from "../../services/api";

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function inicioDaSemana(data) {
  const inicio = new Date(`${data}T12:00:00`);
  const diaSemana = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - diaSemana);
  return inicio;
}

export default function GerirDisponibilidade() {
  const [medico, setMedico] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [disponibilidadeEmEdicao, setDisponibilidadeEmEdicao] =
    useState(null);
  const [visualizacao, setVisualizacao] = useState("semana");
  const [dataReferencia, setDataReferencia] = useState(dataLocalISO);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [formulario, setFormulario] = useState({
    data: "",
    horaInicio: "09:00",
    horaFim: "09:30",
  });

  const disponibilidadesVisiveis = agenda.filter((item) => {
    if (visualizacao === "mes") {
      return item.data.slice(0, 7) === dataReferencia.slice(0, 7);
    }

    const inicio = inicioDaSemana(dataReferencia);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 7);
    const inicioISO = dataLocalISO(inicio);
    const fimISO = dataLocalISO(fim);

    return item.data >= inicioISO && item.data < fimISO;
  });

  useEffect(() => {
    let activo = true;
    medicosAPI.obterMeu()
      .then(async ({ data }) => {
        if (!activo) return;
        setMedico(data.dados);
        const { data: disponibilidadeData } = await disponibilidadesAPI.listar({
          medico_id: data.dados.id,
          todas: true,
        });
        if (activo) setAgenda(disponibilidadeData.dados || []);
      })
      .catch((error) => { if (activo) setErro(error.message || "Não foi possível carregar o perfil e agenda do médico.") })
      .finally(() => { if (activo) setCarregando(false) });
    return () => { activo = false };
  }, []);

  function alterarPeriodo(direccao) {
    const data = new Date(`${dataReferencia}T12:00:00`);

    if (visualizacao === "mes") {
      data.setDate(1);
      data.setMonth(data.getMonth() + direccao);
    } else {
      data.setDate(data.getDate() + 7 * direccao);
    }

    setDataReferencia(dataLocalISO(data));
  }

  function iniciarEdicao(item) {
    setDisponibilidadeEmEdicao(item.id);
    setFormulario({
      data: item.data,
      horaInicio: item.horaInicio,
      horaFim: item.horaFim,
    });
    setErro("");
    setSucesso("");
  }

  function cancelarEdicao() {
    setDisponibilidadeEmEdicao(null);
    setFormulario({
      data: "",
      horaInicio: "09:00",
      horaFim: "09:30",
    });
    setErro("");
  }

  async function carregarAgenda() {
    if (!medico) return;
    const { data } = await disponibilidadesAPI.listar({ medico_id: medico.id, todas: true });
    setAgenda(data.dados || []);
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function submeter(event) {
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
      if (disponibilidadeEmEdicao) {
        await disponibilidadesAPI.actualizar(disponibilidadeEmEdicao, {
          medico_id: String(medico.id),
          data: formulario.data,
          hora_inicio: formulario.horaInicio,
          hora_fim: formulario.horaFim,
        });
        setDataReferencia(formulario.data);
        setSucesso("Disponibilidade actualizada com sucesso.");
        cancelarEdicao();
      } else {
        await disponibilidadesAPI.criar({
          medico_id: String(medico.id),
          data: formulario.data,
          hora_inicio: formulario.horaInicio,
          hora_fim: formulario.horaFim,
        });
        setDataReferencia(formulario.data);
        setSucesso("Disponibilidade registada com sucesso.");
        setFormulario({
          data: "",
          horaInicio: "09:00",
          horaFim: "09:30",
        });
      }

      await carregarAgenda();
    } catch (error) {
      setErro(
        error.message ||
        "Não foi possível registar a disponibilidade."
      );
    }
  }

  async function remover(id) {
    setErro("");
    setSucesso("");

    const confirmar = window.confirm(
      "Pretende remover esta disponibilidade?"
    );

    if (!confirmar) return;

    try {
      await disponibilidadesAPI.cancelar(id);

      setSucesso("Disponibilidade removida.");
      await carregarAgenda();
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

  if (carregando) {
    return <main className="mx-auto max-w-3xl p-6 text-texto-secundario">A carregar agenda médica...</main>;
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
        <p className="text-sm text-texto">
          Área do médico
        </p>

        <h1 className="mt-1 text-3xl font-bold text-texto">
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
          {disponibilidadeEmEdicao
            ? "Editar horário"
            : "Adicionar horário"}
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
              min={dataLocalISO()}
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
              className="w-full rounded-lg bg-primaria px-5 py-3 font-semibold text-white hover:bg-primaria-hover"
            >
              {disponibilidadeEmEdicao
                ? "Guardar alterações"
                : "Registar disponibilidade"}
            </button>
          </div>
          {disponibilidadeEmEdicao && (
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={cancelarEdicao}
                className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar edição
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">
            A minha agenda de disponibilidades
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDataReferencia(dataLocalISO())}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-white"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => alterarPeriodo(-1)}
              aria-label="Período anterior"
              className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-white"
            >
              ←
            </button>
            <span className="min-w-44 text-center text-sm font-medium capitalize text-gray-700">
              {visualizacao === "mes"
                ? new Date(`${dataReferencia.slice(0, 7)}-01T12:00:00`)
                    .toLocaleDateString("pt-PT", {
                      month: "long",
                      year: "numeric",
                    })
                : (() => {
                    const inicio = inicioDaSemana(dataReferencia);
                    const fim = new Date(inicio);
                    fim.setDate(fim.getDate() + 6);
                    return `${inicio.toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                    })} – ${fim.toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}`;
                  })()}
            </span>
            <button
              type="button"
              onClick={() => alterarPeriodo(1)}
              aria-label="Período seguinte"
              className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-white"
            >
              →
            </button>
            <select
              aria-label="Visualização da agenda"
              value={visualizacao}
              onChange={(event) => setVisualizacao(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option value="semana">Semana</option>
              <option value="mes">Mês</option>
            </select>
          </div>
        </div>

        {disponibilidadesVisiveis.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
            Não existem disponibilidades neste período.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {disponibilidadesVisiveis.map((item) => (
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(item)}
                      className="rounded-lg border border-primaria px-4 py-2 text-sm text-primaria hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(item.id)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
