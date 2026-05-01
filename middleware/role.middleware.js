// Batasi akses berdasarkan role

export const Izinkan = (...role) => {
return (req,res,next) => {
    if (!req.user) {
        return res.status(400).json({
            success : false,
            message : "Tidak terautentikasi"
        })
    }
    if (!role.includes(req.user.role)){
        res.status(403).json({
            success : false,
            message : `Akses kamu ditolak. ${req.user.role} tidak memiliki akses` 
        });
    }
    next();
}
}