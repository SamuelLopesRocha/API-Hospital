import mongoose from 'mongoose';
import { Aceita } from '../models/aceita_plantao_model.js';
import { Medico } from '../models/medico_model.js';
import { Plantao } from '../models/plantao_model.js';

// contador sequencial simples
let contadorHistoricoMedico = 1;

const historicoMedicoSchema = new mongoose.Schema({
  historico_medico_id: {
    type: Number,
    unique: true,
    default: () => contadorHistoricoMedico++,
  },

  hospital_id: {
    type: String,
    required: [true, 'O campo hospital_id é obrigatório.'],
  },

  aceita_plantao_id: {
    type: Number,
    required: [true, 'O campo aceita_plantao_id é obrigatório.'],
    validate: {
      validator: async function (valor) {
        const existe = await Aceita.findOne({ aceita_id: valor });
        return !!existe;
      },
      message: 'O aceite de plantão informado não existe.',
    },
  },

  // ✅ NOVO CAMPO ADICIONADO
  plantao_id: {
    type: Number,
    required: [true, 'O campo plantao_id é obrigatório.'],
    validate: {
      validator: async function (valor) {
        const existe = await Plantao.findOne({ plantao_id: valor });
        return !!existe;
      },
      message: 'O plantão informado não existe.',
    },
  },

  CRM: {
    type: String,
    required: [true, 'O campo CRM é obrigatório.'],
    validate: {
      validator: async function (valor) {
        const existe = await Medico.findOne({ CRM: valor });
        return !!existe;
      },
      message: 'O CRM informado não pertence a nenhum médico registrado.',
    },
  },

  dia: { type: String, required: true },
  horario_inicio: { type: String, required: true },
  horario_final: { type: String, required: true },

  status: {
    type: String,
    enum: ['ACEITO', 'REALIZADO', 'CANCELADO', 'FALTOU'],
    default: 'ACEITO',
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

// garante incremento estável
historicoMedicoSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await mongoose.model('HistoricoMedico').findOne().sort({ historico_medico_id: -1 });
    this.historico_medico_id = ultimo ? ultimo.historico_medico_id + 1 : 1;
  }
  next();
});

export const HistoricoMedico = mongoose.model('HistoricoMedico', historicoMedicoSchema);
