import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    hospital_id: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        /*
         * Identificador único do hospital (chave primária lógica).
         * Unique garante que não existam dois hospitais com o mesmo ID.
         * O tipo String foi escolhido para permitir IDs customizados (ex: "HOSP001").
         */
    },

    nome: { 
        type: String, 
        required: true, 
        trim: true, 
        minlength: 1, 
        maxlength: 200,
        /*
         * Nome completo do hospital.
         * O trim remove espaços extras (ex: " Hospital X " → "Hospital X").
         * O minlength e maxlength evitam nomes muito curtos ou longos.
         */
    },

    cnpj: { 
        type: String, 
        required: true, 
        trim: true, 
        minlength: 14, 
        maxlength: 18,
        /*
         * CNPJ do hospital (com ou sem máscara).
         * Mantido como String para preservar zeros à esquerda e facilitar formatação.
         */
    },

    endereco: { 
        type: String, 
        required: true, 
        trim: true, 
        minlength: 1,
        maxlength: 300,
        /*
         * Endereço completo do hospital.
         * Inclui rua, número, bairro, cidade, estado e CEP.
         */
    },

    email: { 
        type: String, 
        required: true, 
        trim: true, 
        lowercase: true,
        /*
         * E-mail institucional do hospital.
         * Armazenado sempre em letras minúsculas para padronização.
         */
    },

    subdominio_url: { 
        type: String, 
        trim: true,
        /*
         * Subdomínio opcional para o hospital (ex: hospitalx.sistema.com).
        */
    }

}, { 
    timestamps: true,  // adiciona createdAt e updatedAt automaticamente
    versionKey: false  // remove o campo __v (controle interno de versão do Mongoose)
});

/*
 * Índices auxiliares nome: melhora desempenho em buscas por nome de hospital.
*/
hospitalSchema.index({ nome: 1 });

export const Hospital = mongoose.model('Hospital', hospitalSchema);