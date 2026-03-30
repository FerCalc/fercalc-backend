// C:\...\mi-app-backend\src\controllers\records.controller.js

import { prisma } from '../db.js';

// --- VERIFICA QUE 'export' ESTÉ EN TODAS LAS FUNCIONES ---

export const getRecords = async (req, res, next) => {
  try {
    const records = await prisma.nutritionalRecord.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const getRecord = async (req, res, next) => {
  try {
    const record = await prisma.nutritionalRecord.findUnique({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (req, res, next) => {
  // Nuestra señal para saber que el código nuevo se está ejecutando
  console.log("--- ¡EJECUTANDO EL CÓDIGO NUEVO EN CREATE RECORD! ---");

  const { description, calories, date } = req.body;

  try {
    const dataToCreate = {
      description,
      calories,
      userId: req.user.id,
    };

    // Lógica para hacer la fecha opcional
    if (date) {
      dataToCreate.date = new Date(date);
    }

    const newRecord = await prisma.nutritionalRecord.create({
      data: dataToCreate,
    });
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("ERROR EN CREATE RECORD:", error);
    next(error);
  }
};

export const updateRecord = async (req, res, next) => {
  const { description, calories, date } = req.body;
  try {
    const dataToUpdate = {};
    if (description !== undefined) dataToUpdate.description = description;
    if (calories !== undefined) dataToUpdate.calories = calories;
    if (date !== undefined) dataToUpdate.date = date ? new Date(date) : null;

    const updatedRecord = await prisma.nutritionalRecord.update({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
      data: dataToUpdate,
    });
    res.json(updatedRecord);
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    await prisma.nutritionalRecord.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
    res.sendStatus(204); // No Content
  } catch (error) {
    next(error);
  }
};