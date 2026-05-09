import { Router } from 'express';
import { body } from 'express-validator';
import { getSummary, eksporLaporan } from '../controllers/report.controller.js';
import { Izinkan } from '../middleware/role.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyToken, Izinkan('operator','admin'));

router.get('summary', getSummary);
router.get('export', eksporLaporan);

export default router;