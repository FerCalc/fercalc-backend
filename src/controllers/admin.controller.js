// src/controllers/admin.controller.js

import ApenEmail from '../models/apenEmail.model.js';

// ── Listar todos los correos APEN ──
export const listarCorreos = async (req, res) => {
    try {
        const correos = await ApenEmail.find().sort({ createdAt: -1 });
        res.json(correos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los correos." });
    }
};

// ── Agregar un correo individual ──
export const agregarCorreo = async (req, res) => {
    const { email, nombre } = req.body;

    if (!email) return res.status(400).json({ message: "El correo es obligatorio." });

    try {
        const emailLower = email.trim().toLowerCase();
        const existe = await ApenEmail.findOne({ email: emailLower });
        if (existe) return res.status(400).json({ message: "Este correo ya está en la lista." });

        const nuevo = new ApenEmail({
            email: emailLower,
            nombre: nombre?.trim() || null,
            agregadoPor: req.user.id,
        });
        await nuevo.save();
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar el correo." });
    }
};

// ── Carga masiva: recibe array de correos o texto con saltos de línea ──
export const cargaMasiva = async (req, res) => {
    const { correos } = req.body;
    // correos puede ser un string con saltos de línea o comas, o un array

    if (!correos) return res.status(400).json({ message: "No se recibieron correos." });

    try {
        // Parsear: aceptar string (separado por comas, punto y coma, o saltos de línea) o array
        let lista = [];
        if (Array.isArray(correos)) {
            lista = correos;
        } else {
            lista = correos.split(/[\n,;]+/);
        }

        // Limpiar y filtrar correos válidos
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const limpios = lista
            .map(e => e.trim().toLowerCase())
            .filter(e => emailRegex.test(e));

        if (limpios.length === 0) {
            return res.status(400).json({ message: "No se encontraron correos válidos en la lista." });
        }

        // Insertar ignorando duplicados (ordered: false para no frenar en duplicados)
        let agregados = 0;
        let duplicados = 0;

        for (const email of limpios) {
            const existe = await ApenEmail.findOne({ email });
            if (existe) {
                duplicados++;
            } else {
                await new ApenEmail({ email, agregadoPor: req.user.id }).save();
                agregados++;
            }
        }

        res.status(201).json({
            message: `Carga completada.`,
            agregados,
            duplicados,
            total: limpios.length,
        });

    } catch (error) {
        console.error('Error en carga masiva:', error);
        res.status(500).json({ message: "Error durante la carga masiva." });
    }
};

// ── Eliminar un correo por ID ──
export const eliminarCorreo = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await ApenEmail.findByIdAndDelete(id);
        if (!eliminado) return res.status(404).json({ message: "Correo no encontrado." });
        res.json({ message: "Correo eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el correo." });
    }
};

// ── Estadísticas rápidas ──
export const estadisticas = async (req, res) => {
    try {
        const total = await ApenEmail.countDocuments();
        const registrados = await ApenEmail.countDocuments({ registrado: true });
        const pendientes = total - registrados;
        res.json({ total, registrados, pendientes });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener estadísticas." });
    }
};
