import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
usuario_id: {
type: String,
required: true,
unique: true,
trim: true
},

hospital_id: {
type: String,
ref: 'Hospital',   // referência à collection Hospital
default: null,     // pode ser nulo (para ADMIN_SISTEMA)
trim: true
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
match: [/^[^\s@]+@[^\s@]+.[^\s@]+$/, 'E-mail inválido. Use um formato válido, como [exemplo@dominio.com](mailto:exemplo@dominio.com).']
},

senha_hash: {
type: String,
required: true
},

papel: {
type: String,
enum: ['GESTOR', 'PROFISSIONAL', 'ADMIN_SISTEMA'],
required: true
},

telefone: {
type: String,
trim: true
},

documento: {
type: String,
trim: true
},

ativo: {
type: Boolean,
default: true
}

}, {
timestamps: true, // adiciona createdAt e updatedAt
versionKey: false // desativa o __v
});

// Índices úteis
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ hospital_id: 1 });
usuarioSchema.index({ papel: 1 });

export const Usuario = mongoose.model('Usuario', usuarioSchema);