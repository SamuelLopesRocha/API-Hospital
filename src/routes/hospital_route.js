import express from 'express';
import {
  createHospital,
  listHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} from '../controllers/hospital_controller.js';
import { autenticar } from '../middlewares/autenticacao.js'; // ✅ importa o middleware

const router = express.Router();

/* ===========================================
   🏥 ROTAS DE HOSPITAL (com autenticação)
=========================================== */

// ✅ Todas as rotas exigem autenticação
router.use(autenticar);

// ✅ Apenas ADMIN_SISTEMA poderá criar/editar/deletar (já tratado no controller)
router.post('/', createHospital);
router.get('/', listHospitals);
router.get('/:id', getHospitalById);
router.put('/:id', updateHospital);
router.delete('/:id', deleteHospital);

export default router;
