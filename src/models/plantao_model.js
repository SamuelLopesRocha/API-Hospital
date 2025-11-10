import mongoose from 'mongoose';

const plantaoSchema = new mongoose.Schema({
  plantao_id: {
    type: Number,
    unique: true,
    index: true,
  },

  hospital_id: {
    type: String,
    ref: 'Hospital',
    required: true,
    trim: true,
  },

  gestor_id: {
    type: String,
    ref: 'Usuario',
    required: true,
    trim: true,
  },

  titulo: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  },

  descricao: {
    type: String,
    trim: true,
    maxlength: 1000,
  },

  // 🗓️ NOVOS CAMPOS
  dia: {
    type: String,
    required: [true, 'O campo dia é obrigatório.'],
    trim: true,
    validate: {
      validator: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
      message: 'O campo dia deve estar no formato dd/mm/aaaa.',
    },
  },

  horario_inicio: {
    type: String,
    required: [true, 'O campo horario_inicio é obrigatório.'],
    trim: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      message: 'O campo horario_inicio deve estar no formato HH:MM (24h).',
    },
  },

  horario_final: {
    type: String,
    required: [true, 'O campo horario_final é obrigatório.'],
    trim: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      message: 'O campo horario_final deve estar no formato HH:MM (24h).',
    },
  },

  cargo_requerido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  tipo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },

  valor: {
    type: mongoose.Types.Decimal128,
    default: 0.0,
  },

  status: {
    type: String,
    enum: ['DISPONIVEL', 'RESERVADO', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'],
    default: 'DISPONIVEL',
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Índices úteis
plantaoSchema.index({ hospital_id: 1 });
plantaoSchema.index({ gestor_id: 1 });
plantaoSchema.index({ status: 1 });

export const Plantao = mongoose.model('Plantao', plantaoSchema);
