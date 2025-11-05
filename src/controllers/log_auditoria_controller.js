import { LogAuditoria } from '../models/log_auditoria_model.js';
import { Usuario } from '../models/usuario_model.js';
import { Hospital } from '../models/hospital_model.js';

// Função auxiliar para limpar campos sensíveis
function limparDados(dados) {
  if (!dados) return null;
  const copia = { ...dados };
  if (copia.senha_hash) delete copia.senha_hash;
  return copia;
}

// CREATE
export async function createLog(req, res) {
  try {
    const {
      log_id,
      usuario_id,
      hospital_id,
      entidade,
      entidade_id,
      acao,
      dados_anteriores,
      dados_posteriores,
      ip
    } = req.body;

    if (!log_id || !entidade || !entidade_id || !acao) {
      return res.status(400).json({
        error: 'Campos obrigatórios: log_id, entidade, entidade_id, acao.'
      });
    }

    const logExistente = await LogAuditoria.findOne({ log_id });
    if (logExistente) return res.status(400).json({ error: `Registro com log_id '${log_id}' já existe.` });

    if (usuario_id) {
      const usuarioExiste = await Usuario.findOne({ usuario_id });
      if (!usuarioExiste) return res.status(400).json({ error: `Usuário com usuario_id '${usuario_id}' não encontrado.` });
    }

    if (hospital_id) {
      const hospitalExiste = await Hospital.findOne({ hospital_id });
      if (!hospitalExiste) return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
    }

    const acoesValidas = ['CREATE', 'UPDATE', 'DELETE', 'ACEITAR', 'CANCELAR', 'LOGIN', 'LOGOUT'];
    if (!acoesValidas.includes(acao)) {
      return res.status(400).json({ error: `Ação inválida. Use: ${acoesValidas.join(', ')}.` });
    }

    const novoLog = await LogAuditoria.create({
      log_id,
      usuario_id: usuario_id || null,
      hospital_id: hospital_id || null,
      entidade,
      entidade_id,
      acao,
      dados_anteriores: limparDados(dados_anteriores),
      dados_posteriores: limparDados(dados_posteriores),
      ip: ip || null
    });

    res.status(201).json({
      message: 'Log de auditoria criado com sucesso.',
      log: novoLog
    });

  } catch (err) {
    console.error('Erro ao criar log de auditoria:', err);
    res.status(500).json({ error: 'Erro ao criar log de auditoria.' });
  }
}

// LIST (todos os logs) - legível
export async function listLogs(req, res) {
  try {
    let logs = await LogAuditoria.find().sort({ createdAt: -1 });

    logs = logs.map(log => ({
      log_id: log.log_id,
      usuario_id: log.usuario_id,
      hospital_id: log.hospital_id,
      entidade: log.entidade,
      entidade_id: log.entidade_id,
      acao: log.acao,
      dados_anteriores: limparDados(log.dados_anteriores),
      dados_posteriores: limparDados(log.dados_posteriores),
      ip: log.ip,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt
    }));

    res.json(logs);
  } catch (err) {
    console.error('Erro ao listar logs:', err);
    res.status(500).json({ error: 'Erro ao listar logs de auditoria.' });
  }
}

// GET (buscar log pelo log_id)
export async function getLogById(req, res) {
  try {
    const log = await LogAuditoria.findOne({ log_id: req.params.id });
    if (!log) return res.status(404).json({ error: 'Log de auditoria não encontrado.' });

    res.json({
      ...log.toObject(),
      dados_anteriores: limparDados(log.dados_anteriores),
      dados_posteriores: limparDados(log.dados_posteriores)
    });
  } catch (err) {
    console.error('Erro ao buscar log de auditoria:', err);
    res.status(500).json({ error: 'Erro ao buscar log de auditoria.' });
  }
}

// UPDATE
export async function updateLog(req, res) {
  try {
    const { usuario_id, hospital_id, entidade, entidade_id, acao, dados_anteriores, dados_posteriores, ip } = req.body;
    const update = {};

    if (usuario_id) {
      const usuarioExiste = await Usuario.findOne({ usuario_id });
      if (!usuarioExiste) return res.status(400).json({ error: `Usuário com usuario_id '${usuario_id}' não encontrado.` });
      update.usuario_id = usuario_id;
    }

    if (hospital_id) {
      const hospitalExiste = await Hospital.findOne({ hospital_id });
      if (!hospitalExiste) return res.status(400).json({ error: `Hospital com hospital_id '${hospital_id}' não encontrado.` });
      update.hospital_id = hospital_id;
    }

    if (entidade) update.entidade = entidade;
    if (entidade_id) update.entidade_id = entidade_id;

    if (acao) {
      const acoesValidas = ['CREATE', 'UPDATE', 'DELETE', 'ACEITAR', 'CANCELAR', 'LOGIN', 'LOGOUT'];
      if (!acoesValidas.includes(acao)) return res.status(400).json({ error: `Ação inválida. Use: ${acoesValidas.join(', ')}.` });
      update.acao = acao;
    }

    if (dados_anteriores) update.dados_anteriores = limparDados(dados_anteriores);
    if (dados_posteriores) update.dados_posteriores = limparDados(dados_posteriores);
    if (ip) update.ip = ip;

    const log = await LogAuditoria.findOneAndUpdate({ log_id: req.params.id }, update, { new: true });
    if (!log) return res.status(404).json({ error: 'Log de auditoria não encontrado.' });

    res.json({
      message: 'Log atualizado com sucesso.',
      log: {
        ...log.toObject(),
        dados_anteriores: limparDados(log.dados_anteriores),
        dados_posteriores: limparDados(log.dados_posteriores)
      }
    });
  } catch (err) {
    console.error('Erro ao atualizar log de auditoria:', err);
    res.status(500).json({ error: 'Erro ao atualizar log de auditoria.' });
  }
}

// DELETE
export async function deleteLog(req, res) {
  try {
    const log = await LogAuditoria.findOneAndDelete({ log_id: req.params.id });
    if (!log) return res.status(404).json({ error: 'Log de auditoria não encontrado.' });
    res.json({ message: 'Log de auditoria removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar log de auditoria:', err);
    res.status(500).json({ error: 'Erro ao deletar log de auditoria.' });
  }
}
