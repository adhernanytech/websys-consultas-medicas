import { Outlet } from "react-router-dom"

import NavbarAdmin from "../../components/admin/NavbarAdmin"
import Footer from "../../components/Footer"

function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <NavbarAdmin />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}

export default AdminLayout