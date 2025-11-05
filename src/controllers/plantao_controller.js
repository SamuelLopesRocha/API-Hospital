import { Plantao } from '../models/plantao_model.js';
import { Hospital } from '../models/hospital_model.js';
import { Usuario } from '../models/usuario_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js';

// CREATE
export async function createPlantao(req, res) {
  try {
    const {
      plantao_id,
      hospital_id,
      gestor_id,
      titulo,
      descricao,
      data_inicio,
      data_fim,
      cargo_requerido,
      tipo,
      valor,
      status
    } = req.body;

    // Campos obrigatórios
    if (!plantao_id || !hospital_id || !gestor_id || !titulo || !data_inicio || !data_fim || !cargo_requerido || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // Validar hospital
    const hospitalExists = await Hospital.findOne({ hospital_id });
    if (!hospitalExists) return res.status(400).json({ error: `Hospital '${hospital_id}' não encontrado.` });

    // Validar gestor
    const gestor = await Usuario.findOne({ usuario_id: gestor_id });
    if (!gestor) return res.status(400).json({ error: `Usuário '${gestor_id}' não encontrado.` });
    if (gestor.papel !== 'GESTOR') return res.status(403).json({ error: 'Apenas GESTOR pode criar plantões.' });

    // Criar plantão
    const plantao = await Plantao.create({
      plantao_id,
      hospital_id,
      gestor_id,
      titulo,
      descricao,
      data_inicio,
      data_fim,
      cargo_requerido,
      tipo,
      valor: valor !== undefined ? valor : 0.0,
      status: status || 'DISPONIVEL'
    });

    await registrarLog(req, 'Plantao', plantao.plantao_id, 'CREATE', null, plantao);

    res.status(201).json({ message: 'Plantão criado com sucesso.', plantao });

  } catch (err) {
    console.error('Erro ao criar plantão:', err);
    res.status(500).json({ error: 'Erro ao criar plantão.' });
  }
}

// LIST
export async function listPlantoes(req, res) {
  try {
    const plantoes = await Plantao.find().sort({ data_inicio: -1 });
    res.json(plantoes);
  } catch (err) {
    console.error('Erro ao listar plantões:', err);
    res.status(500).json({ error: 'Erro ao listar plantões.' });
  }
}

// GET BY ID
export async function getPlantaoById(req, res) {
  try {
    const plantao = await Plantao.findOne({ plantao_id: req.params.id });
    if (!plantao) return res.status(404).json({ error: 'Plantão não encontrado.' });
    res.json(plantao);
  } catch (err) {
    console.error('Erro ao buscar plantão:', err);
    res.status(500).json({ error: 'Erro ao buscar plantão.' });
  }
}

// UPDATE
export async function updatePlantao(req, res) {
  try {
    const {
      hospital_id,
      titulo,
      descricao,
      data_inicio,
      data_fim,
      cargo_requerido,
      tipo,
      valor,
      status
    } = req.body;

    const update = { titulo, descricao, data_inicio, data_fim, cargo_requerido, tipo, valor, status };

    const plantaoAntes = await Plantao.findOne({ plantao_id: req.params.id });
    if (!plantaoAntes) return res.status(404).json({ error: 'Plantão não encontrado.' });

    // Validar papel do usuário (somente GESTOR)
    if (req.user.papel !== 'GESTOR') return res.status(403).json({ error: 'Apenas GESTOR pode atualizar plantões.' });

    // Validar hospital, se fornecido
    if (hospital_id) {
      const hospitalExists = await Hospital.findOne({ hospital_id });
      if (!hospitalExists) return res.status(400).json({ error: `Hospital '${hospital_id}' não encontrado.` });
      update.hospital_id = hospital_id;
    }

    const plantaoAtualizado = await Plantao.findOneAndUpdate({ plantao_id: req.params.id }, update, { new: true });

    await registrarLog(req, 'Plantao', plantaoAtualizado.plantao_id, 'UPDATE', plantaoAntes, plantaoAtualizado);

    res.json({ message: 'Plantão atualizado com sucesso.', plantao: plantaoAtualizado });

  } catch (err) {
    console.error('Erro ao atualizar plantão:', err);
    res.status(500).json({ error: 'Erro ao atualizar plantão.' });
  }
}

// DELETE
export async function deletePlantao(req, res) {
  try {
    const plantao = await Plantao.findOne({ plantao_id: req.params.id });
    if (!plantao) return res.status(404).json({ error: 'Plantão não encontrado.' });

    // Validar papel do usuário (somente GESTOR)
    if (req.user.papel !== 'GESTOR') return res.status(403).json({ error: 'Apenas GESTOR pode deletar plantões.' });

    await Plantao.findOneAndDelete({ plantao_id: req.params.id });
    await registrarLog(req, 'Plantao', plantao.plantao_id, 'DELETE', plantao, null);

    res.json({ message: 'Plantão removido com sucesso.' });

  } catch (err) {
    console.error('Erro ao deletar plantão:', err);
    res.status(500).json({ error: 'Erro ao deletar plantão.' });
  }
}