import jwt from 'jsonwebtoken';
import { Usuario } from '../models/usuario_model.js';

export async function autenticar(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token inválido.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findOne({ usuario_id: decoded.usuario_id });
    if (!usuario) return res.status(401).json({ error: 'Usuário inválido.' });

    req.user = {
      usuario_id: usuario.usuario_id,
      hospital_id: usuario.hospital_id,
      papel: usuario.papel
    };

    next();
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(401).json({ error: 'Falha na autenticação.' });
  }
}
