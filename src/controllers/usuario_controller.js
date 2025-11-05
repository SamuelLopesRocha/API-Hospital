import { Usuario } from '../models/usuario_model.js';
import { Hospital } from '../models/hospital_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registrarLog } from '../utils/log_auditoria_helper.js'; // helper de logs

// CREATE
export async function createUsuario(req, res) {
  try {
    // 🔒 Apenas ADMIN_SISTEMA pode criar usuários
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode criar usuários.' });
    }

    const { usuario_id, hospital_id, nome, email, senha, papel, telefone, documento, ativo } = req.body;

    if (!usuario_id || !nome || !email || !senha || !papel) {
      return res.status(400).json({ error: 'Campos obrigatórios: usuario_id, nome, email, senha, papel.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido. Use um formato válido como exemplo@dominio.com.' });
    }

    const usuarioExistente = await Usuario.findOne({ usuario_id });
    if (usuarioExistente) return res.status(400).json({ error: `Usuário com usuario_id '${usuario_id}' já existe.` });

    const papeisValidos = ['GESTOR', 'PROFISSIONAL', 'ADMIN_SISTEMA'];
    if (!papeisValidos.includes(papel)) return res.status(400).json({ error: 'Papel inválido. Deve ser: GESTOR, PROFISSIONAL ou ADMIN_SISTEMA.' });

    if (papel !== 'ADMIN_SISTEMA' && !hospital_id) {
      return res.status(400).json({ error: 'O campo hospital_id é obrigatório para GESTOR e PROFISSIONAL.' });
    }

    if (hospital_id) {
      const hospitalExists = await Hospital.findOne({ hospital_id });
      if (!hospitalExists) return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
    }

    const emailExistente = await Usuario.findOne({ email });
    if (emailExistente) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    const usuario = await Usuario.create({
      usuario_id,
      hospital_id: hospital_id || null,
      nome,
      email: email.trim().toLowerCase(),
      senha_hash,
      papel,
      telefone,
      documento,
      ativo: ativo !== undefined ? ativo : true,
    });

    // Registrar log de criação
    await registrarLog(req, 'Usuario', usuario.usuario_id, 'CREATE', null, usuario);

    res.status(201).json({ message: 'Usuário criado com sucesso.', usuario });

  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
}

// LIST
export async function listUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
}

// GET by ID
export async function getUsuarioById(req, res) {
  try {
    const usuario = await Usuario.findOne({ usuario_id: req.params.id });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(usuario);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
}

// UPDATE
export async function updateUsuario(req, res) {
  try {
    // 🔒 Apenas ADMIN_SISTEMA pode editar usuários
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode editar usuários.' });
    }

    const { nome, email, senha, papel, telefone, documento, ativo, hospital_id } = req.body;
    const update = { nome, email, papel, telefone, documento, ativo };

    const usuarioAntes = await Usuario.findOne({ usuario_id: req.params.id });
    if (!usuarioAntes) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
      update.email = email.trim().toLowerCase();
    }

    if (senha) {
      const salt = await bcrypt.genSalt(10);
      update.senha_hash = await bcrypt.hash(senha, salt);
    }

    if (hospital_id) {
      const hospitalExists = await Hospital.findOne({ hospital_id });
      if (!hospitalExists) return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
      update.hospital_id = hospital_id;
    }

    const usuarioAtualizado = await Usuario.findOneAndUpdate({ usuario_id: req.params.id }, update, { new: true });

    // Registrar log de atualização
    await registrarLog(req, 'Usuario', usuarioAtualizado.usuario_id, 'UPDATE', usuarioAntes, usuarioAtualizado);

    res.json({ message: 'Usuário atualizado com sucesso.', usuario: usuarioAtualizado });

  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
}

// DELETE
export async function deleteUsuario(req, res) {
  try {
    // 🔒 Apenas ADMIN_SISTEMA pode deletar usuários
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode deletar usuários.' });
    }

    const usuario = await Usuario.findOneAndDelete({ usuario_id: req.params.id });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Registrar log de exclusão
    await registrarLog(req, 'Usuario', usuario.usuario_id, 'DELETE', usuario, null);

    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
}

// LOGIN com JWT
export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });
    if (!usuario) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    // Gerar token JWT
    const secret = process.env.JWT_SECRET || 'minha_chave_secreta';
    const token = jwt.sign(
      { usuario_id: usuario.usuario_id, hospital_id: usuario.hospital_id, papel: usuario.papel },
      secret,
      { expiresIn: '8h' }
    );

    // Preencher req.user para logs
    req.user = {
      usuario_id: usuario.usuario_id,
      hospital_id: usuario.hospital_id,
      papel: usuario.papel
    };

    // Registrar log de login
    await registrarLog(req, 'Usuario', usuario.usuario_id, 'LOGIN');

    res.json({
      message: 'Login realizado com sucesso.',
      usuario: { usuario_id: usuario.usuario_id, nome: usuario.nome, papel: usuario.papel },
      token
    });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
}