import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

let io;

export const initSocket = (Httpserver) => {
    io = new Server(Httpserver,{
        cors : {
            origin : "*", //nanti ganti ke frontend url
            credentials : true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("Token tidak ditemukan"));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user || !user.isActive)  {
                return next(new Error("User tidak valid"));
            }
            socket.user = user;
            next();
        } catch (error) {
            return next(new Error("Token tidak valid"));
        }
    } );

    io.on("connection", (socket) => { 
        const { user } = socket;
        // lakukan console log untuk memastikan user yang terhubung
        console.log(`User ${user.username} connected with socket ID: ${socket.id}`);
        socket.join(`user : ${user._id}`); // Join room khusus untuk user sekarang
        socket.join(`role : ${user.role}`); // Join room berdasarkan role

        // Operator bisa gabung ke room antrian
        if (["operator", "admin"].includes(user.role)) {
            socket.join("loket");
        }
        // cek user tidak terputus koneksinya
        socket.on("disconnect", () => { 
            console.log(`User ${user.username} disconnected from socket ID: ${socket.id}`);
        } );
        // Event operator menandai tiket
        socket.on("tangani_tiket", (tiketId) => {
            io.to('loket').emit("tiket_ditangani", {
                tiketId,
                operator : {
                    id : user._id,
                    username : user.username
                }
            });
        });
    } );
return io;
}

// Getter untuk bisa dipakai di controller lain
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io belum diinisialisasi");
    }
    return io;
}

