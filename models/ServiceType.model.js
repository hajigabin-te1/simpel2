import mongoose from "mongoose";

// Buat schema untuk jenis layanan
const formFieldSchema = new mongoose.Schema({
    nama : { type : String, required : true },
    label : { type : String, required : true },
    tipe : { 
        type : String,
        enum : ["text", "number", "date", "select", "file"],
        default : "text",
    },
    opsi : [String], // Hanya untuk tipe "select"
    required : { type : Boolean, default : false },
    placeholder : { type : String, default : "" },
    
}, { _id : false });

// Schema utama untuk jenis layanan
const serviceTypeSchema = new mongoose.Schema({
    namaLayanan : {
        type : String,
        required : [true, "Nama layanan harus diisi"],
        unique : true,
        trim : true,
    },
    kode : {
        type : String,
        required : [true, "Kode layanan harus diisi"],
        unique : true,
        trim : true,
        uppercase : true,
    },
    deskripsi : {
        type : String,
        trim : true
    },
    icon : {
        type : String,
        default : ""
    },
    estimasiWaktu : {
        type : Number,
        default : 3 // Estimasi waktu dalam hari
    },
    formFields : [formFieldSchema], // Array untuk menyimpan field dinamis
    butuhLampiran : {
        type : Boolean,
        default : false
    },
    keteranganLampiran : {
        type : String,
        default : ""
    },
    isActive : {
        type : Boolean,
        default : true
    },
    urutan : {
        type : Number,
        default : 0
    }    
},{ timestamps : true  });

const ServiceType = mongoose.model("ServiceType", serviceTypeSchema);

export default ServiceType;