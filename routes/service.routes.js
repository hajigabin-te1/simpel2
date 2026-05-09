import { Router } from 'express';
import { body } from 'express-validator';
import { getService, getServiceById, createService,updateService, deleteService } from '../controllers/service.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { Izinkan } from '../middleware/role.middleware.js';

const router = Router();

//router.use(verifyToken);

router.get('/', getService);
router.get('/:id', getServiceById);
router.post('/', Izinkan('admin'),[
    body('namaLayanan').notEmpty(),
    body('kode').notEmpty()
],createService);
router.put('/:id', Izinkan('admin'), updateService);
router.delete('/:id',Izinkan('admin'), deleteService);

export default router;