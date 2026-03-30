// src/models/user.model.js (CORREGIDO PARA ES MODULES)

import mongoose from 'mongoose'; // Usamos import

// Definición del esquema (la estructura) para un usuario
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true, // Elimina espacios en blanco al principio y al final
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Asegura que no haya dos usuarios con el mismo email
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
});

// Exportamos el modelo usando 'export default'
export default mongoose.model('User', userSchema);