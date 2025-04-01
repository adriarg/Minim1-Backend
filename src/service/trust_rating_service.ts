import TrustRating, { ITrustRating } from '../models/trust_rating_models.js';
import User from '../models/user_models.js';
import mongoose from 'mongoose';

// Añadir una nueva valoración
export const addTrustRating = async (ratingData: ITrustRating) => {
    try {
        // Validar el rango de la valoración
        if (ratingData.rating < 1 || ratingData.rating > 5) {
            throw new Error('La valoración debe estar entre 1 y 5');
        }

        // Verificar que el usuario existe
        const user = await User.findOne({ _id: ratingData.userId, isDeleted: false });
        if (!user) {
            throw new Error('Usuario no encontrado o eliminado');
        }

        // Generar un ID único para esta valoración y para el fromUser
        const uniqueId = new mongoose.Types.ObjectId();
        const uniqueFromUser = new mongoose.Types.ObjectId(); // Generamos un ID único para fromUser en lugar de null
        
        console.log(`Generando nuevo ID para valoración: ${uniqueId}`);

        // Crear una nueva valoración con ID único y fromUser único
        const newRating = {
            _id: uniqueId,
            userId: ratingData.userId,
            toUser: ratingData.userId,     // El usuario que recibe la valoración
            fromUser: uniqueFromUser,      // ID único para cada valoración (en lugar de null)
            rating: ratingData.rating,
            comment: ratingData.comment || '',
            createdAt: new Date()
        };

        console.log('Creando nueva valoración:', JSON.stringify(newRating));
        
        // Guardar la valoración como un nuevo documento
        const rating = new TrustRating(newRating);
        const savedRating = await rating.save();

        console.log('Valoración guardada con ID:', savedRating._id);

        // Calcular la nueva media de valoraciones y actualizar el usuario
        const allRatings = await TrustRating.find({ 
            $or: [
                { userId: ratingData.userId },
                { toUser: ratingData.userId }
            ]
        });
        
        console.log(`Total de valoraciones para usuario ${ratingData.userId}: ${allRatings.length}`);
        
        const ratingSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
        const ratingAvg = ratingSum / allRatings.length;

        // Actualizar usuario con la nueva media y contador
        await User.updateOne(
            { _id: ratingData.userId },
            { 
                trustRatingAvg: parseFloat(ratingAvg.toFixed(2)),
                trustRatingCount: allRatings.length
            }
        );

        return savedRating;
    } catch (error) {
        console.error('Error en addTrustRating:', error);
        throw error;
    }
};

