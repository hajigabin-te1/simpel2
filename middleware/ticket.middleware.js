import { Router } from "express";
import { body} from "express-validator";
import { getTickets, getTicketByID, getTicketLogs, createTicket,updateTicket, unggahDokumen, kasihRating } from "../controllers/ticket.controller.js";
import { verifyToken } from "./auth.middleware.js";
import { Izinkan } from "./role.middleware.js";
import { uploadTiket } from "../config/cloudi.js";


const router = Router();

router.use(verifyToken);

router.get('/', getTickets);
router.getTicketByID('/:id',getTicketByID);

// Operator atau Admin membuat tiket

