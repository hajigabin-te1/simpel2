import { Router } from 'express';
import { body } from 'express-validator';
import { getNotification, getRead, getReadAll } from '../controllers/notification.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import Izinkan from '../middleware/role.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/',getNotification);
router.put('/baca-semua', getReadAll);
router.patch('/:id/baca',getRead);

export default router;