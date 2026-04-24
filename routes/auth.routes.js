import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getMe, ubahPass } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// route untuk register
router.post('/register', [
    body('nama').notEmpty().withMessage('Nama harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
], register);

// route untuk login
router.post('/login', [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password harus diisi')
], login);

router.get('/me',verifyToken,getMe);
router.put('/ubah-password', verifyToken,ubahPass);

export default router;

