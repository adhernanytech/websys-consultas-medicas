const { z } = require("zod");

const idParam = z.object({ id: z.string().regex(/^[1-9]\d*$/, "ID inválido.") });

const especialidadeSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  descricao: z.string().trim().max(5000).optional().nullable(),
  ativo: z.boolean().optional(),
});

const disponibilidadeSchema = z.object({
  medico_id: z.string().regex(/^[1-9]\d*$/),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD."),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Use o formato HH:mm."),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, "Use o formato HH:mm."),
});

const consultaSchema = z.object({
  disponibilidade_id: z.string().regex(/^[1-9]\d*$/),
  motivo: z.string().trim().max(2000).optional().nullable(),
});

const reagendarConsultaSchema = z.object({
  disponibilidade_id: z.string().regex(/^[1-9]\d*$/),
  motivo: z.string().trim().max(2000).optional().nullable(),
});

const estadoConsultaSchema = z.object({
  estado: z.enum([
    "pendente",
    "confirmada",
    "rejeitada",
    "cancelada",
    "concluida",
  ]),
});

const pacienteSchema = z.object({
  nome: z.string().trim().min(2).max(150).optional(),
  telefone: z.string().trim().max(30).nullable().optional(),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  sexo: z.string().trim().max(20).nullable().optional(),
  endereco: z.string().trim().max(255).nullable().optional(),
  numero_documento: z.string().trim().max(80).nullable().optional(),
});

const medicoPerfilSchema = z.object({
  especialidade_id: z.string().regex(/^[1-9]\d*$/).optional(),
  sexo: z.string().trim().max(20).nullable().optional(),
  biografia: z.string().trim().max(5000).nullable().optional(),
  experiencia: z.string().trim().max(5000).nullable().optional(),
  telefone: z.string().trim().max(30).nullable().optional(),
  numero_ordem: z.string().trim().max(100).nullable().optional(),
  fotografia_url: z.string().trim().max(700000).nullable().optional(),
  valor_consulta: z.union([z.string(), z.number()]).optional(),
  duracao_consulta: z.union([z.string(), z.number()]).optional(),
});

const registoClinicoSchema = z.object({
  queixa_principal: z.string().trim().max(2000).nullable().optional(),
  observacoes: z.string().trim().max(5000).nullable().optional(),
  diagnostico: z.string().trim().max(2000).nullable().optional(),
  tratamento: z.string().trim().max(2000).nullable().optional(),
  prescricao: z.string().trim().max(2000).nullable().optional(),
  notas: z.string().trim().max(2000).nullable().optional(),
  recomendacoes: z.string().trim().max(2000).nullable().optional(),
});

module.exports = {
  idParam,
  especialidadeSchema,
  disponibilidadeSchema,
  consultaSchema,
  reagendarConsultaSchema,
  estadoConsultaSchema,
  pacienteSchema,
  medicoPerfilSchema,
  registoClinicoSchema,
};
