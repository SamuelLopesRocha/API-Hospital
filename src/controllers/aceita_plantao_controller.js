import AceitaPlantao from '../models/aceita_plantao_model.js';
import { Plantao } from '../models/plantao_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js';

const STATUS_PERMITIDOS = ['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO'];

/**
 * MÉDICO cria um aceite de plantão
 */
export async function createAceitePlantao(req, res) {
  try {
    // ✅ apenas médico autenticado pode criar
    if (!req.medico || req.medico.papel !== 'MEDICO') {
      return res.status(403).json({ message: 'Apenas médicos podem aceitar plantões.' });
    }

    const { plantao_id } = req.body;

    if (!plantao_id) {
      return res.status(400).json({ message: 'O campo plantao_id é obrigatório.' });
    }

    const plantao = await Plantao.findOne({ plantao_id });
    if (!plantao) {
      return res.status(404).json({ message: 'Plantão não encontrado.' });
    }

    const ultimo = await AceitaPlantao.findOne().sort({ aceite_id: -1 });
    const proximoId = ultimo ? ultimo.aceite_id + 1 : 1;

    const novoAceite = await AceitaPlantao.create({
      aceite_id: proximoId,
      plantao_id: plantao_id,
      medico_id: req.medico.medico_id, // ✅ agora correto
      dia: plantao.dia,
      horario_inicio: plantao.horario_inicio,
      horario_final: plantao.horario_final,
      status: 'PENDENTE',
      motivo_rejeicao: null,
    });

    await registrarLog(req, 'AceitaPlantao', novoAceite.aceite_id, 'CREATE', null, novoAceite.toJSON());

    return res.status(201).json({
      message: 'Aceite de plantão criado com sucesso.',
      aceite: novoAceite,
    });
  } catch (err) {
    console.error('Erro ao criar aceite de plantão:', err);
    return res.status(500).json({ message: 'Erro interno ao criar aceite de plantão.' });
  }
}


/**
 * LIST – listar todos
 */
export async function listAceitePlantoes(req, res) {
  try {
    const aceites = await AceitaPlantao.find().sort({ createdAt: -1 });
    return res.status(200).json(aceites);
  } catch (err) {
    console.error('Erro ao listar aceites de plantão:', err);
    return res.status(500).json({ message: 'Erro interno ao listar aceites.' });
  }
}

/**
 * GET por ID
 */
export async function getAceitePlantaoById(req, res) {
  try {
    const id = req.params.id;
    let aceite = null;

    if (!Number.isNaN(Number(id))) {
      aceite = await AceitaPlantao.findOne({ aceite_id: Number(id) });
    } else {
      aceite = await AceitaPlantao.findById(id);
    }

    if (!aceite) return res.status(404).json({ message: 'Aceite não encontrado.' });
    return res.status(200).json(aceite);
  } catch (err) {
    console.error('Erro ao buscar aceite de plantão:', err);
    return res.status(500).json({ message: 'Erro interno ao buscar aceite.' });
  }
}

/**
 * UPDATE – apenas GESTOR pode editar (status e motivo_rejeicao)
 */
export async function updateAceitePlantao(req, res) {
  try {
    // ✅ apenas gestor autenticado pode alterar
    if (!req.user || req.user.papel !== 'GESTOR') {
      return res.status(403).json({ message: 'Apenas gestores podem alterar aceites de plantão.' });
    }

    const { status, motivo_rejeicao } = req.body;
    const update = {};

    // ✅ só permite alterar status e motivo_rejeicao
    if (status) {
      if (!STATUS_PERMITIDOS.includes(status)) {
        return res.status(400).json({
          message: `Status inválido. Use um dos: ${STATUS_PERMITIDOS.join(', ')}.`,
        });
      }
      update.status = status;
    }

    if (motivo_rejeicao !== undefined) update.motivo_rejeicao = motivo_rejeicao;

    let aceiteAtualizado = null;
    if (!Number.isNaN(Number(req.params.id))) {
      aceiteAtualizado = await AceitaPlantao.findOneAndUpdate(
        { aceite_id: Number(req.params.id) },
        update,
        { new: true, runValidators: true }
      );
    }
    if (!aceiteAtualizado) {
      aceiteAtualizado = await AceitaPlantao.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      });
    }

    if (!aceiteAtualizado) {
      return res.status(404).json({ message: 'Aceite não encontrado.' });
    }

    // ✅ log de atualização
    await registrarLog(req, 'AceitaPlantao', aceiteAtualizado.aceite_id, 'UPDATE', null, aceiteAtualizado.toJSON());

    return res.status(200).json({
      message: 'Aceite atualizado com sucesso.',
      aceite: aceiteAtualizado,
    });
  } catch (err) {
    console.error('Erro ao atualizar aceite de plantão:', err);
    return res.status(500).json({ message: 'Erro interno ao atualizar aceite.' });
  }
}

/**
 * DELETE
 */
export async function deleteAceitePlantao(req, res) {
  try {
    let removido = null;
    if (!Number.isNaN(Number(req.params.id))) {
      removido = await AceitaPlantao.findOneAndDelete({ aceite_id: Number(req.params.id) });
    }
    if (!removido) {
      removido = await AceitaPlantao.findByIdAndDelete(req.params.id);
    }

    if (!removido) return res.status(404).json({ message: 'Aceite não encontrado.' });

    await registrarLog(req, 'AceitaPlantao', removido.aceite_id, 'DELETE', removido.toJSON(), null);

    return res.status(200).json({ message: 'Aceite removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar aceite de plantão:', err);
    return res.status(500).json({ message: 'Erro interno ao deletar aceite.' });
  }
}
