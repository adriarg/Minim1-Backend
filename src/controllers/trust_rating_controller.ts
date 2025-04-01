import { Request, Response } from 'express';
import { 
    addTrustRating, 
    getUserTrustRatings, 
    updateTrustRating, 
    deleteTrustRating,
    searchTrustRatings,
    getAllUsersWithRatings
} from '../service/trust_rating_service.js';
import mongoose from 'mongoose';

// Añadir una nueva valoración
export const addTrustRatingHandler = async (req: Request, res: Response) => {
    try {
        // Validar que el ID de usuario sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        console.log('Valoración para usuario:', req.body.userId);
        
        // Forzamos la creación de un objeto nuevo cada vez para evitar problemas de referencia
        const ratingData = {
            userId: new mongoose.Types.ObjectId(req.body.userId), // Convertir explícitamente a ObjectId
            rating: Number(req.body.rating), // Asegurar que sea un número
            comment: req.body.comment || '' // Valor por defecto en caso de que sea undefined
        };
        
        // Generar un ID único para mostrar en los logs
        const requestId = Math.random().toString(36).substring(2, 10);
        console.log(`[${requestId}] Procesando valoración:`, JSON.stringify(ratingData));
        
        const data = await addTrustRating(ratingData);
        
        console.log(`[${requestId}] Valoración guardada con ID:`, data._id);
        
        // Devolvemos un objeto simplificado con _id para que el frontend pueda diferenciar valoraciones
        res.status(201).json({ 
            message: 'Valoración agregada exitosamente', 
            data: {
                _id: data._id,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.createdAt,
                userId: data.userId
            },
            requestId: requestId
        });
    } catch (error: any) {
        console.error('Error al guardar valoración:', error);
        
        if (error.message === 'Usuario no encontrado o eliminado' || 
            error.message === 'La valoración debe estar entre 1 y 5') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las valoraciones de un usuario
export const getUserTrustRatingsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        
        // Validar que el ID de usuario sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 1;
        
        const data = await getUserTrustRatings(userId, page, limit);
        res.json(data);
    } catch (error: any) {
        if (error.message === 'Usuario no encontrado o eliminado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Actualizar una valoración
export const updateTrustRatingHandler = async (req: Request, res: Response) => {
    try {
        const ratingId = req.params.id;
        
        // Validar que el ID de valoración sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(ratingId)) {
            return res.status(400).json({ message: 'ID de valoración inválido' });
        }
        
        const data = await updateTrustRating(ratingId, req.body);
        res.json({ 
            message: 'Valoración actualizada exitosamente', 
            data 
        });
    } catch (error: any) {
        if (error.message === 'Valoración no encontrada') {
            return res.status(404).json({ message: error.message });
        } else if (error.message === 'La valoración debe estar entre 1 y 5') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Eliminar una valoración
export const deleteTrustRatingHandler = async (req: Request, res: Response) => {
    try {
        const ratingId = req.params.id;
        
        // Validar que el ID de valoración sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(ratingId)) {
            return res.status(400).json({ message: 'ID de valoración inválido' });
        }
        
        const data = await deleteTrustRating(ratingId);
        res.json(data);
    } catch (error: any) {
        if (error.message === 'Valoración no encontrada') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Buscar valoraciones por texto
export const searchTrustRatingsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        
        // Validar que el ID de usuario sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
        
        const searchTerm = req.query.term as string || '';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 1;
        
        const data = await searchTrustRatings(userId, searchTerm, page, limit);
        res.json(data);
    } catch (error: any) {
        if (error.message === 'Usuario no encontrado o eliminado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los usuarios con sus valoraciones
export const getAllUsersWithRatingsHandler = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 1;
        
        const data = await getAllUsersWithRatings(page, limit);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}; 