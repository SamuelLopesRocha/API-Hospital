import { Medico } from '../models/medico_model.js';
import { HistoricoMedico } from '../models/historico_medico_model.js';

// Listar histórico do médico pelo CRM
export const getHistoricoMedicoByCRM = async (req, res) => {
  try {
    const { crm } = req.params;

    const medico = await Medico.findOne({ CRM: crm });
    if (!medico) {
      return res.status(404).json({ error: 'Médico não encontrado com o CRM informado.' });
    }

    const historicos = await HistoricoMedico.find({ CRM: crm });

    if (historicos.length === 0) {
      return res.status(200).json({ message: 'Nenhum histórico encontrado para este médico.' });
    }

    res.status(200).json(historicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico do médico.', details: error.message });
  }
};
