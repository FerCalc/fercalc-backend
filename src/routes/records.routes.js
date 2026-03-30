// src/routes/records.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// <-- ¡CORRECCIÓN DEFINITIVA AQUÍ! Se usan las llaves {}
const { authenticateToken } = require('../middlewares/auth.middleware.js');

// La línea 13 ahora funcionará
router.get('/', authenticateToken, async (req, res) => {
  try {
    const records = await prisma.record.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los registros', error: error.message });
  }
});

// ... el resto de tus rutas (POST, PUT, DELETE) ...
// Asegúrate de que todas usan `authenticateToken` como middleware

router.post('/', authenticateToken, async (req, res) => {
  // ... tu código ...
});

router.put('/:id', authenticateToken, async (req, res) => {
  // ... tu código ...
});

router.delete('/:id', authenticateToken, async (req, res) => {
  // ... tu código ...
});


module.exports = router;