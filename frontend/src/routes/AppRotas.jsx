import { BrowserRouter, Routes, Route } from "react-router-dom"

/* Layouts */
import LayoutPublico from "../layouts/LayoutPublico"
import LayoutPaciente from "../paciente/layouts/PacienteLayout"
import LayoutMedico from "../medico/layout/LayoutMedico";
import AdminLayout from "../administrador/layouts/LayoutAdmin"

/* ROLAGEM */
import ScrollToTop from "../components/ScrollPraCima"

/* Proteção rotas */
import RotaPacienteProtegida from "../components/paciente/RotaPacienteProtegida"
import RotaMedicoProtegida from "../components/medico/RotaMedicoProtegida"
import RotaAdminProtegida from "../components/admin/RotaAdminProtegida"

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
import HistoricoClinicoPaciente from "../paciente/pages/HistoricoClinicoPaciente"

/* Páginas do médico */
import DashboardMedico from "../medico/pages/DashboardMedico"
import GerirDisponibilidade from "../medico/pages/GerirDisponibilidade"
import PerfilMedicoPendente from "../medico/pages/PerfilMedicoPendente"
import MinhaAgendaMedico from "../medico/pages/MinhaAgendaMedico"
import MyPerfilMedico from "../medico/pages/MyPerfilMedico"
import DetalhesConsultaMedico from "../medico/pages/DetalhesConsultaMedico"
import PerfilMedicoPaciente from "../medico/pages/PerfilPacienteMedico"
import RegistroClinicoConsulta from "../medico/pages/RegistroClinicoConsulta"
import PacientesMedico from "../medico/pages/PacientesMedico"
import AlterarSenhaInicial from "../medico/pages/AlterarSenhaInicial";

/* Redefinir senha */
import EsqueciSenha from '../pages/EsqueciSenha';
import RedefinirSenha from '../pages/RedefinirSenha';


/* Páginas do admin */
import DashboardAdmin from "../administrador/pages/DashboardAdmin"
import ConfigurarAdmin from "../administrador/pages/ConfigurarAdmin"
import GerirContasMedicas from "../administrador/pages/GerirContasMedicas"
import GerirUtilizadores from "../administrador/pages/GerirUtilizadores"
import GerirEspecialidades from "../administrador/pages/GerirEspecialidades"
import CriarMedico from "../administrador/pages/CriarMedico.jsx"



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
            path="/esqueci-senha" 
            element={<EsqueciSenha />} 
          />

          <Route 
            path="/redefinir-senha" 
            element={<RedefinirSenha />} 
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

        <Route element={<RotaPacienteProtegida />}>

          <Route element={<LayoutPaciente />}>

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

            <Route
              path="/paciente/historico-clinico"
              element={<HistoricoClinicoPaciente />}
            />

          </Route>

        </Route>


        {/* ÁREA DO MÉDICO */}
        <Route element={<RotaMedicoProtegida />}>
          <Route element={<LayoutMedico />}>

            <Route
              path="/medico/dashboard"
              element={<DashboardMedico />}
            />

            <Route
              path="/medico/agenda"
              element={<MinhaAgendaMedico />}
            />
            <Route
              path="/medico/agenda/:id"
              element={<DetalhesConsultaMedico />}
            />
            <Route
              path="/medico/agenda/:id/registo-clinico"
              element={<RegistroClinicoConsulta />}
            />
            <Route
              path="/medico/pacientes"
              element={<PacientesMedico />}
            />
            <Route
              path="/medico/pacientes/:pacienteId"
              element={<PerfilMedicoPaciente />}
            />

            <Route
              path="/medico/disponibilidades"
              element={<GerirDisponibilidade />}
            />

            <Route
              path="/medico/meu-perfil"
              element={<MyPerfilMedico />}
            />

            <Route
              path="/medico/alterar-senha-inicial"
              element={<AlterarSenhaInicial />}
            />

            {/* Conta médica ainda sem perfil associado */}

            <Route
              path="/medico/perfil-pendente"
              element={<PerfilMedicoPendente />}
            />

          </Route>
        </Route>



        {/* CONFIGURAÇÃO INICIAL DO ADMIN */}

        <Route
          path="/admin/configurar"
          element={<ConfigurarAdmin />}
        />


        {/* ÁREA ADMINISTRATIVA PROTEGIDA */}

        <Route element={<RotaAdminProtegida />}>

          <Route element={<AdminLayout />}>

            <Route
              path="/admin/dashboard"
              element={<DashboardAdmin />}
            />

            <Route
              path="/admin/contas-medicas"
              element={<GerirContasMedicas />}
            />

            <Route
              path="/admin/utilizadores"
              element={<GerirUtilizadores />}
            />

            <Route
              path="/admin/especialidades"
              element={<GerirEspecialidades />}
            />

            <Route
              path="/admin/medicos/criar"
              element={<CriarMedico />}
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default AppRotas