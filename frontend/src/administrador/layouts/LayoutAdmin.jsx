import { useState } from "react"
import { Outlet } from "react-router-dom"
import NavbarAdmin from "../../components/admin/NavbarAdmin"
import Footer from "../../components/Footer"
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <NavbarAdmin collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
    <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[84px]" : "lg:pl-[270px]"}`}>
      <main className="min-h-[calc(100vh-70px)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet /></main>
      <Footer />
    </div>
  </div>
}
