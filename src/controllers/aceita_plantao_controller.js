import { AceitaPlantao } from '../models/aceita_plantao_model.js';

/**
 * Criar um novo aceite de plantão
 */
export const createAceitePlantao = async (req, res) => {
  try {
    const { aceite_id, plantao_id, profissional_id, status } = req.body;

    if (!aceite_id || !plantao_id || !profissional_id) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos.' });
    }

    const existente = await AceitaPlantao.findOne({ aceite_id });
    if (existente) {
      return res.status(409).json({ message: 'Já existe um aceite_plantao com este ID.' });
    }

    const novoAceite = await AceitaPlantao.create({
      aceite_id,
      plantao_id,
      profissional_id,
      status,
    });

    return res.status(201).json({
      message: '✅ aceite_plantao criado com sucesso!',
      data: novoAceite,
    });
  } catch (error) {
    console.error('Erro ao criar aceite_plantao:', error);
    return res.status(500).json({ message: 'Erro interno ao criar aceite_plantao.' });
  }
};

/**
 * Listar todos os aceites de plantão
 */
export const listAceitePlantoes = async (req, res) => {
  try {
    const aceites = await AceitaPlantao.find();

    if (aceites.length === 0) {
      return res.status(200).json({ message: 'Nenhum aceite_plantao encontrado.', data: [] });
    }

    return res.status(200).json({
      message: 'Lista de aceites_plantao recuperada com sucesso.',
      total: aceites.length,
      data: aceites,
    });
  } catch (error) {
    console.error('Erro ao listar aceites_plantao:', error);
    return res.status(500).json({ message: 'Erro interno ao listar aceites_plantao.' });
  }
};

/**
 * Buscar um aceite específico por ID (do MongoDB)
 */
export const getAceitePlantaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const aceite = await AceitaPlantao.findById(id);

    if (!aceite) {
      return res.status(404).json({ message: 'aceite_plantao não encontrado.' });
    }

    return res.status(200).json({
      message: 'aceite_plantao encontrado com sucesso.',
      data: aceite,
    });
  } catch (error) {
    console.error('Erro ao buscar aceite_plantao:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar aceite_plantao.' });
  }
};

/**
 * Atualizar um aceite de plantão
 */
export const updateAceitePlantao = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizados = req.body;

    const aceite = await AceitaPlantao.findByIdAndUpdate(id, dadosAtualizados, {
      new: true,
      runValidators: true,
    });

    if (!aceite) {
      return res.status(404).json({ message: 'aceite_plantao não encontrado para atualização.' });
    }

    return res.status(200).json({
      message: '✅ aceite_plantao atualizado com sucesso!',
      data: aceite,
    });
  } catch (error) {
    console.error('Erro ao atualizar aceite_plantao:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar aceite_plantao.' });
  }
};

/**
 * Deletar um aceite de plantão
 */
export const deleteAceitePlantao = async (req, res) => {
  try {
    const { id } = req.params;
    const aceite = await AceitaPlantao.findByIdAndDelete(id);

    if (!aceite) {
      return res.status(404).json({ message: 'aceite_plantao não encontrado para exclusão.' });
    }

    return res.status(200).json({
      message: '🗑️ aceite_plantao deletado com sucesso!',
      data: aceite,
    });
  } catch (error) {
    console.error('Erro ao deletar aceite_plantao:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar aceite_plantao.' });
  }
};
