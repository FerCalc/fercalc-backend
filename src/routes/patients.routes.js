// mi-app-backend/src/routes/patients.routes.js
import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientById,
} from '../controllers/patients.controller.js';
import {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/dietRecords.controller.js';

const router = Router();

// ── Pacientes ──
router.get('/',                 authRequired, getPatients);
router.post('/',                authRequired, createPatient);
router.get('/:id',              authRequired, getPatientById);
router.put('/:id',              authRequired, updatePatient);
router.delete('/:id',           authRequired, deletePatient);

// ── Consultas (dietRecords) de un paciente ──
router.get('/:patientId/records',       authRequired, getRecords);
router.post('/:patientId/records',      authRequired, createRecord);
router.put('/:patientId/records/:id',   authRequired, updateRecord);
router.delete('/:patientId/records/:id',authRequired, deleteRecord);

export default router;