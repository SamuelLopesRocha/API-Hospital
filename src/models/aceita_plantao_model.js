import mongoose from 'mongoose';
import { Plantao } from '../models/plantao_model.js';
import { Medico } from '../models/medico_model.js';

// contador sequencial simples
let contadorAceita = 1;

const aceitaPlantaoSchema = new mongoose.Schema({
  aceita_id: {
    type: Number,
    unique: true,
    default: () => contadorAceita++,
  },

  // 🔹 CRM obrigatório (vindo da entidade Medico)
  CRM: {
    type: String,
    required: [true, 'O campo RM é obrigatório.'],
    validate: {
      validator: async function (valor) {
        const existe = await Medico.findOne({ CRM: valor });
        return !!existe;
      },
      message: 'O RM informado não pertence a nenhum médico registrado.',
    },
  },

  // 🔹 ID do plantão obrigatório e validado
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

  // 🔹 dados herdados do plantão
  dia: { type: String },
  horario_inicio: { type: String },
  horario_final: { type: String },
  hospital_id: { type: String },

  status: {
    type: String,
    enum: ['PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO'],
    default: 'PENDENTE',
  },

  motivo_rejeicao: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
  versionKey: false,
});

// garante incremento estável
aceitaPlantaoSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await mongoose.model('Aceita').findOne().sort({ aceita_id: -1 });
    this.aceita_id = ultimo ? ultimo.aceita_id + 1 : 1;
  }
  next();
});

export const Aceita = mongoose.model('Aceita', aceitaPlantaoSchema);
