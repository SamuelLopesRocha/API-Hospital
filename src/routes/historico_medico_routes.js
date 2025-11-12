import express from 'express';
import { getHistoricoMedicoByCRM } from '../controllers/historico_medico_controller.js';

const router = express.Router();

router.get('/:crm', getHistoricoMedicoByCRM);

export default router;
