import mongoose from 'mongoose';

const aceitaPlantaoSchema = new mongoose.Schema({
aceite_id: {
type: String,
required: true,
unique: true,
trim: true
},

plantao_id: {
type: String,
required: true,
ref: 'Plantao', // FK → Plantao.plantao_id
trim: true
},

profissional_id: {
type: String,
required: true,
ref: 'Usuario', // FK → Usuario.usuario_id
trim: true
},

data_aceite: {
type: Date,
default: Date.now // registra automaticamente a data/hora do aceite
},

status: {
type: String,
enum: ['PENDENTE_APROVACAO', 'APROVADO', 'RECUSADO', 'CANCELADO'],
default: 'PENDENTE_APROVACAO'
}

}, {
timestamps: true, // cria createdAt e updatedAt
versionKey: false // desativa o __v
});

// Índices úteis
aceitaPlantaoSchema.index({ plantao_id: 1 });
aceitaPlantaoSchema.index({ profissional_id: 1 });
aceitaPlantaoSchema.index({ status: 1 });

export const AceitaPlantao = mongoose.model('AceitaPlantao', aceitaPlantaoSchema);