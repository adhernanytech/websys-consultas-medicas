
import {
  obterUsuarioAutenticado,
  usuarioIsMedico,
} from "./usuarios";

const medicosIniciais = [
  {
    id: 1,
    usuarioId: null,
    nome: "Dr. Fulano",
    especialidade: "Cardiologia",
    especialidadeId: 1,
    experiencia: "10 anos de experiência",
    biografia:
      "Atendimento e acompanhamento de doenças cardiovasculares.",
    ativo: true,
  },
  {
    id: 2,
    usuarioId: null,
    nome: "Dra. Maria",
    especialidade: "Pediatria",
    especialidadeId: 2,
    experiencia: "12 anos de experiência",
    biografia:
      "Acompanhamento da saúde e desenvolvimento infantil.",
    ativo: true,
  },
  {
    id: 3,
    usuarioId: null,
    nome: "Dr. Joseppi Camole",
    especialidade: "Dermatologia",
    especialidadeId: 3,
    experiencia: "7 anos de experiência",
    biografia:
      "Avaliação e acompanhamento da saúde da pele.",
    ativo: true,
  },
  {
    id: 4,
    usuarioId: null,
    nome: "Dra. Georgina",
    especialidade: "Oftalmologia",
    especialidadeId: 6,
    experiencia: "8 anos de experiência",
    biografia:
      "Consultas de avaliação da saúde visual.",
    ativo: true,
  },
  {
    id: 5,
    usuarioId: null,
    nome: "Dr. Bernetti",
    especialidade: "Cirurgia Geral",
    especialidadeId: 7,
    experiencia: "14 anos de experiência",
    biografia:
      "Avaliação clínica e orientação cirúrgica.",
    ativo: true,
  },
  {
    id: 6,
    usuarioId: null,
    nome: "Dra. Bernadete",
    especialidade: "Neurologia",
    especialidadeId: 5,
    experiencia: "14 anos de experiência",
    biografia:
      "Avaliação e acompanhamento de condições neurológicas.",
    ativo: true,
  },
  {
    id: 7,
    usuarioId: null,
    nome: "Dr. Franklin Hernández",
    especialidade: "Ortopedia",
    especialidadeId: 4,
    experiencia: "8 anos de experiência",
    biografia:
      "Avaliação e acompanhamento de condições ósseas.",
    ativo: true,
  },
];

const CHAVE_MEDICOS = "medicos";

export function obterMedicos() {
  try {
    const guardados = JSON.parse(
      localStorage.getItem(CHAVE_MEDICOS)
    );

    if (Array.isArray(guardados)) {
      return guardados;
    }
  } catch {
    // Se os dados estiverem inválidos,
    // recuperamos os perfis iniciais.
  }

  guardarMedicos(medicosIniciais);
  return medicosIniciais;
}

export function guardarMedicos(medicos) {
  if (!Array.isArray(medicos)) {
    throw new Error(
      "A lista de médicos deve ser um array."
    );
  }

  localStorage.setItem(
    CHAVE_MEDICOS,
    JSON.stringify(medicos)
  );
}

export function actualizarPerfilMedico(
  medicoId,
  usuarioId,
  { telefone, biografia, foto } = {}
) {
  if (medicoId == null || usuarioId == null) {
    throw new Error(
      "Não foi possível identificar o perfil médico autenticado."
    );
  }

  const medicos = obterMedicos();
  const indice = medicos.findIndex(
    (medico) =>
      String(medico.id) === String(medicoId) &&
      String(medico.usuarioId) === String(usuarioId)
  );

  if (indice === -1) {
    throw new Error(
      "O perfil médico não pertence à conta autenticada."
    );
  }

  const telefoneFinal = String(telefone || "").trim();
  const biografiaFinal = String(biografia || "").trim();

  if (telefoneFinal.length > 40) {
    throw new Error(
      "O telefone não pode ultrapassar 40 caracteres."
    );
  }

  if (biografiaFinal.length > 1200) {
    throw new Error(
      "A biografia não pode ultrapassar 1200 caracteres."
    );
  }

  if (foto !== undefined && foto !== "") {
    let fotoValida =
      typeof foto === "string" &&
      foto.startsWith("data:image/") &&
      foto.length <= 600000

    if (!fotoValida && typeof foto === "string" && foto.length <= 2000) {
      try {
        const url = new URL(foto)
        fotoValida =
          url.protocol === "https:" || url.protocol === "http:"
      } catch {
        fotoValida = false
      }
    }

    if (!fotoValida) {
      throw new Error("A fotografia seleccionada não é válida.")
    }
  }

  medicos[indice] = {
    ...medicos[indice],
    telefone: telefoneFinal,
    biografia: biografiaFinal,
    ...(foto !== undefined ? { foto: foto || null } : {}),
  };

  guardarMedicos(medicos);

  return medicos[indice];
}

export function obterMedicoPorId(id) {
  return obterMedicos().find(
    (medico) =>
      String(medico.id) === String(id)
  ) || null;
}

export function obterMedicoDaConta(usuarioId) {
  if (usuarioId == null) return null;

  return obterMedicos().find(
    (medico) =>
      medico.usuarioId != null &&
      String(medico.usuarioId) ===
        String(usuarioId)
  ) || null;
}

export function obterMedicoAutenticado() {
  const usuario = obterUsuarioAutenticado();

  if (!usuario || !usuarioIsMedico(usuario)) {
    return null;
  }

  return obterMedicoDaConta(usuario.id);
}

export function obterMedicosSemConta() {
  return obterMedicos().filter(
    (medico) => medico.usuarioId == null
  );
}

export function associarContaAMedico(
  medicoId,
  usuarioId
) {
  if (usuarioId == null) {
    throw new Error(
      "É necessário indicar uma conta de utilizador."
    );
  }

  const medicos = obterMedicos();

  const indiceMedico = medicos.findIndex(
    (medico) =>
      String(medico.id) === String(medicoId)
  );

  if (indiceMedico === -1) {
    throw new Error(
      "Perfil médico não encontrado."
    );
  }

  const medico = medicos[indiceMedico];

  const perfilDaConta = medicos.find(
    (item) =>
      item.usuarioId != null &&
      String(item.usuarioId) ===
        String(usuarioId)
  );

  if (
    perfilDaConta &&
    String(perfilDaConta.id) !== String(medicoId)
  ) {
    throw new Error(
      "Esta conta já está associada a outro perfil médico."
    );
  }

  if (
    medico.usuarioId != null &&
    String(medico.usuarioId) !== String(usuarioId)
  ) {
    throw new Error(
      "Este perfil médico já tem uma conta associada."
    );
  }

  medicos[indiceMedico] = {
    ...medico,
    usuarioId,
  };

  guardarMedicos(medicos);

  return medicos[indiceMedico];
}

export default medicosIniciais;
