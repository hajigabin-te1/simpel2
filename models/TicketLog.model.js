import mongoose from "mongoose";

const ticketLogSchema = new mongoose.Schema({
    tiket : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Ticket",
        required : [true, "Tiket harus diisi"],
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    aksi : {
        type : String,
        enum : [
            "tiket_dibuat",
            "komentar_ditambahkan",
            "lampiran_ditambahkan",
            "status_diubah"
        ],
        required : [true, "Aksi harus diisi"],
            },
    keterangan : {
        type : String 
    },
    statusLama : {
        type : String,
     },
    statusBaru : {
        type : String,
     }

},{ timestamps : true });

ticketLogSchema.index({ tiket : 1, createdAt : -1 }); // Index untuk mempercepat query log berdasarkan tiket dan waktu

const TicketLog = mongoose.model("TicketLog", ticketLogSchema);

export default TicketLog;

