import express from 'express';
import {
  createAceitePlantao,
  listAceitePlantoes,
  getAceitePlantaoById,
  updateAceitePlantao,
  deleteAceitePlantao,
} from '../controllers/aceita_plantao_controller.js';

const router = express.Router();

// Rotas
router.post('/', createAceitePlantao);       // criar aceite protegido
router.get('/', listAceitePlantoes);        // listar todos 
router.get('/:id', getAceitePlantaoById);   // buscar por ID 
router.put('/:id', updateAceitePlantao);    // atualizar protegido
router.delete('/:id', deleteAceitePlantao);// deletar protegido

export default router;
