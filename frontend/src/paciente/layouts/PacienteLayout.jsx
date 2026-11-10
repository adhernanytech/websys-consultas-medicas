import { Outlet } from "react-router-dom"
import NavbarPaciente from "../../components/paciente/NavbarPaciente"
import Footer from "../../components/Footer"

export default function PacienteLayout() {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <NavbarPaciente />
      <div className="flex min-h-screen flex-col">
        <div className="flex-1"><Outlet /></div>
        <Footer />
      </div>
    </div>
  )
}
