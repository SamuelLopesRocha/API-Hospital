// node server.js

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importa as rotas
import hospitalRouter from './src/routes/hospital_route.js';
import usuarioRouter from './src/routes/usuario_route.js';
import profissionalDetalheRouter from './src/routes/profissional_detalhe_route.js';
import plantaoRouter from './src/routes/plantao_route.js'; // ✅ nova rota Plantão
import aceitaPlantaoRouter from './src/routes/aceita_plantao_route.js'; // ✅ nova rota Aceita_Plantao
import logAuditoriaRouter from './src/routes/log_auditoria_route.js'; // ✅ nova rota de logs


// Configura variáveis de ambiente

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

/* ==============================
   🔗 Conexão com o MongoDB
================================ */
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitaldb';
  try {
    await mongoose.connect(uri, {
      autoIndex: true, // cria índices automaticamente com base no schema
    });
    console.log('✅ MongoDB conectado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }
}
connectDB();

/* ==============================
   🚏 Rotas principais da API
================================ */
app.use('/hospitais', hospitalRouter);
app.use('/usuarios', usuarioRouter);
app.use('/profissionais_detalhe', profissionalDetalheRouter);
app.use('/plantoes', plantaoRouter); // ✅ nova rota Plantão
app.use('/aceita_plantoes', aceitaPlantaoRouter); // ✅ nova rota Aceita_Plantao
app.use('/logs_auditoria', logAuditoriaRouter); // ✅ registrar rota de logs


/* ==============================
   🏠 Rota raiz (teste rápido)
================================ */
app.get('/', (req, res) => {
  res.send('🚑 API Hospital funcionando!');
});

/* ==============================
   🚀 Inicialização do servidor
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

export default app;
