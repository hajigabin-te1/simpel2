import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ServiceType from "../models/ServiceType.js";

dotenv.config();

const seedUsers = [
    {
        nama : "Administrator",
        email : "moh.fathi404@gmail.com",
        password : bcrypt.hashSync("admin123", 10),
        nimNip : "0000000000",
        role : "admin",
        isActive : true
    },
    {
        nama : "Operator",
        email : "operator@mail.com",
        password : bcrypt.hashSync("operator123", 10),
        nimNip : "1111111111",
        role : "operator",
        isActive : true
    },
    {
        nama : "Eva Febriyanti",
        email : "eva_feb@gmail.com",
        password : bcrypt.hashSync("user123", 10),
        nimNip : "1234567890",
        role : "mahasiswa",
        angkatan : 2024,
        prodi : "Administrasi Publik",
        isActive : true
    }
];

const seedServiceTypes = [ 
    {
        nama : "Pengajuan Surat Keterangan Aktif Kuliah",
        kode : "SKAK",
        deskripsi : "Surat Keterangan Aktif Kuliah untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skak_icon.png",
        estimasiWaktu : 2,
        formFields : [
            {
                nama : "Tujuan Pengajuan",
                label : "Tujuan Pengajuan",
                tipe : "text",
                required : true,
                placeholder : "Masukkan tujuan pengajuan surat"
            },
            {
                nama : "Periode Aktif",
                label : "Periode Aktif",
                tipe : "select",
                opsi : ["Ganjil 2024/2025", "Genap 2024/2025", "Ganjil 2025/2026"],
                required : true,
            }
        ],
        butuhLampiran : false,
        urutan : 1
    },
    {
        nama : "Pengajuan Surat Keterangan Lulus",
        kode : "SKL",
        deskripsi : "Surat Keterangan Lulus untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skl_icon.png",
        estimasiWaktu : 5,
        formFields : [{
            nama : "Tanggal Wisuda",
            label : "Tanggal Wisuda",
            tipe : "date",
            required : true
        } 
    ],
        butuhLampiran : false,
        urutan : 2
    },
    {
        nama : "Pengajuan Permintaan Cetak Kartu Rencana Studi (KRS)",
        kode : "SKRS",
        deskripsi : "Surat Kartu Rencana Studi untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skrs_icon.png",
        estimasiWaktu : 1,
        formFields : [],
        butuhLampiran : false,
        urutan : 3
    },
    {
        nama : "Pengajuan Surat Kartu Hasil Studi (KHS)",
        kode : "SKHS",
        deskripsi : "Surat Kartu Hasil Studi untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skhs_icon.png",
        estimasiWaktu : 1,
        formFields : [],
        butuhLampiran : false,
        urutan : 4
    },{
        nama : "Permohonan Cetak Transkrip Nilai",
        kode : "SCTN",
        deskripsi : "Surat Cetak Transkrip Nilai untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/sctn_icon.png",
        estimasiWaktu : 3,
        formFields : [],
        butuhLampiran : false,
        urutan : 5
    },
    {
        nama : "Pengajuan Surat Keterangan Penelitian",
        kode : "SKP",
        deskripsi : "Surat Keterangan Penelitian untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skp_icon.png",
        estimasiWaktu : 3,
        formFields : [{
            nama : "Judul Penelitian",
            label : "Judul Penelitian",
            tipe : "text",
            required : true,
            placeholder : "Masukkan judul penelitian"
        },{
            nama : "Tujuan Pengajuan",
            label : "Tujuan Pengajuan",
            tipe : "text",
            required : true,
            placeholder : "Masukkan tujuan pengajuan surat"
        },{
            nama : "Tanggal Mulai Penelitian",
            label : "Tanggal Mulai Penelitian",
            tipe : "date",
        },{
            nama : "Tanggal Selesai Penelitian",
            label : "Tanggal Selesai Penelitian",
            tipe : "date",
        },{
            nama : "Tempat Penelitian",
            label : "Tempat Penelitian",
            tipe : "text",
            required : true,
            placeholder : "Masukkan tempat penelitian"
        }],
        urutan : 6
    },{
        nama : "Pengajuan Surat Keterangan Magang",
        kode : "SKM",
        deskripsi : "Surat Keterangan Magang untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skm_icon.png",
        estimasiWaktu : 3,
        formFields : [{
            nama : "Nama Perusahaan / Instansi",
            label : "Nama Perusahaan / Instansi",
            tipe : "text",
            required : true,
            placeholder : "Masukkan nama perusahaan atau instansi"
        }],
        urutan : 7,
        butuhLampiran : true,
        keteranganLampiran : "Lampirkan surat penerimaan magang dari perusahaan atau instansi dan bukti pembayaran biaya administrasi magang"    
    },{
        nama : "Pengajuan Surat Keterangan Bebas Perpustakaan",
        kode : "SKBP",
        deskripsi : "Surat Keterangan Bebas Perpustakaan untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skbp_icon.png",
        estimasiWaktu : 1,
        formFields : [],
        butuhLampiran : false,
        urutan : 8
    },{
        nama : "Pengajuan Surat Keterangan Publikasi Ilmiah",
        kode : "SKPI",
        deskripsi : "Surat Keterangan Publikasi Ilmiah untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/skpi_icon.png",
        estimasiWaktu : 3,
        formFields : [{
            nama : "Judul Publikasi",
            label : "Judul Publikasi",
            tipe : "text",
            required : true,
            placeholder : "Masukkan judul publikasi ilmiah"
        },{
            nama : "Nama Jurnal / Konferensi",
            label : "Nama Jurnal / Konferensi",
            tipe : "text",
            required : true,
            placeholder : "Masukkan nama jurnal atau konferensi tempat publikasi ilmiah"
        }],
        butuhLampiran : true,
        keteranganLampiran : "Lampirkan bukti publikasi ilmiah seperti link jurnal atau sertifikat konferensi",
        urutan : 9
    },{
        nama : "Surat Peminjaman Ruangan",
        kode : "SPR",
        deskripsi : "Surat Peminjaman Ruangan untuk keperluan administrasi kampus",
        icon : "https://res.cloudinary.com/dwbujbyjb/image/upload/v1700000000/spr_icon.png",
        estimasiWaktu : 1,
        formFields : [{
            nama : "Nama Ruangan",
            label : "Nama Ruangan",
            tipe : "text",
            required : true,
            placeholder : "Masukkan nama ruangan yang ingin dipinjam"
        },{
            nama : "Tanggal Peminjaman",
            label : "Tanggal Peminjaman",
            tipe : "date",
        },{
            nama : "Waktu Peminjaman",
            label : "Waktu Peminjaman",
            tipe : "text",
            placeholder : "Masukkan waktu peminjaman (misal: 09.00-12.00)"
        },{
            nama : "Keperluan Peminjaman",
            label : "Keperluan Peminjaman",
            tipe : "text",
            required : true,
            placeholder : "Masukkan keperluan peminjaman ruangan"
        },{
            nama : "Jumlah Peserta",
            label : "Jumlah Peserta",
            tipe : "number",
        }],
        butuhLampiran : true,
        keteranganLampiran : "Lampiran Surat Pengajuan resmi dari organisasi atau lembaga yang meminjam ruangan",
        urutan : 10
    }
];

const runSeed = async () => {
    try {
        await   mongoose.connect(process.env.MONGO_URI, { dbName : "batin_hub" });
        console.log("Connected to MongoDB");

        // Hapus data lama
        await Promise.all([
            User.deleteMany({}),
            ServiceType.deleteMany({})
        ]);
        console.log("Data lama berhasil dihapus");
        // Masukkan data baru
        await User.insertMany(seedUsers);
        await ServiceType.insertMany(seedServiceTypes);
        console.log("Data baru berhasil dimasukkan");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

runSeed();

// Seeder ini akan menghapus semua data lama dan menggantinya dengan data baru yang sudah ditentukan. Pastikan untuk menjalankan seeder ini hanya saat pengembangan atau saat ingin mereset database, karena data lama akan hilang.