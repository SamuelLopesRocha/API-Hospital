import mongoose from 'mongoose';

const plantaoSchema = new mongoose.Schema({
    plantao_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        /*
         * Identificador único do plantão (chave primária lógica)
         */
    },

    hospital_id: {
        type: String,
        ref: 'Hospital',  // referência à collection Hospital
        required: true,
        trim: true,
    },

    gestor_id: {
        type: String,
        ref: 'Usuario',   // referência à collection Usuario
        required: true,
        trim: true,
        /*
         * Deve ser um usuário com papel GESTOR
         */
    },

    titulo: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200,
    },

    descricao: {
        type: String,
        trim: true,
        maxlength: 1000,
    },

    data_inicio: {
        type: Date,
        required: true,
    },

    data_fim: {
        type: Date,
        required: true,
    },

    cargo_requerido: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },

    tipo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        /*
         * Ex.: plantão, substituição
         */
    },

    valor: {
        type: mongoose.Types.Decimal128,
        default: 0.0,
    },

    status: {
        type: String,
        enum: ['DISPONIVEL','RESERVADO','CONFIRMADO','CANCELADO','CONCLUIDO'],
        default: 'DISPONIVEL',
    }

}, {
    timestamps: true,    // adiciona createdAt e updatedAt
    versionKey: false,   // desativa o __v
});

// Índices úteis
plantaoSchema.index({ hospital_id: 1 });
plantaoSchema.index({ gestor_id: 1 });
plantaoSchema.index({ status: 1 });

export const Plantao = mongoose.model('Plantao', plantaoSchema);
