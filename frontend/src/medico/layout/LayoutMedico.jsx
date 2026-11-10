import { Outlet } from "react-router-dom"
import NavbarMedico from "../../components/medico/NavbarMedico"
import Footer from "../../components/Footer"

export default function LayoutMedico() {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <NavbarMedico />
      <div className="flex min-h-screen flex-col">
        <div className="flex-1"><Outlet /></div>
        <Footer />
      </div>
    </div>
  )
}
