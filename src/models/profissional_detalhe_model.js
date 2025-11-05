import mongoose from 'mongoose';

const profissionalDetalheSchema = new mongoose.Schema({
profissional_id: {       // referência ao id do usuário profissional 
type: String,
required: true,
unique: true,
trim: true,
ref: 'Usuario'   // referência à collection Usuario
},

hospital_id: { 
    type: String, 
    ref: 'Hospital',   // referência à collection Hospital
    required: true,    // todo profissional deve estar vinculado a um hospital
    trim: true 
},

especialidade: { 
    type: String, 
    required: true, 
    trim: true, 
    minlength: 2, 
    maxlength: 100 
},

tipo_profissional: { 
    type: String, 
    enum: ['MEDICO','ENFERMEIRO','TECNICO','OUTRO'], 
    required: true 
}

}, {
timestamps: true,     // adiciona createdAt e updatedAt
versionKey: false     // desativa o __v
});

// Índices úteis
profissionalDetalheSchema.index({ hospital_id: 1 });
profissionalDetalheSchema.index({ tipo_profissional: 1 });
profissionalDetalheSchema.index({ especialidade: 1 });

export const Profissional_Detalhe = mongoose.model('Profissional_Detalhe', profissionalDetalheSchema);
