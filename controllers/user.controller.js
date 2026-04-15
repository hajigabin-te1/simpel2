import { validationResult } from "express-validator";
import User from "../models/User.model.js";

// Get User (admin only)
export const getUser = async (req,res) => {
    try { 
        const { role, isActive, search, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { nimNip : { $regex: search, $options: 'i' }  },
                { email: { $regex: search, $options: 'i' }}
            ]
        }
        const skip = Number((page - 1) * limit);
        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
        .sort({ createdAt : -1 }).skip(skip).limit(Number(limit));
        res.json({
            succes : true,
            data : users,
            pagination : {
                total,
                page : Number(page),
                limit : Number(limit),
                totalPages : Math.ceil(total / limit)
            }
        })
    } catch (error){
            next(error);    
        }
}

// ── GET /api/users/:id ───────────────────
export const getUserById = async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch(error){
        next(error);
    }
}

export const createUser = async (req,res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { username, email, password, nimNip, role , prodi, angkatan, noTelp} = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { nimNip }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or NIM/NIP already exists' });
        }
        const newUser = new User({ username, email, password, nimNip, role, prodi, angkatan, noTelp });
        await newUser.save();
        res.status(201).json({ success: true, data: newUser });

    } catch (error){
        next(error);
    }
}

// update data user
export const updateUser = async (req,res) => {
    try {
        //cegah update data user lain
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { password, ...updateData } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new : true,
        runValidators : true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch(error){
        next(error);
    }
}

// delete disini maksudnya untuk menonaktifkan user, bukan menghapus data user dari database. Jadi data user tetap ada, tapi tidak bisa digunakan untuk login atau aktivitas lainnya.
export const deleteUser = async (req,res) => {
    try { 
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deactivated successfully', data: user });
    } catch (error){
        next(error);
    }
}

// Update profil user (user sendiri)
export const updateProfile = async (req,res) => {
    try {
        const bolehUpdate = ['nama', 'prodi', 'avatar', 'noTelp'];
        const updateData = {};
        bolehUpdate.forEach( f => {
            if ( req.body !== undefined) updateData[f] = req.body[f];
        });
        //upload avatar
        if (req.file) {
            updateData.avatar = req.file.path;
        }
        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new : true});
        res.json({ success: true, message : "Profil Berhasil diperbaharui" , data: user });
    } catch (error) {
        next(error);
    }
}