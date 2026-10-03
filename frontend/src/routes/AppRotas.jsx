import { BrowserRouter, Routes, Route } from "react-router-dom"

/* Layouts */
import LayoutPublico from "../layouts/LayoutPublico"
import PacienteLayout from "../paciente/layouts/PacienteLayout"

/* ROLAGEM */
import ScrollToTop from "../components/ScrollPraCima"

/* Proteção rotas */
import RotaProtegida from "../components/RotaProtegida"
import RotaMedicoProtegida from "../components/medico/RotaMedicoProtegida"

/* Páginas públicas */
import Home from "../pages/Home"
import Medicos from "../pages/Medicos"
import Especialidades from "../pages/Especialidades"
import Login from "../pages/Login"
import Registro from "../pages/Registro"
import PerfilMedico from "../pages/PerfilMedico"
import SobreNos from "../pages/Sobre"

/* Páginas do paciente */
import MarcarConsulta from "../paciente/pages/MarcarConsulta"
import MinhasConsultas from "../paciente/pages/MinhasConsultasPaciente"
import DashboardPaciente from "../paciente/pages/DashboardPaciente"
import PerfilPaciente from "../paciente/pages/PerfilPaciente"
import DetalhesConsulta from "../paciente/pages/DetalhesConsulta"

/* Páginas do médico */
import DashboardMedico from "../medico/pages/DashboardMedico"
import GerirDisponibilidade from "../medico/pages/GerirDisponibilidade"
import PerfilMedicoPendente from "../medico/pages/PerfilMedicoPendente"


function AppRotas() {
  return (
    <BrowserRouter>
      {/*
        ROLAR PRA CIMA - sempre que eu mudar de rota 
    */}
      <ScrollToTop />

      <Routes>

        {/* 
            ÁREA PÚBLICA
        */}

        <Route element={<LayoutPublico />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/medicos"
            element={<Medicos />}
          />

          <Route
            path="/medicos/:id"
            element={<PerfilMedico />}
          />

          <Route
            path="/especialidades"
            element={<Especialidades />}
          />

          <Route
            path="/sobre"
            element={<SobreNos />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/registro"
            element={<Registro />}
          />

        </Route>


        {/*
            ÁREA DO PACIENTE - ASSIM FICA PROTEGIDA
        */}

        <Route element={<RotaProtegida />}>

          <Route element={<PacienteLayout />}>

            <Route
              path="/paciente/dashboard"
              element={<DashboardPaciente />}
            />

            <Route
              path="/paciente/medicos"
              element={<Medicos />}
            />

            <Route
              path="/paciente/medicos/:id"
              element={<PerfilMedico />}
            />

            <Route
              path="/paciente/marcar-consulta"
              element={<MarcarConsulta />}
            />

            <Route
              path="/paciente/marcar-consulta/:medicoId"
              element={<MarcarConsulta />}
            />

            <Route
              path="/paciente/minhas-consultas"
              element={<MinhasConsultas />}
            />

            <Route
              path="/paciente/minhas-consultas/:id"
              element={<DetalhesConsulta />}
            />

            <Route
              path="/paciente/perfil"
              element={<PerfilPaciente />}
            />

          </Route>

        </Route>

        {/* ÁREA DO MÉDICO */}

        <Route element={<RotaMedicoProtegida />}>
          <Route
            path="/medico/dashboard"
            element={<DashboardMedico />}
          />

          <Route
            path="/medico/disponibilidades"
            element={<GerirDisponibilidade />}
          />
        </Route>

        {/* Conta médica ainda sem perfil associado */}

        <Route
          path="/medico/perfil-pendente"
          element={<PerfilMedicoPendente />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRotas