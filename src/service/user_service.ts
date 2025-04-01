// src/services/user_service.ts
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/user_models.js';

export const saveMethod = () => {
    return 'Hola';
};
export const createUser = async (userData: IUser) => {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        throw new Error('Formato de email inválido');
    }
    const userRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!userRegex.test(userData.userName)) {
        throw new Error('Nombre de usuario inválido');
    }
    const user = new User(userData);
    return await user.save();
};

export const getAllUsers = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    return await User.find(
        { isDeleted: false }, 
        { password: 0 } // Solo excluimos el password
    )
    .skip(skip)
    .limit(limit);
};

export const getUserById = async (id: string) => {
    return await User.findOne(
        { _id: id, isDeleted: false },
        { password: 0 } // Solo excluimos el password
    );
};

export const updateUser = async (id: string, updateData: Partial<IUser>) => {
    return await User.updateOne({ _id: id, isDeleted: false }, { $set: updateData });
};

export const deleteUser = async (id: string) => {
    return await User.updateOne({ _id: id }, { isDeleted: true });
};

export const logIn = async (email: string, password: string) => { 
    try {

        // Validar el formato del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Formato de email inválido');
        }

        // Buscar al usuario en la base de datos
        const user = await User.findOne({ email, isDeleted: false });
        if (!user) {
            throw new Error('Usuario no encontrado o eliminado');
        }
       

        // Comparar la contraseña ingresada con la almacenada
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        return user; // Credenciales correctas, devuelve el usuario
    } catch (error: any) {
        throw new Error(error.message || 'Error al iniciar sesión');
    }
};