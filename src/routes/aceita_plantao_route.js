import express from 'express';
import {
  createAceitePlantao,
  listAceitePlantoes,
  getAceitePlantaoById,
  updateAceitePlantao,
  deleteAceitePlantao
} from '../controllers/aceita_plantao_controller.js';

import { autenticarMedico } from '../middlewares/autenticacao_medico.js';
import { autenticar } from '../middlewares/autenticacao.js';

const router = express.Router();

// Apenas médicos autenticados podem criar
router.post('/', autenticarMedico, createAceitePlantao);

// As demais rotas podem ser abertas ou usar autenticação normal
router.get('/', listAceitePlantoes);
router.get('/:id', getAceitePlantaoById);
router.put('/:id', autenticar, updateAceitePlantao);
router.delete('/:id', autenticarMedico, deleteAceitePlantao); //tem que arrumar apenas GESTOR pode deletar

export default router;
