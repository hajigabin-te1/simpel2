import Tiket from '../models/tiket.model.js';
import ServiceType from '../models/Service.model.js';
import User from '../models/User.model.js';

// ambil data laporan berdasarkan id layanan


// get Summary
export const getSummary = async (req,res) => {
    try {
        const { bulan, tahun} = req.query;
        const now = new Date();
        const thn = Number(tahun) || now.getFullYear();
        const bln = Number(bulan) || now.getMonth() + 1;

        // awal dan akhir bulan
        const startDate = new Date(thn, bln - 1, 1);
        const endDate = new Date(thn, bln, 0, 23, 59, 59);

        const filterBulan = {
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        const [
            totalTiket,
            tiketBulanIni,
            byStatus,
            byLayanan,
            byHari,
            rataRataRating,
            totalMahasiswa,
            totalOperator
        ] = await Promise.all([
            Tiket.countDocuments(),
            Tiket.countDocuments(filterBulan),

            // distribusi tiket berdasarkan status
            Tiket.aggregate([
                { $match: filterBulan },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            
            // distribusi tiket berdasarkan layanan
            Tiket.aggregate([
                { $match: filterBulan },
                { $group: { _id: "$layanan", count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: "servicetypes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "layananInfo"
                    }
                },
                { $unwind: "$layananInfo" },
                { $project: { _id: 0, layanan: "$layananInfo.namaLayanan", count: 1 } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),

            // Tiket per hari dalam bulan
            Tiket.aggregate([
                { $match: filterBulan },
                {
                    $group: {
                        _id: { $dayOfMonth: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            
            // rata-rata rating layanan
            Tiket.aggregate([
                { $match: filterBulan },
                { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ]),

            // total mahasiswa
            User.countDocuments({ role: "mahasiswa", isActive: true }),

            // total operator
            User.countDocuments({ role: "operator", isActive: true }),
        ]);

        // Format byStatus jadi objek
        const statusDistribution = {};
        byStatus.forEach(item => {
            statusDistribution[item._id] = item.count;
        });
        
        res.status(200).json({
            message : "Summary berhasil diambil",
            data : {
                overview : {
                    totalTiket,
                tiketBulanIni,
                menunggu : statusDistribution['Menunggu'] || 0,
                diproses : statusDistribution['Diproses'] || 0,
                selesai : statusDistribution['Selesai'] || 0,
                totalMahasiswa,
                totalOperator,
                rataRataRating : rataRataRating[0] ? rataRataRating[0].avgRating : 0,
            },
            byLayanan,
            byHari : byHari.map(item => ({
                hari: item._id,
                count: item.count }) ),
            periode : {
                bulan : bln,
                tahun : thn
            }
            }
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

export const eksporLaporan = async (req,res) => {
    try {
        const { tanggalDari, tanggalSampai, status, jenisLayanan } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (jenisLayanan) filter.layanan = jenisLayanan;
        if (tanggalDari || tanggalSampai) {
            filter.createdAt = {};
            if (tanggalDari) filter.createdAt.$gte = new Date(tanggalDari);
            if (tanggalSampai) filter.createdAt.$lte = new Date(tanggalSampai);
        }
        const tiket = await Tiket.find(filter)
            .populate('mahasiswa', 'nama email nimNip prodi angkatan')
            .populate('operator', 'nama')
            .populate('jenislayanan', 'namaLayanan')
            .sort({ createdAt: -1 })
            .limit(1000); // Batasi ekspor maksimal 1000 tiket

            res.status(200).json({
                message : "Laporan berhasil diekspor",
                data : tiket
            });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

