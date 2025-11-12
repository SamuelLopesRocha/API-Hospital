import express from 'express';
import {
  createHistorico,
  listHistoricos,
  getHistoricoById,
  updateHistorico,
  deleteHistorico
} from '../controllers/historico_gestor_controller.js';

const router = express.Router();

/**
 * @route POST /historico
 * @desc Criar novo histórico manualmente
 */
router.post('/', createHistorico);

/**
 * @route GET /historico
 * @desc Listar históricos com filtros opcionais (CRM, plantao_id, aceita_id)
 */
router.get('/', listHistoricos);

/**
 * @route GET /historico/:id
 * @desc Buscar histórico por ID
 */
router.get('/:id', getHistoricoById);

/**
 * @route PUT /historico/:id
 * @desc Atualizar histórico existente
 */
router.put('/:id', updateHistorico);

/**
 * @route DELETE /historico/:id
 * @desc Remover histórico
 */
router.delete('/:id', deleteHistorico);

export default router;
