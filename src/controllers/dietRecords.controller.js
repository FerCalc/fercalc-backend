// mi-app-backend/src/controllers/dietRecords.controller.js
import DietRecord from '../models/dietRecord.model.js';
import Patient from '../models/patient.model.js';

// Calcular métricas del snapshot para gráficos
const calcularMetricas = (data) => {
  const { patientData, dietaActual, dietGoals } = data;

  const peso = parseFloat(patientData?.weight) || null;
  const altura = parseFloat(patientData?.height) || null;
  const imc = peso && altura ? parseFloat((peso / ((altura / 100) ** 2)).toFixed(2)) : null;

  let calorias = 0, proteinas = 0, hc = 0, grasas = 0;
  let proteinasAnimales = 0;

  (dietaActual || []).forEach(item => {
    if (!item?.alimento) return;
    const factor = (item.cantidadUsada || 0) > 0 && item.alimento.cantidad > 0
      ? item.cantidadUsada / item.alimento.cantidad : 0;
    calorias += (item.alimento.calorias || 0) * factor;
    proteinas += (item.alimento.proteina || 0) * factor;
    hc += (item.alimento.hc || 0) * factor;
    grasas += (item.alimento.grasa || 0) * factor;
    if (item.alimento.origen === 'animal') {
      proteinasAnimales += (item.alimento.proteina || 0) * factor;
    }
  });

  const pavb = proteinas > 0 ? parseFloat(((proteinasAnimales / proteinas) * 100).toFixed(1)) : null;

  return {
    peso,
    altura,
    imc,
    calorias: parseFloat(calorias.toFixed(1)),
    proteinas: parseFloat(proteinas.toFixed(1)),
    hc: parseFloat(hc.toFixed(1)),
    grasas: parseFloat(grasas.toFixed(1)),
    pavb,
  };
};

export const getRecords = async (req, res) => {
  try {
    // Verificar que el paciente pertenece al usuario
    const patient = await Patient.findOne({ _id: req.params.patientId, userId: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });

    const records = await DietRecord.find({ patientId: req.params.patientId })
      .sort({ fecha: -1 })
      .lean();

    res.json(records);
  } catch (error) {
    console.error('getRecords error:', error);
    res.status(500).json({ error: 'Error al obtener consultas.' });
  }
};

export const createRecord = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, userId: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });

    const { nombre, patientData, dietGoals, dietaActual, planIntercambio, fraccionamientoData, annotations } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre de la consulta es obligatorio.' });

    const metricas = calcularMetricas({ patientData, dietaActual, dietGoals });

    const record = new DietRecord({
      userId: req.user.id,
      patientId: req.params.patientId,
      nombre: nombre.trim(),
      fecha: new Date(),
      patientData,
      dietGoals,
      dietaActual,
      planIntercambio,
      fraccionamientoData,
      annotations,
      metricas,
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('createRecord error:', error);
    res.status(500).json({ error: 'Error al guardar consulta.' });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, userId: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });

    const metricas = calcularMetricas(req.body);
    const record = await DietRecord.findOneAndUpdate(
      { _id: req.params.id, patientId: req.params.patientId },
      { ...req.body, metricas },
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Consulta no encontrada.' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar consulta.' });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, userId: req.user.id });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado.' });

    const record = await DietRecord.findOneAndDelete({
      _id: req.params.id,
      patientId: req.params.patientId,
    });
    if (!record) return res.status(404).json({ error: 'Consulta no encontrada.' });
    res.json({ message: 'Consulta eliminada.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar consulta.' });
  }
};