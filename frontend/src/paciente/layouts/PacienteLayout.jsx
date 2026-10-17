import { Outlet } from "react-router-dom"

import NavbarPaciente from "../../components/paciente/NavbarPaciente"

import Footer from "../../components/Footer"

function PacienteLayout() {
  return (
    <div className="min-h-screen flex flex-col">

      <NavbarPaciente />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />

    </div>
  )
}

export default PacienteLayout