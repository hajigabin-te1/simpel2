import { Router} from 'express';
import { body } from 'express-validator';
import { getUser, getUserById, createUser, updateUser, updateProfile,deleteUser } from "../controllers/user.controller.js";
import { verifyToken } from '../middleware/auth.middleware.js';
import { Izinkan } from '../middleware/role.middleware.js';
import { uploadAvatar } from '../config/cloudi.js';

const router = Router();

router.use(verifyToken);

// Profil sendiri
router.put('/profil', uploadAvatar.single('avatar'), updateProfile);

// Admin only
router.get('/', Izinkan('admin'), getUser);
router.post('/',Izinkan('admin'),[
    body('nama').notEmpty(),
    body('nimNip').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min : 6}),
    body('role').isIn(["admin","mahasiswa","dosen"])
], createUser);

router.get('/:id', Izinkan('admin'), getUserById);
router.put('/:id', Izinkan('admin'), updateUser);
router.delete('/:id', Izinkan('admin'), deleteUser);

export default router;
