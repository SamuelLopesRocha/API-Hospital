import express from 'express';
import {
  createAceitePlantao,
  listAceitePlantoes,
  getAceitePlantaoById,
  updateAceitePlantao,
  deleteAceitePlantao
} from '../controllers/aceita_plantao_controller.js';

const router = express.Router();

router.post('/', createAceitePlantao);
router.get('/', listAceitePlantoes);
router.get('/:id', getAceitePlantaoById);
router.put('/:id', updateAceitePlantao);
router.delete('/:id', deleteAceitePlantao);

export default router;
