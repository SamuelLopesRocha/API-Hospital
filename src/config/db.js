import mongoose from "mongoose";

export async function connectDB(){
    const uri = process.env.MONGO_URI;
    if(!uri){
        throw new Error("MONGO_URI não está definido nas variáveis de ambiente.");
    }
    try {
        await mongoose.connect(uri, {
            // useNewUrlParser e useUnifiedTopology não são mais necessários nas versões novas
      // mas podemos deixar comentários para histórico
        autoIndex: true, // Cria índices automaticamente (útil para desenvolvimento)
        });
        console.log("Conectado ao MongoDB com sucesso.");
    } catch (err) {
        console.error("Erro ao conectar ao MongoDB:", err);
        process.exit(1); // Encerra o processo em caso de falha na conexão
    }
}