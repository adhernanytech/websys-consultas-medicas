import { Outlet } from "react-router-dom";

import NavbarMedico from "../../components/medico/NavbarMedico";
import Footer from "../../components/Footer";

function MedicoLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <NavbarMedico />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

export default MedicoLayout;
