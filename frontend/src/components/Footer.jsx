
import { Link } from "react-router-dom"
import AppIcon from "./ui/AppIcon"

function Footer() {
  return (
    <footer className="border-t border-borda bg-fundo-secundario text-texto">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-10 lg:py-12">

        {/* Identidade do Centro */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria text-white">
              <AppIcon name="clinic" size={23} />
            </span>

            <span>
              <strong className="block text-lg font-bold text-primaria">
                Wenji Maka
              </strong>
              <span className="text-xs uppercase tracking-widest text-texto-secundario">
                Centro Médico
              </span>
            </span>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-6 text-texto-secundario">
            Uma plataforma para consultar profissionais de saúde,
            explorar especialidades e acompanhar as suas marcações médicas.
          </p>
        </div>

        {/* Navegação pública */}
        <div>
          <h2 className="text-base font-bold text-texto">
            Explorar
          </h2>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                className="text-texto-secundario transition-colors hover:text-primaria"
                to="/medicos"
              >
                Médicos
              </Link>
            </li>

            <li>
              <Link
                className="text-texto-secundario transition-colors hover:text-primaria"
                to="/especialidades"
              >
                Especialidades
              </Link>
            </li>

            <li>
              <Link
                className="text-texto-secundario transition-colors hover:text-primaria"
                to="/sobre"
              >
                Sobre nós
              </Link>
            </li>
          </ul>
        </div>

        {/* Conta do paciente */}
        <div>
          <h2 className="text-base font-bold text-texto">
            A sua conta
          </h2>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                className="text-texto-secundario transition-colors hover:text-primaria"
                to="/login"
              >
                Iniciar sessão
              </Link>
            </li>

            <li>
              <Link
                className="text-texto-secundario transition-colors hover:text-primaria"
                to="/registro"
              >
                Criar conta de paciente
              </Link>
            </li>

            <li>
              <Link
                className="text-texto-secundario transition-colors hover:text-primaria"
                to="/esqueci-senha"
              >
                Recuperar palavra-passe
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Direitos reservados */}
      <div className="border-t border-borda bg-fundo">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-texto-secundario sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} Centro Médico Wenji Maka.
            Todos os direitos reservados.
          </p>

          <p>
            Plataforma de marcação de consultas médicas.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
