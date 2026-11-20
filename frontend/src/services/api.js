import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const ESTADOS_CONSULTA_UI = {
  pendente: "Agendada",
  confirmada: "Confirmada",
  rejeitada: "Cancelada",
  cancelada: "Cancelada",
  concluida: "Concluída",
};

function mapearDados(resposta, mapear) {
  if (Array.isArray(resposta.data?.dados)) {
    resposta.data.dados = resposta.data.dados.map(mapear);
  } else if (resposta.data?.dados) {
    resposta.data.dados = mapear(resposta.data.dados);
  }
  return resposta;
}

export function normalizarMedico(medico) {
  if (!medico) return medico;
  return {
    ...medico,
    id: String(medico.id),
    usuarioId: String(medico.usuario_id ?? medico.usuarioId ?? ""),
    nome: medico.usuario?.nome ?? medico.nome ?? "",
    email: medico.usuario?.email ?? medico.email ?? "",
    especialidadeId: String(medico.especialidade_id ?? medico.especialidadeId ?? ""),
    especialidade: medico.especialidade?.nome ?? medico.especialidade ?? "",
    biografia: medico.biografia ?? "",
    experiencia: medico.experiencia ?? "",
    telefone: medico.telefone ?? "",
    foto: medico.fotografia_url ?? medico.foto ?? "",
    fotografia_url: medico.fotografia_url ?? medico.foto ?? "",
    ativo: medico.usuario?.ativo ?? medico.ativo ?? true,
    contaAtiva: medico.usuario?.ativo ?? medico.contaAtiva ?? true,
  };
}

export function normalizarDisponibilidade(item) {
  if (!item) return item;
  const estado = String(item.estado || "").toLowerCase();
  return {
    ...item,
    id: String(item.id),
    medicoId: String(item.medico_id ?? item.medicoId ?? ""),
    horaInicio: item.hora_inicio ?? item.horaInicio ?? "",
    horaFim: item.hora_fim ?? item.horaFim ?? "",
    estado: estado === "disponivel" ? "Disponível" : estado === "reservada" ? "Reservada" : "Cancelada",
  };
}

export function normalizarConsulta(consulta) {
  if (!consulta) return consulta;
  const disponibilidade = consulta.disponibilidade ?? consulta.disponibilidades ?? {};
  const paciente = consulta.paciente ?? consulta.pacientes ?? {};
  const medico = consulta.medico ?? consulta.medicos ?? {};
  const utilizadorPaciente = paciente.usuario ?? paciente.usuarios ?? {};
  const utilizadorMedico = medico.usuario ?? medico.usuarios ?? {};
  return {
    ...consulta,
    id: String(consulta.id),
    pacienteProfileId: String(consulta.paciente_id ?? paciente.id ?? ""),
    pacienteId: String(utilizadorPaciente.id ?? consulta.pacienteId ?? ""),
    pacienteNome: utilizadorPaciente.nome ?? consulta.pacienteNome ?? "",
    pacienteEmail: utilizadorPaciente.email ?? consulta.pacienteEmail ?? "",
    pacienteTelefone: paciente.telefone ?? consulta.pacienteTelefone ?? "",
    medicoId: String(consulta.medico_id ?? medico.id ?? consulta.medicoId ?? ""),
    medicoNome: utilizadorMedico.nome ?? consulta.medicoNome ?? "",
    especialidade: medico.especialidade?.nome ?? consulta.especialidade ?? "",
    disponibilidadeId: String(consulta.disponibilidade_id ?? disponibilidade.id ?? consulta.disponibilidadeId ?? ""),
    data: typeof disponibilidade.data === "string"
      ? disponibilidade.data.slice(0, 10)
      : disponibilidade.data?.toISOString?.().slice(0, 10) ?? consulta.data ?? "",
    horario: disponibilidade.hora_inicio ?? consulta.horario ?? "",
    horaFim: disponibilidade.hora_fim ?? consulta.horaFim ?? "",
    estado: ESTADOS_CONSULTA_UI[String(consulta.estado || "").toLowerCase()] ?? consulta.estado,
    actualizadoEm: consulta.actualizado_em ?? consulta.actualizadoEm ?? "",
  };
}

export function normalizarRegistoClinico(registo) {
  if (!registo) return registo;
  return {
    ...registo,
    id: String(registo.id),
    consultaId: String(registo.consulta_id ?? registo.consultaId ?? ""),
    queixa: registo.queixa_principal ?? registo.queixa ?? "",
    observacoes: registo.observacoes ?? "",
    diagnostico: registo.diagnostico ?? "",
    tratamento: registo.tratamento ?? "",
    prescricao: registo.prescricao ?? "",
    notas: registo.notas ?? "",
    recomendacoes: registo.recomendacoes ?? "",
    criadoEm: registo.criado_em ?? registo.criadoEm ?? "",
    atualizadoEm: registo.actualizado_em ?? registo.atualizadoEm ?? "",
    consulta: registo.consulta ? normalizarConsulta(registo.consulta) : registo.consulta,
  };
}

export function normalizarNotificacao(item) {
  if (!item) return item;
  return {
    ...item,
    id: String(item.id),
    data: item.criado_em ?? item.data ?? "",
    link: item.consulta_id ? `/paciente/minhas-consultas/${item.consulta_id}` : "/paciente/notificacoes",
  };
}

