// models/historico_gestor_model.js
import mongoose from 'mongoose';

let contadorHistorico = 1;

const historicoGestorSchema = new mongoose.Schema({
  historico_gestor_id: {
    type: Number,
    unique: true,
    default: () => contadorHistorico++,
  },

  // IDs e CRM sempre validados pelo controller
  plantao_id: {
    type: Number,
    required: [true, 'O campo plantao_id é obrigatório.'],
  },

  aceita_plantao_id: {
    type: Number,
    required: [true, 'O campo aceita_plantao_id é obrigatório.'],
  },

  CRM: {
    type: String,
    required: [true, 'O campo CRM é obrigatório.'],
  },

  dia: { type: String },
  horario_inicio: { type: String },
  horario_final: { type: String },

  status: {
    type: String,
    enum: ['DISPONIVEL', 'RESERVADO', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'],
    default: 'DISPONIVEL',
  },

  observacao: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
  versionKey: false,
});

// incremento sequencial
historicoGestorSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await mongoose.model('HistoricoGestor').findOne().sort({ historico_gestor_id: -1 });
    this.historico_gestor_id = ultimo ? ultimo.historico_gestor_id + 1 : 1;
  }
  next();
});

export const HistoricoGestor = mongoose.model('HistoricoGestor', historicoGestorSchema);
