import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Verifikasi JWT token
export const verifyToken = async (req, res, next) => {
try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) { return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
    });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
    return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan.',
    });
    }

    if (!user.isActive) {
    return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan.',
    });
    }

    req.user = user;
    next();
} catch (error) {
    if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token sudah kedaluwarsa.' });
    }
    if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token tidak valid.' });
    }
    next(error);
}
};