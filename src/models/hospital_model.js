import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  hospital_id: {
    type: Number,
    unique: true,
    default: 1
  },

  nome: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },

  cnpj: {
    type: String,
    required: true,
    trim: true,
    minlength: 14,
    maxlength: 18
  },

  endereco: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 300
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido. Use um formato válido.'],
    unique: true
  },

  subdominio_url: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  versionKey: false
});

// 🔢 Gera hospital_id sequencial automaticamente
hospitalSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await Hospital.findOne().sort({ hospital_id: -1 });
    this.hospital_id = ultimo ? ultimo.hospital_id + 1 : 1;
  }
  next();
});

// Índices úteis para busca e desempenho
hospitalSchema.index({ nome: 1 });
hospitalSchema.index({ cnpj: 1 });
hospitalSchema.index({ email: 1 });

export const Hospital = mongoose.model('Hospital', hospitalSchema);
