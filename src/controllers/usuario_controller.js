import { Usuario } from '../models/usuario_model.js';
import { Hospital } from '../models/hospital_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registrarLog } from '../utils/log_auditoria_helper.js';

export const createUsuario = async (req, res) => {
  try {
    const { nome, email, senha_hash, papel, telefone, hospital_id } = req.body;

    // 🧠 Validação dos campos obrigatórios
    if (!nome || !email || !senha_hash || !papel || !hospital_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, email, senha, papel e hospital_id.',
      });
    }

    // ⚙️ Verifica se o hospital realmente existe
    const hospitalExists = await Hospital.findOne({ hospital_id });
    if (!hospitalExists) {
      return res.status(400).json({
        error: `Hospital com hospital_id '${hospital_id}' não encontrado.`,
      });
    }

    // 🚫 Verifica se já existe um usuário com o mesmo e-mail
    const emailExistente = await Usuario.findOne({ email: email.trim().toLowerCase() });
    if (emailExistente) {
      return res.status(400).json({
        error: `Já existe um usuário cadastrado com o e-mail '${email}'.`,
      });
    }

    // 🔍 Gera um ID sequencial simples (1, 2, 3, ...)
    const ultimoUsuario = await Usuario.findOne().sort({ usuario_id: -1 });
    const proximoId = ultimoUsuario ? ultimoUsuario.usuario_id + 1 : 1;

    // 🔒 Criptografa a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha_hash, 10);

    // 💾 Cria o usuário no banco
    const novoUsuario = await Usuario.create({
      usuario_id: proximoId,
      nome,
      email: email.trim().toLowerCase(),
      senha_hash: senhaCriptografada,
      papel,
      telefone,
      hospital_id,
    });

    // 📝 Registra o log de criação
    await registrarLog(req, 'Usuario', novoUsuario.usuario_id, 'CREATE', null, novoUsuario.toJSON());

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      usuario: novoUsuario,
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

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
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode editar usuários.' });
    }

    const { nome, email, senha, papel, telefone, ativo, hospital_id } = req.body;

    if (!hospital_id) {
      return res.status(400).json({ error: 'hospital_id é obrigatório.' });
    }

    const usuarioAntes = await Usuario.findOne({ usuario_id: req.params.id });
    if (!usuarioAntes) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const update = { nome, papel, telefone, ativo };

    // 🧩 Valida e-mail
    if (email) {
      const emailFormatado = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailFormatado)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
      }

      // 🚫 Verifica duplicidade de e-mail (não pode ser o mesmo de outro usuário)
      const emailExistente = await Usuario.findOne({ email: emailFormatado });
      if (emailExistente && emailExistente.usuario_id !== usuarioAntes.usuario_id) {
        return res.status(400).json({
          error: `O e-mail '${email}' já está sendo usado por outro usuário.`,
        });
      }

      update.email = emailFormatado;
    }

    if (senha) {
      const salt = await bcrypt.genSalt(10);
      update.senha_hash = await bcrypt.hash(senha, salt);
    }

    const hospitalExists = await Hospital.findOne({ hospital_id });
    if (!hospitalExists) {
      return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
    }
    update.hospital_id = hospital_id;

    const usuarioAtualizado = await Usuario.findOneAndUpdate(
      { usuario_id: req.params.id },
      update,
      { new: true }
    );

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
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode deletar usuários.' });
    }

    const usuario = await Usuario.findOneAndDelete({ usuario_id: req.params.id });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    await registrarLog(req, 'Usuario', usuario.usuario_id, 'DELETE', usuario, null);

    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
}

// LOGIN
export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha)
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });
    if (!usuario) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    const secret = process.env.JWT_SECRET || 'minha_chave_secreta';
    const token = jwt.sign(
      { usuario_id: usuario.usuario_id, hospital_id: usuario.hospital_id, papel: usuario.papel },
      secret,
      { expiresIn: '8h' }
    );

    req.user = {
      usuario_id: usuario.usuario_id,
      hospital_id: usuario.hospital_id,
      papel: usuario.papel
    };

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

// ✅ CRIA ADMIN INICIAL
export async function criarAdminInicial(req, res) {
  try {
    const existeAdmin = await Usuario.findOne({ papel: 'ADMIN_SISTEMA' });
    if (existeAdmin) {
      return res.status(400).json({ error: 'Já existe um ADMIN_SISTEMA cadastrado.' });
    }

    const { hospital_id } = req.body;
    if (!hospital_id) {
      return res.status(400).json({ error: 'hospital_id é obrigatório.' });
    }

    const hospital = await Hospital.findOne({ hospital_id });
    if (!hospital) {
      return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
    }

    const senhaCriptografada = await bcrypt.hash('admin123', 10);

    const novoAdmin = await Usuario.create({
      nome: 'Administrador do Sistema',
      email: 'admin@sistema.com',
      senha_hash: senhaCriptografada,
      papel: 'ADMIN_SISTEMA',
      telefone: '11988888888',
      hospital_id
    });

    console.log('🧩 ADMIN_SISTEMA criado com sucesso!');
    return res.status(201).json({
      message: 'ADMIN_SISTEMA criado com sucesso!',
      usuario: novoAdmin
    });
  } catch (error) {
    console.error('Erro ao criar admin inicial:', error);
    return res.status(500).json({ error: 'Erro ao criar ADMIN_SISTEMA.' });
  }
}
