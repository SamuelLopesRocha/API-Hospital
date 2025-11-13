import express from 'express';

import {
  createAceitePlantao,
  listAceitePlantoes,
  getAceitePlantaoById,
  updateAceitePlantao,
  deleteAceitePlantao,
  listAceitesPorPlantao // 👈 adiciona aqui

} from '../controllers/aceita_plantao_controller.js';

const router = express.Router();

router.post('/', createAceitePlantao);
router.get('/', listAceitePlantoes);
router.get('/:id', getAceitePlantaoById);
router.put('/:id', updateAceitePlantao);
router.delete('/:id', deleteAceitePlantao);

// 👇 nova rota
router.get('/por_plantao/:plantao_id', listAceitesPorPlantao);

export default router;
