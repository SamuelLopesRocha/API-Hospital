import express from 'express';
import {
  createUsuario,
  listUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  loginUsuario, // 👈 rota de login
  criarAdminInicial

} from '../controllers/usuario_controller.js';
import { autenticar } from '../middlewares/autenticacao.js'; // 🔒 middleware

const router = express.Router();

// 🧩 Rota temporária para criar ADMIN_SISTEMA (sem autenticação)
router.post('/setup-admin', criarAdminInicial);

// 🔑 Login (sem autenticação)
router.post('/login', loginUsuario);

// 👤 CRUD de usuários
router.post('/', autenticar, createUsuario);
router.get('/', listUsuarios);
router.get('/:id', getUsuarioById);
router.put('/:id', autenticar, updateUsuario);
router.delete('/:id', autenticar, deleteUsuario);

export default router;
