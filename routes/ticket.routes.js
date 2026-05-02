import { Router } from "express";
import { body } from "express-validator";
import { Izinkan} from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getTickets, getTicketByID, getTicketLogs, kasihRating, createTicket, updateTicket, unggahDokumen  } from "../controllers/ticket.controller.js";
import { uploadTiket } from "../config/cloudi.js";

const router = Router();

router.use(verifyToken);

router.get('/',getTickets);
router.get('/:id',getTicketByID);


// Khusus admin dan operator
router.post('/',Izinkan('admin','operator'),[
    body('mahasiswaId').notEmpty().withMessage('Id mahasiswa wajib diisi'),
    body('jenisLayananId').notEmpty().withMessage('Jenis layanan tidak dipilih')
],createTicket);

// Update status tiket
router.put('/:id',Izinkan('admin','operator'),updateTicket);

// Unggah dokumen hasil layanan
router.put('/:id',Izinkan('admin','operator'),unggahDokumen);

// Log history tiket
router.get('/:id/log', getTicketLogs);

// Rating dari mahasiswa
router.post('/:id/rating', Izinkan('mahasiswa'),kasihRating);

export default router;