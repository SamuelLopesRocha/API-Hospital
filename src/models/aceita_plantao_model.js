import mongoose from 'mongoose';

// contador local para gerar IDs sequenciais
let contadorAceite = 1;

const aceitaPlantaoSchema = new mongoose.Schema({
  aceite_id: {
    type: Number,
    unique: true,
    default: () => contadorAceite++, // gera IDs automáticos
  },
  plantao_id: {
    type: String,
    ref: 'Plantao',
    required: [true, 'O campo plantao_id é obrigatório.'],
    trim: true,
  },
  medico_id: {
    type: String,
    ref: 'Usuario', // Médico vem da coleção de usuários
    required: [true, 'O campo medico_id é obrigatório.'],
    trim: true,
  },
  dia: {
    type: String,
    trim: true, // ❌ não é mais obrigatório
    default: null,
  },
  horario_inicio: {
    type: String,
    trim: true, // ❌ não é mais obrigatório
    default: null,
  },
  horario_final: {
    type: String,
    trim: true, // ❌ não é mais obrigatório
    default: null,
  },
  status: {
    type: String,
    enum: ['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO'],
    default: 'PENDENTE',
  },
  motivo_rejeicao: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// garante IDs incrementais mesmo após reiniciar o servidor
aceitaPlantaoSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimo = await AceitaPlantao.findOne().sort({ aceite_id: -1 });
    this.aceite_id = ultimo ? ultimo.aceite_id + 1 : 1;
  }
  next();
});

// índices úteis
aceitaPlantaoSchema.index({ plantao_id: 1 });
aceitaPlantaoSchema.index({ medico_id: 1 });
aceitaPlantaoSchema.index({ status: 1 });

const AceitaPlantao = mongoose.model('AceitaPlantao', aceitaPlantaoSchema);
export default AceitaPlantao;
