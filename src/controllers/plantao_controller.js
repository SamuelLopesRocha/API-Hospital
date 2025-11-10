import { Plantao } from '../models/plantao_model.js';
import { Hospital } from '../models/hospital_model.js';
import { Usuario } from '../models/usuario_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js';

// ✅ CREATE (somente GESTOR pode criar)
export async function createPlantao(req, res) {
  try {
    if (req.user?.papel !== 'GESTOR') {
      return res.status(403).json({ error: 'Apenas GESTOR pode criar plantões.' });
    }

    const {
      hospital_id,
      titulo,
      descricao,
      dia,
      horario_inicio,
      horario_final,
      cargo_requerido,
      tipo,
      valor,
      status
    } = req.body;

    // 🧩 Validação de campos obrigatórios
    if (!hospital_id || !titulo || !dia || !horario_inicio || !horario_final || !cargo_requerido || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // 📅 Valida formato do dia
    const regexDia = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexDia.test(dia)) {
      return res.status(400).json({ error: "O campo 'dia' deve estar no formato dd/mm/aaaa." });
    }

    // ⏰ Valida formato do horário
    const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!regexHora.test(horario_inicio) || !regexHora.test(horario_final)) {
      return res.status(400).json({ error: "Os campos 'horario_inicio' e 'horario_final' devem estar no formato HH:MM (24h)." });
    }

    // 🏥 Valida hospital existente
    const hospitalExists = await Hospital.findOne({ hospital_id });
    if (!hospitalExists)
      return res.status(400).json({ error: `Hospital '${hospital_id}' não encontrado.` });

    // 👤 Valida gestor logado
    const gestor = await Usuario.findOne({ usuario_id: req.user.usuario_id });
    if (!gestor)
      return res.status(400).json({ error: `Usuário '${req.user.usuario_id}' não encontrado.` });

    // 🔢 Gera ID sequencial
    const ultimo = await Plantao.findOne().sort({ plantao_id: -1 });
    const proximoId = ultimo ? ultimo.plantao_id + 1 : 1;

    // 🆕 Criação do plantão
    const novoPlantao = await Plantao.create({
      plantao_id: proximoId,
      hospital_id,
      gestor_id: req.user.usuario_id,
      titulo: titulo.trim(),
      descricao: descricao?.trim(),
      dia: dia.trim(),
      horario_inicio: horario_inicio.trim(),
      horario_final: horario_final.trim(),
      cargo_requerido: cargo_requerido.trim(),
      tipo: tipo.trim(),
      valor: valor !== undefined ? valor : 0.0,
      status: status || 'DISPONIVEL',
    });

    await registrarLog(req, 'Plantao', novoPlantao.plantao_id, 'CREATE', null, novoPlantao.toJSON());

    res.status(201).json({
      message: 'Plantão criado com sucesso.',
      plantao: novoPlantao,
    });
  } catch (err) {
    console.error('Erro ao criar plantão:', err);
    res.status(500).json({ error: 'Erro ao criar plantão.' });
  }
}

// 📋 LIST
export async function listPlantoes(req, res) {
  try {
    const plantoes = await Plantao.find().sort({ createdAt: -1 });
    res.json(plantoes);
  } catch (err) {
    console.error('Erro ao listar plantões:', err);
    res.status(500).json({ error: 'Erro ao listar plantões.' });
  }
}

// 🔍 GET BY ID
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

// ✏️ UPDATE (somente GESTOR)
export async function updatePlantao(req, res) {
  try {
    if (req.user?.papel !== 'GESTOR')
      return res.status(403).json({ error: 'Apenas GESTOR pode atualizar plantões.' });

    const {
      hospital_id,
      titulo,
      descricao,
      dia,
      horario_inicio,
      horario_final,
      cargo_requerido,
      tipo,
      valor,
      status
    } = req.body;

    const plantaoAntes = await Plantao.findOne({ plantao_id: req.params.id });
    if (!plantaoAntes) return res.status(404).json({ error: 'Plantão não encontrado.' });

    const update = {
      titulo,
      descricao,
      dia,
      horario_inicio,
      horario_final,
      cargo_requerido,
      tipo,
      valor,
      status
    };

    // 🏥 Se alterar hospital, valida se existe
    if (hospital_id) {
      const hospitalExists = await Hospital.findOne({ hospital_id });
      if (!hospitalExists)
        return res.status(400).json({ error: `Hospital '${hospital_id}' não encontrado.` });
      update.hospital_id = hospital_id;
    }

    const plantaoAtualizado = await Plantao.findOneAndUpdate(
      { plantao_id: req.params.id },
      update,
      { new: true }
    );

    await registrarLog(req, 'Plantao', plantaoAtualizado.plantao_id, 'UPDATE', plantaoAntes, plantaoAtualizado);

    res.json({ message: 'Plantão atualizado com sucesso.', plantao: plantaoAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar plantão:', err);
    res.status(500).json({ error: 'Erro ao atualizar plantão.' });
  }
}

// ❌ DELETE (somente GESTOR)
export async function deletePlantao(req, res) {
  try {
    if (req.user?.papel !== 'GESTOR')
      return res.status(403).json({ error: 'Apenas GESTOR pode deletar plantões.' });

    const plantao = await Plantao.findOne({ plantao_id: req.params.id });
    if (!plantao) return res.status(404).json({ error: 'Plantão não encontrado.' });

    await Plantao.findOneAndDelete({ plantao_id: req.params.id });
    await registrarLog(req, 'Plantao', plantao.plantao_id, 'DELETE', plantao, null);

    res.json({ message: 'Plantão removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar plantão:', err);
    res.status(500).json({ error: 'Erro ao deletar plantão.' });
  }
}
