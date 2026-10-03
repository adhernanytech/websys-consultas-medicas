
import { useEffect, useState } from "react";

import {
  listarEstadoContasMedicas,
  criarContaMedica,
  associarContaMedicaExistente,
} from "../../data/administracao";

import { obterUsuarios } from "../../data/usuarios";

function GerirContasMedicas() {
  const [medicos, setMedicos] = useState([]);
  const [contasMedicas, setContasMedicas] = useState([]);
  const [medicoId, setMedicoId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [modo, setModo] = useState("criar");

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function carregarDados() {
    try {
      setMedicos(listarEstadoContasMedicas());

      setContasMedicas(
        obterUsuarios().filter(
          (usuario) =>
            ["medico", "médico"].includes(
              String(usuario.role || usuario.tipo || "")
                .trim()
                .toLowerCase()
            ) && usuario.ativo !== false
        )
      );
    } catch (erro) {
      setErro(erro.message);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const perfisDisponiveis = medicos.filter(
    (medico) => !medico.temConta
  );

  const contasDisponiveis = contasMedicas.filter(
    (conta) =>
      !medicos.some(
        (medico) =>
          String(medico.usuarioId) === String(conta.id)
      )
  );

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function limparMensagens() {
    setMensagem("");
    setErro("");
  }

  function submeter(evento) {
    evento.preventDefault();
    limparMensagens();

    if (!medicoId) {
      setErro("Seleccione um perfil médico.");
      return;
    }

    setCarregando(true);

    try {
      if (modo === "criar") {
        if (formulario.senha !== formulario.confirmarSenha) {
          throw new Error("As palavras-passe não coincidem.");
        }

        criarContaMedica({
          medicoId,
          nome: formulario.nome,
          email: formulario.email,
          senha: formulario.senha,
        });

        setMensagem("Conta médica criada e associada com sucesso.");

        setFormulario({
          nome: "",
          email: "",
          senha: "",
          confirmarSenha: "",
        });
      } else {
        if (!usuarioId) {
          throw new Error("Seleccione uma conta médica.");
        }

        associarContaMedicaExistente(usuarioId, medicoId);

        setMensagem("Conta médica associada com sucesso.");
        setUsuarioId("");
      }

      setMedicoId("");
      carregarDados();
    } catch (erro) {
      setErro(
        erro.message || "Não foi possível concluir a operação."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header>
          <p className="text-sm text-gray-500">
            Administração
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Gestão de contas médicas
          </h1>

          <p className="text-gray-600 mt-2">
            Crie contas de acesso ou associe contas existentes
            aos perfis médicos da clínica.
          </p>
        </header>

        <section className="bg-white border rounded-xl p-5 sm:p-6 mt-7">
          <h2 className="text-xl font-semibold">
            Associar perfil e conta
          </h2>

          <div className="mt-5">
            <label className="block text-sm font-medium mb-2">
              Operação
            </label>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="modo"
                  value="criar"
                  checked={modo === "criar"}
                  onChange={() => setModo("criar")}
                />
                Criar uma conta nova
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="modo"
                  value="associar"
                  checked={modo === "associar"}
                  onChange={() => setModo("associar")}
                />
                Associar conta existente
              </label>
            </div>
          </div>

          {erro && (
            <div role="alert" className="mt-5 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
              {erro}
            </div>
          )}

          {mensagem && (
            <div role="status" className="mt-5 rounded-lg bg-green-50 text-green-700 p-3 text-sm">
              {mensagem}
            </div>
          )}

          <form onSubmit={submeter} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Perfil médico
              </label>

              <select
                value={medicoId}
                onChange={(evento) => setMedicoId(evento.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 bg-white"
              >
                <option value="">Seleccione um perfil</option>

                {perfisDisponiveis.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nome} — {medico.especialidade}
                  </option>
                ))}
              </select>

              {perfisDisponiveis.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Todos os perfis médicos já têm conta associada.
                </p>
              )}
            </div>

            {modo === "criar" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome da conta
                  </label>
                  <input
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarCampo}
                    minLength={3}
                    required
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email de acesso
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={alterarCampo}
                    required
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Palavra-passe temporária
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={formulario.senha}
                    onChange={alterarCampo}
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirmar palavra-passe
                  </label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={formulario.confirmarSenha}
                    onChange={alterarCampo}
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Conta médica existente
                </label>

                <select
                  value={usuarioId}
                  onChange={(evento) => setUsuarioId(evento.target.value)}
                  required
                  className="w-full border rounded-lg px-4 py-3 bg-white"
                >
                  <option value="">Seleccione uma conta</option>

                  {contasDisponiveis.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome} — {conta.email}
                    </option>
                  ))}
                </select>

                {contasDisponiveis.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Não existem contas médicas disponíveis para associação.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={
                carregando ||
                perfisDisponiveis.length === 0 ||
                (modo === "associar" && contasDisponiveis.length === 0)
              }
              className="rounded-lg bg-primaria text-white px-6 py-3 disabled:opacity-50"
            >
              {carregando
                ? "A processar..."
                : modo === "criar"
                  ? "Criar e associar conta"
                  : "Associar conta existente"}
            </button>
          </form>
        </section>

        <section className="mt-8 bg-white border rounded-xl overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">
              Estado dos perfis médicos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">Médico</th>
                  <th className="p-4">Especialidade</th>
                  <th className="p-4">Email da conta</th>
                  <th className="p-4">Associação</th>
                </tr>
              </thead>

              <tbody>
                {medicos.map((medico) => (
                  <tr key={medico.id} className="border-t">
                    <td className="p-4 font-medium">
                      {medico.nome}
                    </td>

                    <td className="p-4">
                      {medico.especialidade}
                    </td>

                    <td className="p-4">
                      {medico.contaEmail || "—"}
                    </td>

                    <td className="p-4">
                      {medico.temConta
                        ? "Conta associada"
                        : "Sem conta"}
                    </td>
                  </tr>
                ))}

                {medicos.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      Não existem perfis médicos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default GerirContasMedicas;
