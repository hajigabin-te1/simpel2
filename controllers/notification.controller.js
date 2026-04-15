import Notification from "../models/Notification.model.js";

export const getNotification = async (req,res) => {
    try {
        const { page = 1 , limit = 15 } = req.query;
        const skip =  (Number(page) - 1 ) * Number(limit) ;

        const [notification, total, notRead] = await Promise.all([
            Notification.find({penerima : req.user._id})
            .populate({tiket : "refTiket", select : "judul status"})
            .sort({ createAt : -1})
            .skip(skip)
            .limit(Number(limit)),
            Notification.countDocuments({penerima : req.user._id}),
            Notification.countDocuments({penerima : req.user._id, isRead : false})
        ]);
        res.status(200).json({
            success : true,
            data : notification, total, notRead,
            pagination : {
                page : Number(page),
                limit : Number(limit),
                totalPage : Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

export const getRead = async (req,res) => {
    try {
        const notif = await Notification.findOneAndUpdate({
            _id : req.params.id,
            penerima : req.user._id
        },{
            isRead : true
        }, { new : true});
        if (!notif) {
            return res.status(404).json({
                message : "Notifikasi tidak ditemukan"
            });
        }


    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}

export const getReadAll = async (req,res) => {
    try {
        await Notification.updateMany({
            penerima : req.user._id,
            isRead : false
        },{
            isRead : true
        }); 
        res.status(200).json({
            message : "Semua notifkasi sudah dibaca",
            success : true
        });
    } catch (error) {
        res.status(403).json({
            message : error
        });
    }
}