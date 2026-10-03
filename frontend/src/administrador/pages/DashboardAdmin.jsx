
import { Link } from "react-router-dom";

import { obterMedicos } from "../../data/medicos";
import { obterUsuarios } from "../../data/usuarios";

function DashboardAdmin() {
  const medicos = obterMedicos();
  const usuarios = obterUsuarios();

  const totalMedicos = medicos.length;

  const medicosComConta = medicos.filter(
    (medico) => medico.usuarioId != null
  ).length;

  const medicosSemConta = medicos.filter(
    (medico) => medico.usuarioId == null
  ).length;

  const totalPacientes = usuarios.filter(
    (usuario) =>
      String(usuario.role || usuario.tipo || "")
        .toLowerCase() === "paciente"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <p className="text-sm text-gray-500">
            Administração da clínica
          </p>

          <h1 className="text-3xl font-bold text-texto mt-2">
            Painel administrativo
          </h1>

          <p className="text-gray-600 mt-2">
            Consulte os perfis médicos e o estado das contas.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">
              Perfis médicos
            </p>
            <p className="text-3xl font-bold mt-2">
              {totalMedicos}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">
              Com conta associada
            </p>
            <p className="text-3xl font-bold mt-2">
              {medicosComConta}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">
              Sem conta associada
            </p>
            <p className="text-3xl font-bold mt-2">
              {medicosSemConta}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">
              Contas de pacientes
            </p>
            <p className="text-3xl font-bold mt-2">
              {totalPacientes}
            </p>
          </div>
        </section>

        <section className="mt-8 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">
              Perfis médicos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">Especialidade</th>
                  <th className="px-5 py-3">Conta</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>

              <tbody>
                {medicos.map((medico) => (
                  <tr
                    key={medico.id}
                    className="border-t"
                  >
                    <td className="px-5 py-4 font-medium">
                      {medico.nome}
                    </td>

                    <td className="px-5 py-4">
                      {medico.especialidade}
                    </td>

                    <td className="px-5 py-4">
                      {medico.usuarioId != null
                        ? "Associada"
                        : "Sem conta"}
                    </td>

                    <td className="px-5 py-4">
                      {medico.ativo === false
                        ? "Inactivo"
                        : "Activo"}
                    </td>
                  </tr>
                ))}

                <Link
                  to="/admin/contas-medicas"
                  className="inline-flex rounded-lg bg-primaria text-white px-5 py-3 m-4"
                >
                  Gerir contas médicas
                </Link>

                {medicos.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      Não existem perfis médicos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6">
          <Link
            to="/medicos"
            className="inline-flex rounded-lg border px-5 py-3 hover:bg-white"
          >
            Ver página pública de médicos
          </Link>
        </div>
      </div>
    </main>
  );
}

export default DashboardAdmin;
