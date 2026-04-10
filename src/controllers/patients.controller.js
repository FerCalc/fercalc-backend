// mi-app-backend/src/controllers/patients.controller.js
import Patient from '../models/patient.model.js';
import DietRecord from '../models/dietRecord.model.js';

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    // Agregar conteo de consultas a cada paciente
    const patientsWithCount = await Promise.all(
      patients.map(async (p) => {
        const count = await DietRecord.countDocuments({ patientId: p._id });
        const lastRecord = await DietRecord.findOne({ patientId: p._id })
          .sort({ fecha: -1 })
          .select('fecha metricas nombre')
          .lean();
        return { ...p, consultaCount: count, ultimaConsulta: lastRecord };
      })
    );

    res.json(patientsWithCount);
  } catch (error) {
    console.error('getPatients error:', error);
    res.status(500).json({ error: 'Error al obtener pacientes.' });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, userId: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener paciente.' });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, fechaNacimiento, sexo, notas } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio.' });

    const patient = new Patient({
      userId: req.user.id,
      nombre: nombre.trim(),
      apellido: apellido?.trim() || '',
      email: email?.trim() || '',
      telefono: telefono?.trim() || '',
      fechaNacimiento: fechaNacimiento || null,
      sexo: sexo || 'Masculino',
      notas: notas || '',
    });

    const saved = await patient.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('createPatient error:', error);
    res.status(500).json({ error: 'Error al crear paciente.' });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paciente.' });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });
    // Eliminar todas las consultas del paciente
    await DietRecord.deleteMany({ patientId: req.params.id });
    res.json({ message: 'Paciente y sus consultas eliminados.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar paciente.' });
  }
};