import express from 'express';
import {
createLog,
listLogs,
getLogById,
updateLog,
deleteLog
} from '../controllers/log_auditoria_controller.js';

import { autenticar } from '../middlewares/autenticacao.js';

const router = express.Router();

// Rotas de logs de auditoria (protegidas)
router.post('/', autenticar, createLog);       // criar log (geralmente feito pelo sistema)
router.get('/', autenticar, listLogs);         // listar todos os logs
router.get('/:id', autenticar, getLogById);    // buscar log pelo log_id
router.put('/:id', autenticar, updateLog);     // atualizar log
router.delete('/:id', autenticar, deleteLog);  // deletar log

export default router;
