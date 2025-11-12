import { HistoricoGestor } from '../models/historico_gestor_model.js';
import { Plantao } from '../models/plantao_model.js';
import { Aceita } from '../models/aceita_plantao_model.js';
import { Medico } from '../models/medico_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js'; // opcional, se existir

// Cria um histórico manualmente
export const createHistorico = async (req, res) => {
  try {
    const {
      CRM,
      plantao_id,
      aceita_id,
      dia,
      horario_inicio,
      horario_final,
      status,
      observacao
    } = req.body;

    // validações básicas
    if (!CRM) return res.status(400).json({ error: 'Campo CRM obrigatório.' });
    if (!plantao_id) return res.status(400).json({ error: 'Campo plantao_id obrigatório.' });
    if (!aceita_id) return res.status(400).json({ error: 'Campo aceita_id obrigatório.' });

    // verifica existência das entidades relacionadas
    const medico = await Medico.findOne({ CRM });
    if (!medico) return res.status(404).json({ error: 'Médico (CRM) não encontrado.' });

    const plantao = await Plantao.findOne({ plantao_id });
    if (!plantao) return res.status(404).json({ error: 'Plantão não encontrado.' });

    const aceite = await Aceita.findOne({ aceita_id });
    if (!aceite) return res.status(404).json({ error: 'Aceite não encontrado.' });

    // cria registro (prefere dados recebidos, senão herda do plantao)
    const novo = await HistoricoGestor.create({
      plantao_id,
      aceita_id,
      CRM,
      dia: dia ?? plantao.dia,
      horario_inicio: horario_inicio ?? plantao.horario_inicio,
      horario_final: horario_final ?? plantao.horario_final,
      status: status ?? plantao.status ?? 'DISPONIVEL',
      observacao: observacao ?? ''
    });

    // opcional: registra log de auditoria (se tiver helper)
    try { await registrarLog(req, 'Historico_Gestor', novo.historico_gestor_id, 'CREATE', null, novo); } catch(e){/* não falha a operação principal */ }

    res.status(201).json({ message: 'Histórico criado com sucesso', data: novo });
  } catch (error) {
    console.error('Erro createHistorico:', error);
    res.status(500).json({ error: 'Erro ao criar histórico', details: error.message });
  }
};

// Cria um histórico a partir de um Aceita (helper para uso interno)
export const createFromAceite = async ({ aceitaId, req = null, extra = {} } = {}) => {
  // retorno: objeto criado ou lança erro para o chamador tratar
  const aceite = await Aceita.findOne({ aceita_id: aceitaId });
  if (!aceite) throw new Error('Aceite não encontrado para gerar histórico.');

  const plantao = await Plantao.findOne({ plantao_id: aceite.plantao_id });
  if (!plantao) throw new Error('Plantão não encontrado para gerar histórico.');

  const medico = await Medico.findOne({ CRM: aceite.CRM });
  if (!medico) throw new Error('Médico (CRM) do aceite não encontrado.');

  const novo = await HistoricoGestor.create({
    plantao_id: plantao.plantao_id,
    aceita_id: aceite.aceita_id,
    CRM: aceite.CRM,
    dia: plantao.dia,
    horario_inicio: plantao.horario_inicio,
    horario_final: plantao.horario_final,
    status: extra.status ?? 'RESERVADO',
    observacao: extra.observacao ?? `Gerado a partir do aceite ${aceite.aceita_id}`
  });

  // registra log se req foi passado
  if (req) {
    try { await registrarLog(req, 'Historico_Gestor', novo.historico_gestor_id, 'CREATE_FROM_ACEITE', null, novo); } catch(e){/* ignore */ }
  }

  return novo;
};

// Listar com filtros opcionais: ?CRM=...&plantao_id=...&aceita_id=...
export const listHistoricos = async (req, res) => {
  try {
    const { CRM, plantao_id, aceita_id } = req.query;
    const filtro = {};
    if (CRM) filtro.CRM = CRM;
    if (plantao_id) filtro.plantao_id = Number(plantao_id);
    if (aceita_id) filtro.aceita_id = Number(aceita_id);

    const registros = await HistoricoGestor.find(filtro).sort({ createdAt: -1 });
    res.status(200).json(registros);
  } catch (error) {
    console.error('Erro listHistoricos:', error);
    res.status(500).json({ error: 'Erro ao listar históricos', details: error.message });
  }
};

export const getHistoricoById = async (req, res) => {
  try {
    const registro = await HistoricoGestor.findOne({ historico_gestor_id: req.params.id });
    if (!registro) return res.status(404).json({ error: 'Histórico não encontrado.' });
    res.status(200).json(registro);
  } catch (error) {
    console.error('Erro getHistoricoById:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico', details: error.message });
  }
};

export const updateHistorico = async (req, res) => {
  try {
    const atualizado = await HistoricoGestor.findOneAndUpdate(
      { historico_gestor_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!atualizado) return res.status(404).json({ error: 'Histórico não encontrado.' });

    try { await registrarLog(req, 'Historico_Gestor', atualizado.historico_gestor_id, 'UPDATE', null, atualizado); } catch(e){}

    res.status(200).json({ message: 'Histórico atualizado', data: atualizado });
  } catch (error) {
    console.error('Erro updateHistorico:', error);
    res.status(500).json({ error: 'Erro ao atualizar histórico', details: error.message });
  }
};

export const deleteHistorico = async (req, res) => {
  try {
    const removido = await HistoricoGestor.findOneAndDelete({ historico_gestor_id: req.params.id });
    if (!removido) return res.status(404).json({ error: 'Histórico não encontrado.' });

    try { await registrarLog(req, 'Historico_Gestor', removido.historico_gestor_id, 'DELETE', removido, null); } catch(e){}

    res.status(200).json({ message: 'Histórico removido' });
  } catch (error) {
    console.error('Erro deleteHistorico:', error);
    res.status(500).json({ error: 'Erro ao deletar histórico', details: error.message });
  }
};
