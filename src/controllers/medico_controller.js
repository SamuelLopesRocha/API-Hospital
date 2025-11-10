import { Medico } from '../models/medico_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registrarLog } from '../utils/log_auditoria_helper.js';

// ✅ CREATE
export const createMedico = async (req, res) => {
  try {
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode criar médicos.' });
    }

    const { CRM, email, senha, especialidade, telefone } = req.body;

    if (!CRM || !senha || !especialidade) {
      return res.status(400).json({ error: 'Campos obrigatórios: CRM, senha e especialidade.' });
    }

    // 🚫 Verifica duplicidade de CRM
    const crmExistente = await Medico.findOne({ CRM: CRM.trim().toUpperCase() });
    if (crmExistente) {
      return res.status(400).json({ error: `Já existe um médico com o CRM '${CRM}'.` });
    }

    // 🚫 Verifica duplicidade de e-mail (se informado)
    if (email) {
      const emailExistente = await Medico.findOne({ email: email.trim().toLowerCase() });
      if (emailExistente) {
        return res.status(400).json({ error: `Já existe um médico com o e-mail '${email}'.` });
      }
    }

    // 🔢 Gera ID sequencial
    const ultimo = await Medico.findOne().sort({ medico_id: -1 });
    const proximoId = ultimo ? ultimo.medico_id + 1 : 1;

    // 🔒 Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // 💾 Cria o médico
    const novoMedico = await Medico.create({
      medico_id: proximoId,
      CRM: CRM.trim().toUpperCase(),
      email: email ? email.trim().toLowerCase() : undefined,
      senha: senhaCriptografada,
      especialidade: especialidade.trim(),
      telefone: telefone?.trim(),
      ativo: true,
      papel: 'MEDICO'
    });

    await registrarLog(req, 'Medico', novoMedico.medico_id, 'CREATE', null, novoMedico.toJSON());

    return res.status(201).json({
      message: 'Médico criado com sucesso!',
      medico: novoMedico
    });

  } catch (error) {
    console.error('Erro ao criar médico:', error);
    return res.status(500).json({ error: 'Erro ao criar médico.' });
  }
};

// 📋 LIST
export async function listMedicos(req, res) {
  try {
    const medicos = await Medico.find().sort({ createdAt: -1 });
    res.json(medicos);
  } catch (err) {
    console.error('Erro ao listar médicos:', err);
    res.status(500).json({ error: 'Erro ao listar médicos.' });
  }
}

// 🔍 GET by ID
export async function getMedicoById(req, res) {
  try {
    const medico = await Medico.findOne({ medico_id: req.params.id });
    if (!medico) return res.status(404).json({ error: 'Médico não encontrado.' });
    res.json(medico);
  } catch (err) {
    console.error('Erro ao buscar médico:', err);
    res.status(500).json({ error: 'Erro ao buscar médico.' });
  }
}

// ✏️ UPDATE
export async function updateMedico(req, res) {
  try {
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode atualizar médicos.' });
    }

    const { CRM, email, senha, especialidade, telefone, ativo } = req.body;
    const medicoAntes = await Medico.findOne({ medico_id: req.params.id });

    if (!medicoAntes) {
      return res.status(404).json({ error: 'Médico não encontrado.' });
    }

    const update = { especialidade, telefone, ativo };

    // 🚫 CRM duplicado
    if (CRM) {
      const crmFormatado = CRM.trim().toUpperCase();
      const crmExistente = await Medico.findOne({ CRM: crmFormatado });
      if (crmExistente && crmExistente.medico_id !== medicoAntes.medico_id) {
        return res.status(400).json({ error: `O CRM '${CRM}' já está em uso por outro médico.` });
      }
      update.CRM = crmFormatado;
    }

    // 🚫 E-mail duplicado
    if (email) {
      const emailFormatado = email.trim().toLowerCase();
      const emailExistente = await Medico.findOne({ email: emailFormatado });
      if (emailExistente && emailExistente.medico_id !== medicoAntes.medico_id) {
        return res.status(400).json({ error: `O e-mail '${email}' já está sendo usado por outro médico.` });
      }
      update.email = emailFormatado;
    }

    // 🔒 Atualiza senha
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      update.senha = await bcrypt.hash(senha, salt);
    }

    const medicoAtualizado = await Medico.findOneAndUpdate(
      { medico_id: req.params.id },
      update,
      { new: true }
    );

    await registrarLog(req, 'Medico', medicoAtualizado.medico_id, 'UPDATE', medicoAntes, medicoAtualizado);

    res.json({ message: 'Médico atualizado com sucesso.', medico: medicoAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar médico:', err);
    res.status(500).json({ error: 'Erro ao atualizar médico.' });
  }
}

// ❌ DELETE
export async function deleteMedico(req, res) {
  try {
    if (req.user?.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode deletar médicos.' });
    }

    const medico = await Medico.findOneAndDelete({ medico_id: req.params.id });
    if (!medico) return res.status(404).json({ error: 'Médico não encontrado.' });

    await registrarLog(req, 'Medico', medico.medico_id, 'DELETE', medico, null);

    res.json({ message: 'Médico removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar médico:', err);
    res.status(500).json({ error: 'Erro ao deletar médico.' });
  }
}

// 🔐 LOGIN
export async function loginMedico(req, res) {
  try {
    const { CRM, senha } = req.body;

    console.log('DEBUG loginMedico - body recebido:', req.body);

    const crmRecebido = (CRM ?? '').toString().trim();
    const senhaRecebida = senha ?? '';

    if (!crmRecebido || !senhaRecebida) {
      return res.status(400).json({ error: 'CRM e senha são obrigatórios.' });
    }

    const crmFormatado = crmRecebido.toUpperCase();

    const medico = await Medico.findOne({ CRM: crmFormatado });
    if (!medico) {
      return res.status(401).json({ error: 'CRM ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senhaRecebida, medico.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'CRM ou senha incorretos.' });
    }

    const token = jwt.sign(
      {
        medico_id: medico.medico_id,
        papel: 'MEDICO',
        CRM: medico.CRM
      },
      process.env.JWT_SECRET || 'minha_chave_secreta',
      { expiresIn: '8h' }
    );

    req.user = {
      medico_id: medico.medico_id,
      CRM: medico.CRM,
      papel: medico.papel || 'MEDICO'
    };

    await registrarLog(req, 'Medico', medico.medico_id, 'LOGIN');

    return res.json({
      message: 'Login realizado com sucesso.',
      medico: {
        medico_id: medico.medico_id,
        nome: medico.nome,
        CRM: medico.CRM,
        especialidade: medico.especialidade
      },
      token
    });
  } catch (err) {
    console.error('Erro ao fazer login do médico:', err);
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
}