// Obtener todas las valoraciones de un usuario
export const getUserTrustRatings = async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    
    // Verificar que el usuario existe
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
        throw new Error('Usuario no encontrado o eliminado');
    }

    // Obtener valoraciones paginadas
    // Buscamos por userId o por toUser para compatibilidad
    const ratings = await TrustRating.find({ 
        $or: [
            { userId: userId },
            { toUser: userId }
        ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Obtener el total para la paginación
    const total = await TrustRating.countDocuments({ 
        $or: [
            { userId: userId },
            { toUser: userId }
        ]
    });
    
    return {
        ratings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

// Actualizar una valoración
export const updateTrustRating = async (ratingId: string, updatedData: Partial<ITrustRating>) => {
    try {
        // Validar el rango si se actualiza la valoración
        if (updatedData.rating && (updatedData.rating < 1 || updatedData.rating > 5)) {
            throw new Error('La valoración debe estar entre 1 y 5');
        }
        
        // Preparar datos para actualizar
        const dataToUpdate = { ...updatedData };
        
        // Asegurarnos de no cambiar fromUser o toUser (podría causar problemas de índice)
        delete dataToUpdate.fromUser;
        delete dataToUpdate.toUser;

        // Actualizar la valoración
        const updatedRating = await TrustRating.findByIdAndUpdate(
            ratingId, 
            { $set: dataToUpdate },
            { new: true }
        );

        if (!updatedRating) {
            throw new Error('Valoración no encontrada');
        }

        // Recalcular la media si se cambió la valoración
        if (updatedData.rating) {
            // Buscar por userId o toUser para compatibilidad
            const userId = updatedRating.userId || updatedRating.toUser;
            
            const allRatings = await TrustRating.find({ 
                $or: [
                    { userId: userId },
                    { toUser: userId }
                ]
            });
            
            const ratingSum = allRatings.reduce((sum, rating) => sum + rating.rating, 0);
            const ratingAvg = ratingSum / allRatings.length;

            // Actualizar usuario con la nueva media
            await User.updateOne(
                { _id: userId },
                { 
                    trustRatingAvg: parseFloat(ratingAvg.toFixed(2)),
                    trustRatingCount: allRatings.length
                }
            );
        }

        return updatedRating;
    } catch (error) {
        console.error('Error en updateTrustRating:', error);
        throw error;
    }
};

// Eliminar una valoración
export const deleteTrustRating = async (ratingId: string) => {
    try {
        const rating = await TrustRating.findById(ratingId);
        if (!rating) {
            throw new Error('Valoración no encontrada');
        }

        // Obtener userId (podría estar en userId o toUser)
        const userId = rating.userId || rating.toUser;
        
        // Eliminar la valoración
        await TrustRating.findByIdAndDelete(ratingId);
        
        // Recalcular la media
        const allRatings = await TrustRating.find({ 
            $or: [
                { userId: userId },
                { toUser: userId }
            ]
        });
        
        if (allRatings.length === 0) {
            // Si no quedan valoraciones, poner la media a 0
            await User.updateOne(
                { _id: userId },
                { trustRatingAvg: 0, trustRatingCount: 0 }
            );
        } else {
            // Recalcular la media
            const ratingSum = allRatings.reduce((sum, rating) => sum + rating.rating, 0);
            const ratingAvg = ratingSum / allRatings.length;
            
            await User.updateOne(
                { _id: userId },
                { 
                    trustRatingAvg: parseFloat(ratingAvg.toFixed(2)),
                    trustRatingCount: allRatings.length 
                }
            );
        }
        
        return { message: 'Valoración eliminada correctamente' };
    } catch (error) {
        console.error('Error en deleteTrustRating:', error);
        throw error;
    }
};

// Buscar valoraciones por valor o comentario
export const searchTrustRatings = async (userId: string, searchTerm: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    
    // Verificar que el usuario existe
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
        throw new Error('Usuario no encontrado o eliminado');
    }

    // Crear la consulta de búsqueda
    const searchQuery = {
        userId,
        $or: [
            // Buscar en el comentario
            { comment: { $regex: searchTerm, $options: 'i' } },
            // Buscar por valoración (si searchTerm puede convertirse a número)
            ...(isNaN(Number(searchTerm)) ? [] : [{ rating: Number(searchTerm) }])
        ]
    };

    // Obtener valoraciones filtradas y paginadas
    const ratings = await TrustRating.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    // Obtener el total para la paginación
    const total = await TrustRating.countDocuments(searchQuery);
    
    return {
        ratings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

// Obtener todos los usuarios con sus valoraciones detalladas
export const getAllUsersWithRatings = async (page: number, limit: number) => {
    try {
        const skip = (page - 1) * limit;
        
        // Obtener usuarios paginados
        const users = await User.find(
            { isDeleted: false },
            { 
                password: 0  // Solo excluimos el password, sin incluir campos específicos
            }
        )
        .skip(skip)
        .limit(limit);
        
        // Obtener el total para la paginación
        const total = await User.countDocuments({ isDeleted: false });
        
        // Para cada usuario, obtener sus valoraciones (limitado a 1 por usuario)
        const usersWithRatings = await Promise.all(
            users.map(async (user) => {
                const ratings = await TrustRating.find({ 
                    $or: [
                        { userId: user._id },
                        { toUser: user._id }
                    ]
                })
                .sort({ createdAt: -1 })
                .limit(1); // Limitamos a 1 valoración más reciente
                
                // Obtenemos el total de valoraciones para este usuario (para la paginación)
                const totalRatings = await TrustRating.countDocuments({
                    $or: [
                        { userId: user._id },
                        { toUser: user._id }
                    ]
                });
                
                return {
                    ...user.toObject(),
                    ratings,
                    totalRatings,
                    totalRatingPages: Math.ceil(totalRatings / 1) // Considerando 1 por página
                };
            })
        );
        
        return {
            users: usersWithRatings,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error en getAllUsersWithRatings:', error);
        throw error;
    }
}; 