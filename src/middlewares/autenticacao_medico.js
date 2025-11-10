// login do médico
import jwt from 'jsonwebtoken';
import { Medico } from '../models/medico_model.js';
import bcrypt from 'bcrypt';

export async function loginMedico(req, res) {
  const { CRM, senha } = req.body;
  const medico = await Medico.findOne({ CRM });
  if (!medico) return res.status(404).json({ error: 'Médico não encontrado.' });

  const senhaValida = await bcrypt.compare(senha, medico.senha);
  if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta.' });

  const token = jwt.sign(
    {
      usuario_id: medico.medico_id, // ⚠️ Número, não string
      papel: medico.papel
    },
    process.env.JWT_SECRET || 'minha_chave_secreta',
    { expiresIn: '1h' }
  );

  return res.status(200).json({ token });
}
