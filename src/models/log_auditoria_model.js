import mongoose from 'mongoose';

const logAuditoriaSchema = new mongoose.Schema({
  log_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // 🔗 FK opcional para Usuario
  usuario_id: {
    type: String,
    ref: 'Usuario',
    default: null,
    trim: true
  },

  // 🔗 FK opcional para Hospital
  hospital_id: {
    type: String,
    ref: 'Hospital',
    default: null,
    trim: true
  },

  // 📦 Nome da entidade afetada (ex: 'Plantao', 'Usuario', etc)
  entidade: {
    type: String,
    required: true,
    trim: true
  },

  // 🔑 ID lógico do registro afetado (ex: usuario_id, plantao_id)
  entidade_id: {
    type: String,
    required: true,
    trim: true
  },

  // ⚙️ Tipo da ação executada
  acao: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'ACEITAR', 'CANCELAR', 'LOGIN', 'LOGOUT'],
    trim: true
  },

  // 🧩 Dados anteriores e posteriores (em JSON)
  dados_anteriores: {
    type: mongoose.Schema.Types.Mixed, // permite qualquer estrutura JSON
    default: null
  },

  dados_posteriores: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // 🌐 IP de onde a ação foi executada
  ip: {
    type: String,
    default: null,
    trim: true
  }

}, {
  timestamps: true, // adiciona createdAt e updatedAt
  versionKey: false // remove o campo __v
});

// Índices úteis
logAuditoriaSchema.index({ usuario_id: 1 });
logAuditoriaSchema.index({ hospital_id: 1 });
logAuditoriaSchema.index({ entidade: 1 });
logAuditoriaSchema.index({ acao: 1 });
logAuditoriaSchema.index({ createdAt: -1 });

// Exporta o modelo
export const LogAuditoria = mongoose.model('Log_Auditoria', logAuditoriaSchema);
