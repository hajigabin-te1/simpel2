import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getMe, ubahPass } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';


console.log("🚀 Auth routes loaded");
const router = Router();



// route untuk login
router.post('/login', [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password harus diisi')
], login);

// route untuk register
router.post('/register', [
    body('nama').notEmpty().withMessage('Nama harus diisi'),
    body('nimNip').notEmpty().withMessage('nim / nip tidak boleh kosong'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
], register);
// router.post('/register',(req,res) => {
//     res.status(200).json({ message : "Cek File Asli" });
// })

router.get('/me',verifyToken,getMe);
router.put('/ubah-password', verifyToken,ubahPass);

export default router;

