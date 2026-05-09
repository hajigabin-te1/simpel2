import { validationResult } from "express-validator";
import ServiceType from "../models/ServiceType.model.js";


export const getService = async (req,res) => {
    try {
        const { isActive } = req.query;
        const filter = {};

        //cek layanan aktif kemudian buat filter
        if ( isActive !== undefined) filter.isActive = isActive === 'true';
        const service = await ServiceType.find(filter).sort({
            urutan : 1,
            namaLayanan : 1
        });
        res.status(200).json({
            success : true,
            data : service
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

// ambil data layanan berdasarkan id
export const getServiceById = async (req,res) => {
    try {
        const { id } = req.params;
        const service = await ServiceType.findById(id);
        if (!service) {
            return res.status(404).json({
                message : "Layanan tidak ditemukan"
            });
        }
        res.status(200).json({
            message : "Layanan berhasil diambil",
            data : service
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

// buat layanan baru
export const createService = async (req,res) => {
    try {
        const err = validationResult(req);
        if (err){
            return res.status(400).json({
                message : err.array()
            });
        }
        // const { namaLayanan, urutan, isActive } = req.body;
        // const newService = new ServiceType({
        //     namaLayanan,
        //     urutan,
        //     isActive
        // });

        const service = await ServiceType.create(req.body);
        // await newService.save();
        res.status(201).json({
            message : "Jenis Layanan baru berhasil dibuat",
            data : service
        });

    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

// update layanan berdasarkan id
export const updateService = async (req,res) => {
    try {
        const err = validationResult(req);
        if (err){
            return res.status(400).json({
                message : err.array()
            });
        }
        const { id } = req.params;
        const { namaLayanan, urutan, isActive } = req.body;
        const service = await ServiceType.findById(id);
        if (!service) {
            return res.status(404).json({
                message : "Layanan tidak ditemukan"
            });
        }
        service.namaLayanan = namaLayanan || service.namaLayanan;
        service.urutan = urutan || service.urutan;
        service.isActive = isActive !== undefined ? isActive : service.isActive;
        await service.save();
        res.status(200).json({
            message : "Layanan berhasil diupdate",
            data : service
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

// Hapus layanan berdasarkan id
export const deleteService = async (req,res) => {
    try {
        const { id } = req.params;
        const service = await ServiceType.findById(id);
        if (!service) {
            return res.status(404).json({
                message : "Layanan tidak ditemukan"
            });
        }
        await service.remove();
        res.status(200).json({
            message : "Layanan berhasil dihapus"
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

