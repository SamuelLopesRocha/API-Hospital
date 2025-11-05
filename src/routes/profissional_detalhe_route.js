import express from 'express';
import {
  createProfissional_Detalhe,
  listProfissional_Detalhes,
  getProfissional_DetalheById,
  updateProfissional_Detalhe,
  deleteProfissional_Detalhe,
} from '../controllers/profissional_detalhe_controller.js';

import { autenticar } from '../middlewares/autenticacao.js'; // 🔒 importa o middleware

const router = express.Router();

// 🔒 Apenas ADMIN_SISTEMA pode criar, atualizar e deletar
router.post('/', autenticar, createProfissional_Detalhe);
router.put('/:id', autenticar, updateProfissional_Detalhe);
router.delete('/:id', autenticar, deleteProfissional_Detalhe);

// 👁️ Público (ou todos os papéis) podem listar e consultar detalhes
router.get('/', listProfissional_Detalhes);
router.get('/:id', getProfissional_DetalheById);

export default router;
