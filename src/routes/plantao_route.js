import express from 'express';
import {
  createPlantao,
  listPlantoes,
  getPlantaoById,
  updatePlantao,
  deletePlantao,
} from '../controllers/plantao_controller.js';

import { autenticar } from '../middlewares/autenticacao.js';

const router = express.Router();

// Rotas
router.post('/', autenticar, createPlantao);        // criar plantão protegido
router.get('/', listPlantoes);                      // listar plantões (público ou protegido)
router.get('/:id', getPlantaoById);                // buscar plantão (público ou protegido)
router.put('/:id', autenticar, updatePlantao);     // atualizar protegido
router.delete('/:id', autenticar, deletePlantao);  // deletar protegido

export default router;
