import mongoose from 'mongoose';

// Criador de IDs sequenciais simples
let contadorUsuario = 1;

const usuarioSchema = new mongoose.Schema({
  usuario_id: {
    type: Number,
    unique: true,
    default: () => contadorUsuario++, // gera IDs sequenciais
  },

  hospital_id: {
    type: String,
    ref: 'Hospital',
    trim: true,
    required: [true, 'hospital_id é obrigatório para todos os usuários']
  },

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
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido. Use um formato válido, como exemplo@dominio.com.']
  },

  senha_hash: {
    type: String,
    required: true
  },

  papel: {
    type: String,
    enum: ['GESTOR', 'ADMIN_SISTEMA'],
    required: true
  },

  telefone: {
    type: String,
    trim: true
  },

  ativo: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  versionKey: false
});

// Garante que usuario_id seja incremental mesmo após reiniciar o servidor
usuarioSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await Usuario.findOne().sort({ usuario_id: -1 });
    this.usuario_id = ultimo ? ultimo.usuario_id + 1 : 1;
  }
  next();
});

// Índices úteis
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ hospital_id: 1 });
usuarioSchema.index({ papel: 1 });

export const Usuario = mongoose.model('Usuario', usuarioSchema);
