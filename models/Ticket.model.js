import mongoose from "mongoose";

const ticketScheme = new mongoose.Schema({
    nomorTiket : {
        type : String,
        unique : true,
        // Bisa menggunakan format seperti "TKT-20240601-001"
        // Dibuat otomatis saat tiket dibuat lewat pre-save hook
    },
    mahasiswa : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "Mahasiswa harus diisi"],
    },
    operator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        // diisi otomatis oleh dari operator saat tiket diproses
    },
    jenisLayanan : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "ServiceType",
        required : [true, "Jenis layanan harus diisi"],
    },
    status : {
        type : String,
        enum : ["menunggu", "diproses", "selesai", "ditolak"],
        default : "menunggu",
    },
    prioritas : {
        type : String,
        enum : ["normal", "mendesak"],
        default : "normal", 
    },
    keterangan : {
        type : String,
        trim : true 
    },
    // Field dinamis untuk menyimpan data tambahan
    dataDinamis : {
        type : mongoose.Schema.types.Mixed,
        default : {}
    },
    lampiran : [
        {
            namaFile : String,
            urlFile : String,
            publicId : String, // untuk integrasi dengan layanan penyimpanan file seperti Cloudinary
            uploadedAt : {
                type : Date,
                default : Date.now
            }
        }
    ],
    hasilDokumen : {
        type : String,
        default : ""
    },
    catatanOperator : {
        type : String,
        default : ""
    },
    alasanPenolakan : {
        type : String,
        default : ""
    },
    tanggalSelesai : {
        type : Date,
    },
    //rating dan feedback dari mahasiswa setelah tiket selesai
    rating : {
        nilai : { type : Number, min : 1, max : 5 },
        ulasan : { type : String, trim : true },
        tanggal : { type : Date }
    }
}, { timestamps : true });

// Auto-generate nomor tiket sebelum menyimpan
ticketScheme.pre("save", async function(next) {
    if (this.isNew){
        const tahun = new Date().getFullYear();
        const bulan = String(new Date().getMonth() + 1).padStart(2, "0");
        const urutan = await mongoose.model("Ticket").countDocuments({});
        this.nomorTiket = `TKT-${tahun}${bulan}-${String(urutan + 1).padStart(3, "0")}`;
    }
    next(); 
});

ticketScheme.pre('save', function(next){
    if (this.isModified("status") && this.status === "selesai"){
        this.tanggalSelesai = new Date();
    }
    next();
});

ticketScheme.index({ nomorTiket : 1}); // Index untuk pencarian cepat berdasarkan nomor tiket
ticketScheme.index({ mahasiswa : 1 , status : 1 }); // Index untuk pencarian tiket berdasarkan mahasiswa
ticketScheme.index({ operator : 1 , status : 1 }); // Index untuk pencarian tiket berdasarkan operator
ticketScheme.index({ createdAt : -1 }); // Index untuk pencarian tiket berdasarkan tanggal pembuatan

const Ticket = mongoose.model("Ticket", ticketScheme);

export default Ticket;