import { LogAuditoria } from '../models/log_auditoria_model.js';

/**
 * Registra uma ação no log de auditoria.
 * 
 * @param {Object} req - Objeto da requisição Express (usado para extrair IP e usuário logado, se houver)
 * @param {String} entidade - Nome da entidade afetada (ex: 'Usuario', 'Plantao', 'Aceita_Plantao')
 * @param {String} entidade_id - ID lógico do registro afetado
 * @param {String} acao - Ação executada ('CREATE', 'UPDATE', 'DELETE', 'ACEITAR', etc)
 * @param {Object|null} dados_anteriores - Estado anterior do registro (opcional)
 * @param {Object|null} dados_posteriores - Estado posterior do registro (opcional)
 */
export async function registrarLog(req, entidade, entidade_id, acao, dados_anteriores = null, dados_posteriores = null) {
  try {
    // Extrai IP (considera proxy reverso)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;

    // Caso o sistema use autenticação e armazene o usuário logado em req.user
    const usuario_id = req.user?.usuario_id || null;
    const hospital_id = req.user?.hospital_id || null;

    // Gera log_id único (pode ser substituído por um gerador mais robusto se quiser)
    const log_id = 'LOG' + Date.now();

    const log = await LogAuditoria.create({
      log_id,
      usuario_id,
      hospital_id,
      entidade,
      entidade_id,
      acao,
      dados_anteriores,
      dados_posteriores,
      ip,
    });

    console.log(`📝 Log registrado: [${acao}] ${entidade} (${entidade_id})`);

    return log;
  } catch (err) {
    console.error('Erro ao registrar log de auditoria:', err);
    // Não lança erro para não quebrar a operação principal
    return null;
  }
}