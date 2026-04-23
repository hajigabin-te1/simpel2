import { validationResult } from "express-validator";
import ServiceType from "../models/Service.model.js";


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
        
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

