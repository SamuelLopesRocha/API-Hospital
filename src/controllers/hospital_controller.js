import { Hospital } from '../models/hospital_model.js';
import { registrarLog } from '../utils/log_auditoria_helper.js';

/* ===========================================================
   🏥 HOSPITAL CONTROLLER — com regras de permissão
   Regras:
   - Apenas ADMIN_SISTEMA pode criar, editar e deletar.
   - Qualquer usuário autenticado pode listar e buscar.
=========================================================== */

// CREATE
export async function createHospital(req, res) {
  try {
    // ✅ Somente ADMIN_SISTEMA pode criar
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({
        error: 'Apenas ADMIN_SISTEMA pode criar hospitais.'
      });
    }

    const { nome, cnpj, endereco, email, subdominio_url } = req.body;

    if (!nome || !cnpj || !endereco || !email) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, cnpj, endereco, email.'
      });
    }

    // 🚫 Evita duplicidade de e-mail ou CNPJ
    const existeEmail = await Hospital.findOne({ email: email.trim().toLowerCase() });
    if (existeEmail) {
      return res.status(400).json({ error: 'Já existe um hospital com este e-mail.' });
    }

    const existeCNPJ = await Hospital.findOne({ cnpj: cnpj.trim() });
    if (existeCNPJ) {
      return res.status(400).json({ error: 'Já existe um hospital com este CNPJ.' });
    }

    // 🔢 hospital_id agora é gerado automaticamente pelo pre('save')
    const novoHospital = await Hospital.create({
      nome: nome.trim(),
      cnpj: cnpj.trim(),
      endereco: endereco.trim(),
      email: email.trim().toLowerCase(),
      subdominio_url: subdominio_url?.trim() || null
    });

    // 🔥 Log de auditoria
    await registrarLog(req, 'Hospital', novoHospital.hospital_id, 'CREATE', null, novoHospital);

    res.status(201).json({
      message: 'Hospital criado com sucesso.',
      hospital: novoHospital
    });
  } catch (err) {
    console.error('Erro ao criar hospital:', err);
    res.status(500).json({ error: 'Erro ao criar hospital.' });
  }
}

// LIST
export async function listHospitals(req, res) {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    console.error('Erro ao listar hospitais:', err);
    res.status(500).json({ error: 'Erro ao listar hospitais.' });
  }
}

// GET BY ID
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
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({
        error: 'Apenas ADMIN_SISTEMA pode atualizar hospitais.'
      });
    }

    const { nome, cnpj, endereco, email, subdominio_url } = req.body;

    const hospitalAntes = await Hospital.findOne({ hospital_id: req.params.id });
    if (!hospitalAntes) {
      return res.status(404).json({ error: 'Hospital não encontrado.' });
    }

    // 🚫 Evita duplicidade ao atualizar
    if (email) {
      const emailExistente = await Hospital.findOne({ email: email.trim().toLowerCase() });
      if (emailExistente && emailExistente.hospital_id !== hospitalAntes.hospital_id) {
        return res.status(400).json({ error: 'E-mail já está em uso por outro hospital.' });
      }
    }

    if (cnpj) {
      const cnpjExistente = await Hospital.findOne({ cnpj: cnpj.trim() });
      if (cnpjExistente && cnpjExistente.hospital_id !== hospitalAntes.hospital_id) {
        return res.status(400).json({ error: 'CNPJ já está em uso por outro hospital.' });
      }
    }

    const update = {
      nome: nome?.trim() || hospitalAntes.nome,
      cnpj: cnpj?.trim() || hospitalAntes.cnpj,
      endereco: endereco?.trim() || hospitalAntes.endereco,
      email: email?.trim().toLowerCase() || hospitalAntes.email,
      subdominio_url: subdominio_url?.trim() || hospitalAntes.subdominio_url
    };

    const hospitalAtualizado = await Hospital.findOneAndUpdate(
      { hospital_id: req.params.id },
      update,
      { new: true }
    );

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
    if (!req.user || req.user.papel !== 'ADMIN_SISTEMA') {
      return res.status(403).json({
        error: 'Apenas ADMIN_SISTEMA pode deletar hospitais.'
      });
    }

    const hospital = await Hospital.findOneAndDelete({ hospital_id: req.params.id });
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital não encontrado.' });
    }

    await registrarLog(req, 'Hospital', hospital.hospital_id, 'DELETE', hospital, null);

    res.json({ message: 'Hospital removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar hospital:', err);
    res.status(500).json({ error: 'Erro ao deletar hospital.' });
  }
}
