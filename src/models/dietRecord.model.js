// mi-app-backend/src/models/dietRecord.model.js
import mongoose from 'mongoose';

// Snapshot completo del estado de FerCalc en una consulta
const dietRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  nombre: { type: String, required: true, trim: true }, // nombre de la consulta
  fecha: { type: Date, default: Date.now },

  // Snapshot de datos del paciente en esa consulta
  patientData: {
    weight: Number,
    height: Number,
    age: Number,
    sex: String,
  },

  // Objetivos nutricionales
  dietGoals: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Dieta desarrollada
  dietaActual: { type: mongoose.Schema.Types.Mixed, default: [] },

  // Plan intercambio
  planIntercambio: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Fraccionamiento
  fraccionamientoData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Anotaciones
  annotations: { type: String, default: '' },

  // Métricas calculadas para gráficos (se calculan al guardar)
  metricas: {
    peso: { type: Number, default: null },
    altura: { type: Number, default: null },
    imc: { type: Number, default: null },
    calorias: { type: Number, default: null },
    proteinas: { type: Number, default: null },
    hc: { type: Number, default: null },
    grasas: { type: Number, default: null },
    pavb: { type: Number, default: null }, // porcentaje
  },
}, { timestamps: true });

export default mongoose.model('DietRecord', dietRecordSchema);