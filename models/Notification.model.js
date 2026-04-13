import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    penerima : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "Penerima harus diisi"],
    },
    judul : {
        type : String,
        required : [true, "Judul harus diisi"],
        trim : true,
    },
    pesan : {
        type : String,
        required : true,
        trim : true
    },
    tipe : {
        type : String,
        enum : [
            "tiket_dibuat",
            "tiket_ditolak",
            "tiket_diselesaikan",
            "status_diubah",
            "informasi"
        ],
        default : "informasi",
    },
    refTiket : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Ticket",
    },
    isRead : {
        type : Boolean,
        default : false,
    },
},{ timestamps : true });

NotificationSchema.index({ penerima : 1, isRead : 1 }); // Index untuk mempercepat query notifikasi berdasarkan penerima
NotificationSchema.index({ createdAt : -1 }); // Index untuk mempercepat query notifikasi berdasarkan waktu

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;