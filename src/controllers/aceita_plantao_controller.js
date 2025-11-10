import { Aceita } from '../models/aceita_plantao_model.js';
import { Plantao } from '../models/plantao_model.js';

// Criar aceite
export const createAceitePlantao = async (req, res) => {
  try {
    const { plantao_id, status, motivo_rejeicao } = req.body;

    if (!plantao_id) {
      return res.status(400).json({ error: 'O campo plantao_id é obrigatório.' });
    }

    // Buscar plantão pelo ID informado
    const plantao = await Plantao.findOne({ plantao_id });
    if (!plantao) {
      return res.status(404).json({ error: 'O plantão informado não existe.' });
    }

    // Criar aceite com informações herdadas do plantão
    const novoAceite = await Aceita.create({
      plantao_id,
      status,
      motivo_rejeicao,
      dia: plantao.dia,
      horario_inicio: plantao.horario_inicio,
      horario_final: plantao.horario_final,
      hospital_id: plantao.hospital_id,
    });

    res.status(201).json({
      message: 'Aceite de plantão criado com sucesso',
      data: novoAceite,
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar aceite de plantão',
      details: error.message,
    });
  }
};

// Listar todos
export const listAceitePlantoes = async (req, res) => {
  try {
    const aceites = await Aceita.find();
    res.status(200).json(aceites);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar aceites', details: error.message });
  }
};

// Buscar por ID
export const getAceitePlantaoById = async (req, res) => {
  try {
    const aceite = await Aceita.findOne({ aceita_id: req.params.id });
    if (!aceite) {
      return res.status(404).json({ error: 'Aceite não encontrado' });
    }
    res.status(200).json(aceite);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aceite', details: error.message });
  }
};

// Atualizar aceite
export const updateAceitePlantao = async (req, res) => {
  try {
    const aceite = await Aceita.findOneAndUpdate(
      { aceita_id: req.params.id },
      req.body,
      { new: true }
    );

    if (!aceite) {
      return res.status(404).json({ error: 'Aceite não encontrado' });
    }

    res.status(200).json({
      message: 'Aceite atualizado com sucesso',
      data: aceite,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar aceite', details: error.message });
  }
};

// Deletar aceite
export const deleteAceitePlantao = async (req, res) => {
  try {
    const aceite = await Aceita.findOneAndDelete({ aceita_id: req.params.id });

    if (!aceite) {
      return res.status(404).json({ error: 'Aceite não encontrado' });
    }

    res.status(200).json({ message: 'Aceite excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir aceite', details: error.message });
  }
};
