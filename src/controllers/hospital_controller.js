import { Hospital } from '../models/hospital_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js';

/* ===========================================================
   🏥 HOSPITAL CONTROLLER — com regras de permissão
   Regras:
   - Somente ADMIN_SISTEMA pode criar, editar e deletar.
   - Qualquer usuário autenticado pode listar e buscar.
=========================================================== */

// CREATE
export async function createHospital(req, res) {
  try {
    // ✅ Regra de negócio
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({
        error: 'Apenas ADMIN_SISTEMA pode criar hospitais.'
      });
    }

    const { hospital_id, nome, cnpj, endereco, email, subdominio_url } = req.body;

    if (!hospital_id || !nome || !cnpj || !endereco || !email) {
      return res.status(400).json({
        error: 'Campos obrigatórios: hospital_id, nome, cnpj, endereco, email.'
      });
    }

    const hospital = await Hospital.create({
      hospital_id,
      nome,
      cnpj,
      endereco,
      email,
      subdominio_url
    });

    // 🔥 Log de auditoria
    await registrarLog(req, 'Hospital', hospital.hospital_id, 'CREATE', null, hospital);

    res.status(201).json({ message: 'Hospital criado com sucesso.', hospital });
  } catch (err) {
    console.error('Erro ao criar hospital:', err);
    res.status(500).json({ error: 'Erro ao criar hospital.' });
  }
}

// LIST (todos os hospitais)
export async function listHospitals(req, res) {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    console.error('Erro ao listar hospitais:', err);
    res.status(500).json({ error: 'Erro ao listar hospitais.' });
  }
}

// GET (buscar hospital pelo ID)
export async function getHospitalById(req, res) {
  try {
    const hospital = await Hospital.findOne({ hospital_id: req.params.id });
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital não encontrado.' });
    }
    res.json(hospital);
  } catch (err) {
    console.error('Erro ao buscar hospital:', err);
    res.status(500).json({ error: 'Erro ao buscar hospital.' });
  }
}

// UPDATE
export async function updateHospital(req, res) {
  try {
    // ✅ Regra de negócio
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({
        error: 'Apenas ADMIN_SISTEMA pode atualizar hospitais.'
      });
    }

    const { nome, cnpj, endereco, email, subdominio_url } = req.body;
    const update = { nome, cnpj, endereco, email, subdominio_url };

    const hospitalAntes = await Hospital.findOne({ hospital_id: req.params.id });
    if (!hospitalAntes) {
      return res.status(404).json({ error: 'Hospital não encontrado.' });
    }

    const hospitalAtualizado = await Hospital.findOneAndUpdate(
      { hospital_id: req.params.id },
      update,
      { new: true }
    );

    // 🔥 Log de auditoria
    await registrarLog(req, 'Hospital', hospitalAtualizado.hospital_id, 'UPDATE', hospitalAntes, hospitalAtualizado);

    res.json({ message: 'Hospital atualizado com sucesso.', hospital: hospitalAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar hospital:', err);
    res.status(500).json({ error: 'Erro ao atualizar hospital.' });
  }
}

// DELETE
export async function deleteHospital(req, res) {
  try {
    // ✅ Regra de negócio
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({
        error: 'Apenas ADMIN_SISTEMA pode deletar hospitais.'
      });
    }

    const hospital = await Hospital.findOneAndDelete({ hospital_id: req.params.id });
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital não encontrado.' });
    }

    // 🔥 Log de auditoria
    await registrarLog(req, 'Hospital', hospital.hospital_id, 'DELETE', hospital, null);

    res.json({ message: 'Hospital removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar hospital:', err);
    res.status(500).json({ error: 'Erro ao deletar hospital.' });
  }
}