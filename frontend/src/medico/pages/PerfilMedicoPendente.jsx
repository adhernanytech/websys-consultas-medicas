
import { Link } from "react-router-dom";

export default function PerfilMedicoPendente() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-2xl font-bold text-texto">
          Perfil médico por associar
        </h1>

        <p className="mt-3 text-texto-secundario">
          A tua conta está autenticada, mas ainda não está ligada
          a um perfil médico da clínica.
        </p>

        <p className="mt-2 text-texto-secundario">
          Solicita ao administrador que associe a tua conta ao
          perfil médico correcto. Até essa associação ser feita,
          não poderás gerir disponibilidades nem consultar a agenda.
        </p>

        <Link
          to="/login"
          className="mt-5 inline-flex rounded-lg bg-primaria-hover px-4 py-2 text-white"
        >
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