// Injeta o token JWT em cada pedido automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta — extrai mensagem de erro legível
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error.response?.data?.erro ||
      error.response?.data?.message ||
      error.message ||
      "Erro de comunicação com o servidor.";

    const err = new Error(mensagem);
    err.status = error.response?.status;
    err.detalhes = error.response?.data?.detalhes;
    return Promise.reject(err);
  }
);

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authAPI = {
  registar: (dados) => api.post("/api/auth/registro", dados),
  login: (dados) => api.post("/api/auth/login", dados),
  obterSessao: () => api.get("/api/auth/me"),
  esqueciSenha: (email) => api.post("/api/auth/esqueci-senha", { email }),
  redefinirSenha: (dados) => api.post("/api/auth/redefinir-senha", dados),
  alterarSenhaInicial: (dados) => api.post("/api/auth/alterar-senha-inicial", dados),
};

// ─────────────────────────────────────────────
// ESPECIALIDADES
// ─────────────────────────────────────────────
export const especialidadesAPI = {
  listar: (params) => api.get("/api/especialidades", { params }).then((r) => mapearDados(r, (e) => ({ ...e, id: String(e.id) }))),
  obter: (id) => api.get(`/api/especialidades/${id}`).then((r) => mapearDados(r, (e) => ({ ...e, id: String(e.id) }))),
  criar: (dados) => api.post("/api/especialidades", dados),
  actualizar: (id, dados) => api.patch(`/api/especialidades/${id}`, dados),
};

// ─────────────────────────────────────────────
// MÉDICOS
// ─────────────────────────────────────────────
export const medicosAPI = {
  listar: (params) => api.get("/api/medicos", { params }).then((r) => mapearDados(r, normalizarMedico)),
  obter: (id) => api.get(`/api/medicos/${id}`).then((r) => mapearDados(r, normalizarMedico)),
  obterMeu: () => api.get("/api/medicos/me").then((r) => mapearDados(r, normalizarMedico)),
  actualizarMeu: (dados) => api.patch("/api/medicos/me", dados),
  criar: (dados) => api.post("/api/medicos", dados),
  alterarEstado: (id, ativo) => api.patch(`/api/medicos/${id}/estado`, { ativo }),
};

// ─────────────────────────────────────────────
// PACIENTES
// ─────────────────────────────────────────────
export const pacientesAPI = {
  obterMeu: () => api.get("/api/pacientes/me"),
  actualizarMeu: (dados) => api.patch("/api/pacientes/me", dados),
};

// ─────────────────────────────────────────────
// DISPONIBILIDADES
// ─────────────────────────────────────────────
export const disponibilidadesAPI = {
  listar: (params) => api.get("/api/disponibilidades", { params }).then((r) => mapearDados(r, normalizarDisponibilidade)),
  criar: (dados) => api.post("/api/disponibilidades", dados),
  cancelar: (id) => api.delete(`/api/disponibilidades/${id}`),
  alterarEstado: (id, estado) =>
    api.patch(`/api/disponibilidades/${id}/estado`, { estado }),
  actualizar: (id, dados) => api.patch(`/api/disponibilidades/${id}`, dados),
};

// ─────────────────────────────────────────────
// CONSULTAS
// ─────────────────────────────────────────────
export const consultasAPI = {
  listar: (params) => api.get("/api/consultas", { params }).then((r) => mapearDados(r, normalizarConsulta)),
  obter: (id) => api.get(`/api/consultas/${id}`).then((r) => mapearDados(r, normalizarConsulta)),
  marcar: (dados) => api.post("/api/consultas", dados),
  alterarEstado: (id, estado, extra) =>
    api.patch(`/api/consultas/${id}/estado`, { estado, ...extra }),
  actualizar: (id, dados) => api.patch(`/api/consultas/${id}`, dados),
  // Registos Clínicos
  obterRegistoClinico: (consultaId) =>
    api.get(`/api/registos-clinicos/consulta/${consultaId}`).then((r) => mapearDados(r, normalizarRegistoClinico)),
  criarRegistoClinico: (consultaId, dados) =>
    api.post(`/api/registos-clinicos/consulta/${consultaId}`, dados).then((r) => mapearDados(r, normalizarRegistoClinico)),
  actualizarRegistoClinico: (consultaId, dados) =>
    api.patch(`/api/registos-clinicos/consulta/${consultaId}`, dados).then((r) => mapearDados(r, normalizarRegistoClinico)),
};

export const registosClinicosAPI = {
  listar: (params) => api.get("/api/registos-clinicos", { params }).then((r) => mapearDados(r, normalizarRegistoClinico)),
  obterPorConsulta: (consultaId) => consultasAPI.obterRegistoClinico(consultaId),
  criar: (consultaId, dados) => consultasAPI.criarRegistoClinico(consultaId, dados),
  actualizar: (consultaId, dados) => consultasAPI.actualizarRegistoClinico(consultaId, dados),
};

// ─────────────────────────────────────────────
// NOTIFICAÇÕES
// ─────────────────────────────────────────────
export const notificacoesAPI = {
  listar: (params) => api.get("/api/notificacoes", { params }).then((r) => mapearDados(r, normalizarNotificacao)),
  marcarLida: (id) => api.patch(`/api/notificacoes/${id}/lida`),
  marcarTodasLidas: () => api.patch("/api/notificacoes/marcar-todas-lidas"),
};

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get("/api/admin/dashboard"),
  listarUtilizadores: (params) => api.get("/api/admin/utilizadores", { params }),
  alterarEstadoUtilizador: (id, ativo) => api.patch(`/api/admin/utilizadores/${id}/estado`, { ativo }),
  obterConfiguracoes: () => api.get("/api/admin/configuracoes"),
  guardarConfiguracoes: (configuracoes) => api.put("/api/admin/configuracoes", { configuracoes }),
  listarConsultas: (params) => consultasAPI.listar(params),
};

export const auditoriaAPI = {
  listar: () => api.get("/api/admin/actividade"),
  registar: (dados) => api.post("/api/auditoria", dados),
};

export default api;
