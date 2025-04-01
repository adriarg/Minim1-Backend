// src/models/user_models.ts
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName :{type: String, required : true },
    email: { type : String, required : true},
    password: { type:String, required: true},
    //friends : [{type:mongoose.Types.ObjectId}],
    isDeleted: { type: Boolean, default: false }, // borrado lógico
    role: { type : String,
            enum : ['Administrador', 'Usuario', 'Empresa', 'Gobierno'],
            required : true
    },
    trustRatingAvg: { type: Number, default: 0 }, // Valoración promedio de confianza
    trustRatingCount: { type: Number, default: 0 } // Contador de valoraciones recibidas
});

// Encriptar la contraseña antes de guardar con un middleware 
// Se hace aquí dicho middleware para no tener que exponer la contraseña
// En la interfaz IUser
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();


    // Verificar la longitud y los caracteres permitidos en la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%^&*_\-@]).{8,20}$/;
    if (!passwordRegex.test(this.password)) {
        return next(new Error('La contraseña debe tener entre 8 y 20 caracteres, contener al menos una letra minúscula, una mayúscula, un número y un carácter especial.'));
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export interface IUser{
    isactive:boolean; //is active true by default
    userName : string;
    email : string;
    //List<Dron> drons: string;
    //friends?: mongoose.Types.ObjectId[];
    isDeleted?: boolean;
    role: 'Administrador' | 'Usuario' | 'Empresa' | 'Gobierno';
    trustRatingAvg?: number; // Valoración promedio de confianza
    trustRatingCount?: number; // Contador de valoraciones recibidas
}

const User = mongoose.model('User', userSchema);
export default User;
