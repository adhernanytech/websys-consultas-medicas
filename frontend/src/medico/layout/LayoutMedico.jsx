import { Outlet } from "react-router-dom"
import NavbarMedico from "../../components/medico/NavbarMedico"
import Footer from "../../components/Footer"

export default function LayoutMedico() {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <NavbarMedico />
      <main className="min-h-[calc(100vh-70px)]"><Outlet /></main>
      <Footer compacto />
    </div>
  )
}
