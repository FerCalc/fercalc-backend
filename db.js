// db.js (CORREGIDO)

// 1. Cambiamos 'require' por 'import'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Es una buena práctica cargar las variables de entorno al principio
dotenv.config();

// 2. Cambiamos 'module.exports' por 'export const' directamente en la función
export const connectDB = async () => {
    try {
        // Nos aseguramos de que MONGODB_URI esté cargado
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI no está definido en las variables de entorno. Revisa tu archivo .env");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(">>> Conectado a MongoDB"); // Mensaje corregido para coincidir con tu log original
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error.message);
        process.exit(1); // Detiene la aplicación si no se puede conectar
    }
};