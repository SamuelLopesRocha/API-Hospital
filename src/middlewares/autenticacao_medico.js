// src/middlewares/autenticacao_medico.js
import jwt from 'jsonwebtoken';
import { Medico } from '../models/medico_model.js';

export async function autenticarMedico(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    if (!token)
      return res.status(401).json({ error: 'Token inválido.' });

    // Verifica token com chave JWT padrão do sistema
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o médico pelo ID contido no token
    const medico = await Medico.findOne({ medico_id: decoded.medico_id });
    if (!medico)
      return res.status(401).json({ error: 'Médico inválido.' });

    // Armazena no req para uso posterior
    req.medico = {
      medico_id: medico.medico_id,
      crm: medico.crm,
      hospital_id: medico.hospital_id,
      nome: medico.nome
    };

    next();
  } catch (err) {
    console.error('Erro na autenticação do médico:', err);
    return res.status(401).json({ error: 'Falha na autenticação do médico.' });
  }
}
