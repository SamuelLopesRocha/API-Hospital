import { Profissional_Detalhe } from '../models/profissional_detalhe_model.js';
import { Usuario } from '../models/usuario_model.js';
import { Hospital } from '../models/hospital_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js';

// CREATE
export async function createProfissional_Detalhe(req, res) {
  try {
    // 🔒 Verifica papel
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode criar detalhes de profissional.' });
    }

    const { profissional_id, hospital_id, especialidade, tipo_profissional } = req.body;

    if (!profissional_id || !hospital_id || !especialidade || !tipo_profissional) {
      return res.status(400).json({
        error: 'Campos obrigatórios: profissional_id, hospital_id, especialidade, tipo_profissional.'
      });
    }

    const usuarioExists = await Usuario.findOne({ usuario_id: profissional_id });
    if (!usuarioExists) {
      return res.status(400).json({ error: `Usuário com usuario_id '${profissional_id}' não encontrado.` });
    }

    const hospitalExists = await Hospital.findOne({ hospital_id });
    if (!hospitalExists) {
      return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
    }

    const tiposValidos = ['MEDICO','ENFERMEIRO','TECNICO','OUTRO'];
    if (!tiposValidos.includes(tipo_profissional)) {
      return res.status(400).json({ error: `tipo_profissional inválido. Valores válidos: ${tiposValidos.join(', ')}.` });
    }

    const detalhe = await Profissional_Detalhe.create({ profissional_id, hospital_id, especialidade, tipo_profissional });

    await registrarLog(req, 'Profissional_Detalhe', detalhe.profissional_id, 'CREATE', null, detalhe);

    res.status(201).json({ message: 'Detalhe do profissional criado com sucesso.', detalhe });

  } catch (err) {
    console.error('Erro ao criar detalhe do profissional:', err);
    res.status(500).json({ error: 'Erro ao criar detalhe do profissional.' });
  }
}

// LIST
export async function listProfissional_Detalhes(req, res) {
  try {
    const detalhes = await Profissional_Detalhe.find().sort({ createdAt: -1 });
    res.json(detalhes);
  } catch (err) {
    console.error('Erro ao listar detalhes dos profissionais:', err);
    res.status(500).json({ error: 'Erro ao listar detalhes dos profissionais.' });
  }
}

// GET by ID
export async function getProfissional_DetalheById(req, res) {
  try {
    const detalhe = await Profissional_Detalhe.findOne({ profissional_id: req.params.id });
    if (!detalhe) return res.status(404).json({ error: 'Detalhe do profissional não encontrado.' });
    res.json(detalhe);
  } catch (err) {
    console.error('Erro ao buscar detalhe do profissional:', err);
    res.status(500).json({ error: 'Erro ao buscar detalhe do profissional.' });
  }
}

// UPDATE
export async function updateProfissional_Detalhe(req, res) {
  try {
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode atualizar detalhes de profissional.' });
    }

    const { hospital_id, especialidade, tipo_profissional } = req.body;
    const update = { hospital_id, especialidade, tipo_profissional };

    const detalheAntes = await Profissional_Detalhe.findOne({ profissional_id: req.params.id });
    if (!detalheAntes) return res.status(404).json({ error: 'Detalhe do profissional não encontrado.' });

    if (hospital_id) {
      const hospitalExists = await Hospital.findOne({ hospital_id });
      if (!hospitalExists) return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
    }

    if (tipo_profissional) {
      const tiposValidos = ['MEDICO','ENFERMEIRO','TECNICO','OUTRO'];
      if (!tiposValidos.includes(tipo_profissional)) {
        return res.status(400).json({ error: `tipo_profissional inválido. Valores válidos: ${tiposValidos.join(', ')}.` });
      }
    }

    const detalheAtualizado = await Profissional_Detalhe.findOneAndUpdate(
      { profissional_id: req.params.id },
      update,
      { new: true }
    );

    await registrarLog(req, 'Profissional_Detalhe', detalheAtualizado.profissional_id, 'UPDATE', detalheAntes, detalheAtualizado);

    res.json({ message: 'Detalhe do profissional atualizado com sucesso.', detalhe: detalheAtualizado });

  } catch (err) {
    console.error('Erro ao atualizar detalhe do profissional:', err);
    res.status(500).json({ error: 'Erro ao atualizar detalhe do profissional.' });
  }
}

// DELETE
export async function deleteProfissional_Detalhe(req, res) {
  try {
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({ error: 'Acesso negado. Apenas ADMIN_SISTEMA pode deletar detalhes de profissional.' });
    }

    const detalhe = await Profissional_Detalhe.findOneAndDelete({ profissional_id: req.params.id });
    if (!detalhe) return res.status(404).json({ error: 'Detalhe do profissional não encontrado.' });

    await registrarLog(req, 'Profissional_Detalhe', detalhe.profissional_id, 'DELETE', detalhe, null);

    res.json({ message: 'Detalhe do profissional removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar detalhe do profissional:', err);
    res.status(500).json({ error: 'Erro ao deletar detalhe do profissional.' });
  }
}
