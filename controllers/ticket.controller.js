import Ticket from '../models/Ticket.model.js';
import { validationResult } from 'express-validator';
import TicketLog from '../models/TicketLog.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { getIO } from '../socket/socketHandler.js';
import { kirimNotifikasiEmail } from '../utils/sendEmail.js';

// Helper untuk membuat log & kirim notifkasi secara real-time
const catatanLog = async ({tiketId, userId, aksi, keterangan, statusLama, statusBaru}) => { 
await TicketLog.create({ 
    tiket : tiketId,
    user : userId,
    aksi,
    keterangan,
    statusLama,
    statusBaru
});
};

// Helper untuk kirim notifikasi real-time dan simpan ke database
const kirimNotif = async ({penerimaId, judul, tiketId, pesan, tipe }) => {
    const notif = await Notification.create({ 
        penerima : penerimaId,
        judul,
        tiket : tiketId,
        pesan,
        tipe
        });
// Kirim notifikasi real-time ke penerima
const io = getIO();
io.to(`user : ${penerimaId}`).emit("notifikasi_baru", notif);

return notif;

}

// Get API ticket dengan filter dan pagination
export const getTickets = async (req,res) => {
    try {
        const {
            status, prioritas, jenisLayanan, mahasiswaId, operatorId, tanggalDari, tanggalSampai, search, page = 1, limit = 10,
            sortBy = 'createdAt', sortOrder = 'desc'
        } = req.query;
        const filter = {};
        // Mahasiswa hanya bisa melihat tiket mereka sendiri
        if (req.user.role === 'mahasiswa'){
            filter.mahasiswa = req.user._id;
        } else {
            if (mahasiswaId) filter.mahasiswa = mahasiswaId;
            if (operatorId) filter.operator = operatorId;
        }
        if (status) filter.status = status;
        if (prioritas) filter.prioritas = prioritas;
        if (jenisLayanan) filter.jenisLayanan = jenisLayanan;
        if (tanggalDari || tanggalSampai) {
            filter.createdAt = {};
            if (tanggalDari) filter.createdAt.$gte = new Date(tanggalDari);
            if (tanggalSampai) filter.createdAt.$lte = new Date(tanggalSampai);
        }
        if (search) {
            filter.nomorTiket = { $regex: search, $options: 'i' };
        }
        const sort = { [sortBy] : sortOrder === 'asc' ? 1 : -1 };
        const skip =(Number(page) - 1) * Number(limit);
        const total = await Ticket.countDocuments(filter);
        const tickets = await Ticket.find(filter)
        .populate('mahasiswa', 'nama nimNip prodi')
        .populate('operator', 'nama nimNip')
        .populate('jenisLayanan', 'namaLayanan kode icon')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));
        res.json({ 
            success : true,
            data : tickets,
            pagination : {
                total,
                page : Number(page),
                limit : Number(limit),
                totalPages : Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get API detail tiket
export const getTicketByID = async (req,res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
        .populate('mahasiswa', 'nama nimNip prodi')
        .populate('operator', 'nama nimNip')
        .populate('jenisLayanan', 'namaLayanan kode icon deskripsi formFields');
        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }
        // Mahasiswa hanya bisa melihat tiket mereka sendiri
        if (req.user.role === 'mahasiswa' && ticket.mahasiswa._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        res.json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Post API buat tiket baru
export const createTicket = async (req,res) => {
    try {
        // cek validasi input
        result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        

        // cek mahasiswa valid
        const mahasiswa = await User.findById(req.user._id);
        if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
            return res.status(403).json({ message: 'Hanya mahasiswa yang dapat membuat tiket' });
        }

        // proses lampiran jika ada
        const lampiran = req.files ? req.files.map(file => ({
            namaFile : file.originalname,
            url : `/uploads/${file.filename}`,
            tipe : file.mimetype,
            ukuran : file.size
        })) : [];

        const { jenisLayananId, mahasiswaId, prioritas, dataDinamis, deskripsi,  } = req.body;
        const tiketBaru = await Ticket.create({
            mahasiswa : mahasiswaId,
            operator : req.user._id,
            jenisLayanan : jenisLayananId,
            deskripsi,
            prioritas : prioritas || 'normal',
            dataDinamis : dataDinamis || {}, // pastikan dataDinamis selalu berupa objek
            lampiran
        });

        await tiketBaru.populate([
            { path : 'mahasiswa', select : 'nama nimNip prodi' },
            { path : 'jenisLayanan', select : 'namaLayanan kode icon deskripsi formFields' }
        ]);

        // Catat log pembuatan tiket
        await catatanLog({
            tiketId : tiketBaru._id,
            userId : req.user._id,
            aksi : 'tiket_dibuat',
            keterangan : `Tiket dibuat dengan prioritas ${prioritas}`,
            statusLama : null,
            statusBaru : 'baru'
        });

        // Notifikasi real-time ke operator terkait
        const operator = await User.findById(req.user._id);
        if (operator) {
            await kirimNotif({
                penerimaId : operator._id,
                judul : `Tiket Baru: ${tiketBaru.nomorTiket}`,
                tiketId : tiketBaru._id,
                pesan : `Tiket dengan jenis layanan ${tiketBaru.jenisLayanan.namaLayanan} telah dibuat oleh ${mahasiswa.nama}.`,
                tipe : 'informasi'
            });

        // // Kirim email notifikasi ke operator
            await kirimNotifikasiEmail({
                to : operator.email,
                subject : `Tiket Baru: ${tiketBaru.nomorTiket}`,
                text : `Tiket dengan jenis layanan ${tiketBaru.jenisLayanan.namaLayanan} telah dibuat oleh ${mahasiswa.nama}. Silakan cek aplikasi untuk detailnya.`
            });
        }

        // kirim notifikasi ke mahasiswa
        await kirimNotif({
            penerimaId : mahasiswa._id,
            judul : `Tiket Berhasil Dibuat: ${tiketBaru.nomorTiket}`,
            tiketId : tiketBaru._id,
            pesan : `Tiket dengan jenis layanan ${tiketBaru.jenisLayanan.namaLayanan} telah berhasil dibuat. Silakan cek aplikasi untuk detailnya.`,
            tipe : 'tiket_dibuat'
        });



        // emit ke semua operator yang online
        const io = getIO();
        io.to('role : operator').emit('tiket_baru', tiketBaru);
        res.status(201).json({ success: true, message : "Tiket Berhasil dibuat", data: tiketBaru });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// PUt API update tiket (hanya untuk operator)
export const updateTicket = async (req,res) => {
    try {
        const { status, alasanPenolakan, catatanOperator } = req.body;
        validasi_status = ["menunggu", "diproses", "selesai", "ditolak"];
        // cek status ada atau tidak
        if (status && !validasi_status.includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid' });
        }
        const tiket = await Ticket.findById(req.params.id)
        .populate('mahasiswa', 'nama nimNip prodi email')
        .populate('jenisLayanan', 'namaLayanan');

        // cek tiket ada atau tidak
        if (!tiket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        const statusLama = tiket.status;
        tiket.status = status || tiket.status;
        if (alasanPenolakan && status === "ditolak") tiket.alasanPenolakan = alasanPenolakan;
        if (catatanOperator) tiket.catatanOperator = catatanOperator;
        await tiket.save();

        // Catat log perubahan status
        await catatanLog({
            tiketId : tiket._id,
            userId : req.user._id,
            aksi : 'status_diubah',
            keterangan : `Status diubah dari ${statusLama} menjadi ${tiket.status}`,
            statusLama,
            statusBaru : tiket.status
        });

        // Pesan notifikasi per-status
        let pesanNotif = '';
        switch (tiket.status) {
            case 'diproses':
                pesanNotif = `Tiket Anda dengan jenis layanan ${tiket.jenisLayanan.namaLayanan} sedang diproses.`;
                break;
            case 'selesai':
                pesanNotif = `Tiket Anda dengan jenis layanan ${tiket.jenisLayanan.namaLayanan} telah selesai.`;
                break;
            case 'ditolak':
                pesanNotif = `Tiket Anda dengan jenis layanan ${tiket.jenisLayanan.namaLayanan} ditolak. Alasan: ${tiket.alasanPenolakan}`;
                break;
            default:
                pesanNotif = `Status tiket Anda dengan jenis layanan ${tiket.jenisLayanan.namaLayanan} diubah menjadi ${tiket.status}.`;
        }
        // tipe notifikasi per-status
        let tipeNotif = '';
        switch (tiket.status) {
            case 'diproses':
                tipeNotif = 'tiket_diproses';
                break;
            case 'selesai':
                tipeNotif = 'tiket_selesai';
                break;
            case 'ditolak':
                tipeNotif = 'tiket_ditolak';
                break;
            default:
                tipeNotif = 'status_diubah';
        }
        // Kirim notifikasi real-time ke mahasiswa
        await kirimNotif({
            penerimaId : tiket.mahasiswa._id,
            judul : `Update Tiket: ${tiket.nomorTiket}`,
            tiketId : tiket._id,
            pesan : pesanNotif,
            tipe : tipeNotif
        });
        
        // emit ke operator
        const io = getIO();
        io.to('role : operator').emit('tiket_diupdate',tiket);

        res.json({
            success : true,
            message : `Status tiket berhasil diubah ke ${status}`,
            data : tiket
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Put dokumen hasil nya 
export const unggahDokumen = async (req,res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success : false,
                message : "Dokumen Wajib di upload"
            });
        }
        const tiket = await Ticket.findByIdAndUpdate(req.params.id,
            { hasilDokumen : req.file.path},
            { new : true}
        ).populate('mahasiswa','nama email');

        if (!tiket){
            return res.status(404).json({
                success : false,
                message : "Tiket tidak ditemukan"
            });
        }
        
        // catat log unggah dokumen
        await catatanLog({
            tiketId : tiket._id,
            userId : req.user._id,
            aksi : 'lampiran_ditambahkan',
            keterangan : `Dokumen hasil diunggah untuk tiket dengan nomor ${tiket.nomorTiket}`,
        });

        await kirimNotif({
            penerimaId : tiket.mahasiswa._id,
            judul : `Dokumen Hasil Diupload: ${tiket.nomorTiket}`,
            tiketId : tiket._id,
            pesan : `Dokumen hasil untuk tiket dengan jenis layanan ${tiket.jenisLayanan.namaLayanan} telah diunggah. Silakan cek aplikasi untuk detailnya.`,
            tipe : 'informasi'
        });
        res.json({
            message : "Dokumen Hasil berhasil diupload",
            success : true,
            data : tiket
        });
    } catch (error) {
        res.status(501).json({ message : error.message});
    }
}

// get API log tiket
export const getTicketLogs = async (req,res) => {
    try {
        const log = await TicketLog.find({tiket : req.params.id}).populate('user', 'nama role').sort({ createdAt : -1});
        res.json({
            success : true,
            data : log
        });
    } catch (error) {
        res.status(500).json({ message : error.message});
    }
}

// Kasih rating dan review setelah pelayanan selesai
export const kasihRating = async (req,res) => {

    try {
        const { nilai, ulasan } = req.body;
        if (nilai < 1 || nilai > 5) {
            return res.status(400).json({
                success : false,
                message : "Nilai rating harus antara 1 sampai 5"
            });
        }

        const tiket = await Ticket.findOne({ _id : req.params.id, mahasiswa : req.user._id, status : 'selesai' });
        if (!tiket) {
            return res.status(404).json({
                success : false,
                message : "Tiket tidak ditemukan atau belum selesai"
            });
        }

        // jika sudah pernah kasih rating
        if (tiket.rating?.nilai) {
            return res.status(400).json({
                success : false,
                message : "Anda sudah ngasih rating untuk layanan ini"
            });
        }

        // tiket.rating = nilai;
        // tiket.ulasan = ulasan;
        // await tiket.save();
        tiket.rating = { nilai, ulasan, tanggal : new Date()};
        await tiket.save();

        await catatanLog({
            tiketId : tiket._id,
            userId : req.user._id,
            aksi : 'rating_diberikan',
            keterangan : `Mahasiswa memberikan rating ${nilai} dengan ulasan: ${ulasan}`,
        });

        res.status(200).json({
            success : true,
            message : "Terima kasih sudah memberikan rating dan ulasan untuk layanan kami!",
            data : tiket
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }

 }

