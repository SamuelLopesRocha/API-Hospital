import { Aceita } from '../models/aceita_plantao_model.js';
import { Plantao } from '../models/plantao_model.js';
import { Medico } from '../models/medico_model.js';
import { HistoricoGestor } from '../models/historico_gestor_model.js';
import { HistoricoMedico } from '../models/historico_medico_model.js'; // 👈 novo import

// Criar aceite e gerar histórico automaticamente
export const createAceitePlantao = async (req, res) => {
  try {
    const { CRM, plantao_id, status, motivo_rejeicao } = req.body;

    // Verifica campos obrigatórios
    if (!CRM) {
      return res.status(400).json({ error: 'O campo CRM é obrigatório.' });
    }
    if (!plantao_id) {
      return res.status(400).json({ error: 'O campo plantao_id é obrigatório.' });
    }

    // Verifica se o médico existe
    const medico = await Medico.findOne({ CRM });
    if (!medico) {
      return res.status(404).json({ error: 'O médico com o CRM informado não existe.' });
    }

    // Verifica se o plantão existe
    const plantao = await Plantao.findOne({ plantao_id });
    if (!plantao) {
      return res.status(404).json({ error: 'O plantão informado não existe.' });
    }

    // Cria o aceite
    const novoAceite = await Aceita.create({
      CRM,
      plantao_id,
      status,
      motivo_rejeicao,
      dia: plantao.dia,
      horario_inicio: plantao.horario_inicio,
      horario_final: plantao.horario_final,
      hospital_id: plantao.hospital_id,
    });

    // Cria automaticamente o histórico do GESTOR
    await HistoricoGestor.create({
      aceita_plantao_id: novoAceite.aceita_id,
      plantao_id: plantao.plantao_id,
      CRM: CRM,
      dia: plantao.dia,
      horario_inicio: plantao.horario_inicio,
      horario_final: plantao.horario_final,
      status: status || 'DISPONIVEL',
      observacao: motivo_rejeicao || '',
    });

    // Cria automaticamente o histórico do MÉDICO
    await HistoricoMedico.create({
      aceita_plantao_id: novoAceite.aceita_id,
      hospital_id: plantao.hospital_id,
      CRM: CRM,
      dia: plantao.dia,
      horario_inicio: plantao.horario_inicio,
      horario_final: plantao.horario_final,
      status: status || 'ACEITO',
      observacao: motivo_rejeicao || '',
    });

    res.status(201).json({
      message: 'Aceite criado com sucesso e registrados os históricos (gestor e médico).',
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
