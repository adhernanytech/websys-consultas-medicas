import { Outlet } from "react-router-dom"
import NavbarPaciente from "../../components/paciente/NavbarPaciente"
import Footer from "../../components/Footer"

export default function PacienteLayout() {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <NavbarPaciente />
      <main className="min-h-[calc(100vh-70px)]"><Outlet /></main>
      <Footer compacto />
    </div>
  )
}
