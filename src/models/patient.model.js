// mi-app-backend/src/models/patient.model.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },
  telefono: { type: String, trim: true, default: '' },
  fechaNacimiento: { type: Date, default: null },
  sexo: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], default: 'Masculino' },
  notas: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);