import mongoose from 'mongoose';

// contador para IDs automáticos
let contadorMedico = 1;

const medicoSchema = new mongoose.Schema({
  medico_id: {
    type: Number,
    unique: true,
    default: () => contadorMedico++
  },

  CRM: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },

  // 👇 novo campo solicitado
  nome: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },

  senha: {
    type: String,
    required: true
  },

  especialidade: {
    type: String,
    required: true,
    trim: true
  },

  ativo: {
    type: Boolean,
    default: true
  },

  papel: {
    type: String,
    default: 'MEDICO',
    immutable: true
  }

}, {
  timestamps: true,
  versionKey: false
});

// Garante IDs sequenciais
medicoSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await Medico.findOne().sort({ medico_id: -1 });
    this.medico_id = ultimo ? ultimo.medico_id + 1 : 1;
  }
  next();
});

export const Medico = mongoose.model('Medico', medicoSchema);
