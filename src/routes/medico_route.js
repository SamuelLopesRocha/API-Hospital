import express from 'express';
import {
  createMedico,
  listMedicos,
  getMedicoById,
  updateMedico,
  deleteMedico,
  loginMedico // 👈 importa o login
} from '../controllers/medico_controller.js';

import { autenticar } from '../middlewares/autenticacao.js';

const router = express.Router();

// 🔐 LOGIN (não precisa de autenticação)
router.post('/login', loginMedico);

// 🔒 Apenas ADMIN_SISTEMA pode criar, atualizar e deletar
router.post('/', autenticar, createMedico);
router.put('/:id', autenticar, updateMedico);
router.delete('/:id', autenticar, deleteMedico);

// 👁️ Público (ou qualquer papel autenticado) pode listar e buscar médico
router.get('/', listMedicos);
router.get('/:id', getMedicoById);

export default router;
