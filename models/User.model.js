import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    nama : {
        type : String,
        required : [true, "Nama harus diisi"],
        trim : true,
    },
    nimNip : {
        type : String,
        required : [true, "NIM/NIP harus diisi"],
        unique : true,
        trim : true},
    email : {
        type : String,
        required : [true, "Email harus diisi"],
        unique : true,
        trim : true,
        lowercase : true,
        match : [/\S+@\S+\.\S+/, "Format email tidak valid"],
    },
    password : {
        type : String,
        required : [true, "Password harus diisi"],
        minlength : [6, "Password minimal 6 karakter"],
        select : false, // Agar password tidak muncul saat query
    },
    role : {
        type : String,
        enum : ["admin", "mahasiswa", "operator"],
        default : "mahasiswa",
    },
    prodi : {
        type : String,
        trim : true,
    },
    angkatan : {
        type : Number,
    },
    noTelp : {
        type : String,
        trim : true,
    },
    avatarUrl : { 
        type : String,
        default : ""
    },
    isActive : {
        type : Boolean,
        default : true,
    },
}, { timestamps: true });

 // Hash password sebelum disimpan
userSchema.pre('save', async function() { 
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
    // GAK PERLU panggil next()
});



 // Metode untuk membandingkan password saat login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

 // Sembunyikan field sensitif saat toJSON
userSchema.methods.JSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model("User", userSchema);
export default User;

