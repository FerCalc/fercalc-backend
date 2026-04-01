// index.js (Backend)
import app from './app.js'; // ✅ Importa la app con CORS ya configurado
import { connectDB } from './db.js';

connectDB();

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});