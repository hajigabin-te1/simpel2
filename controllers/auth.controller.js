import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.model.js';

// helper buat token
const generateToken = (user) => {
    jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }, (err, token) => {
        if (err) {
            console.log(err);
        }
        return token;
    });
}

export const register = async (req,res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {nama, nimNip, email, password, prodi, angkatan, noTelp} = req.body;

        // cek nim atau email sudah terdaftar
        const existing = await User.findOne({
            $or: [{nimNip}, {email}]
        });
        if (existing) {
            return res.status(400).json({ message: "NIM/NIP atau email sudah terdaftar" });
        }

        // Role default mahasiswa
        const user = new User({
            nama,
            nimNip,
            email,
            password,
            prodi,
            angkatan,
            noTelp,
        });
        
        await user.save();
        const token = generateToken(user);
        res.status(201).json({
            message: "Registrasi berhasil",
            success: true,
            data : { token, user }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Login
export const login  = async (req,res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({
                success : false,
                errors : errors.array()
            });
        }

        const {email, password} = req.body;
        const user = await User.findOne({email}).select('+password');
        if (!user || !(await user.comparePassword(password))){
            return res.status(401).json({
                message : "Password salah atau email tidak ditemukan",
                success: false
            });
        }
        console.table(user);

        if (!user.isActive){
            return res.status(403).json({
                message : "User tidak aktif",
                success : false
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message : "Welcome",
            success : true,
            data : {
                token, 
                user : user.toJSON()
            }
        })
    } catch (error) {
        next(error);
    }
}

// Siapa saya
export const getMe = async (req,res,next) => {
    try {
        const user = await User.findById(req.user._id);
        console.log(user);
        res.json({
            success : true,
            data : user
        })

    } catch (error) {
        next(error);
    }
}

// Ganti password 

export const ubahPass = async (req,res) => {
    try {
        const {oldPass, newPass} = req.body;
        const user = User.findById(req.user._id).select("+password");
        if (!(user.comparePassword(oldPass))) {
            return res.status(400).json({
                success : false,
                message : "Password gagal diubah"
            });
        }

        user.password = newPass;
        await user.save();

        res.status(200).json({
            success : true,
            message : "Password berhasil diubah"
        });
    } catch (error) {
        res.status(401).json({message : error});
    }
}