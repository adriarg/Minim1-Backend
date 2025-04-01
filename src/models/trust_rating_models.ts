import mongoose from "mongoose";

const trustRatingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        description: 'ID del usuario que recibe la valoración' 
    },
    // Campos para mantener compatibilidad con el índice existente
    fromUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null,
        description: 'Campo mantenido para compatibilidad con índice existente' 
    },
    toUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null,
        description: 'Campo mantenido para compatibilidad con índice existente' 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5,
        description: 'Valoración entre 1 y 5'
    },
    comment: { 
        type: String, 
        maxlength: 500,
        description: 'Comentario opcional sobre la valoración'
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        description: 'Fecha de creación de la valoración'
    }
});

// Índice para mejorar la velocidad de búsqueda por usuario
trustRatingSchema.index({ userId: 1 });

export interface ITrustRating {
    userId: mongoose.Types.ObjectId;
    fromUser?: mongoose.Types.ObjectId | null;
    toUser?: mongoose.Types.ObjectId | null;
    rating: number;
    comment?: string;
    createdAt?: Date;
}

const TrustRating = mongoose.model('TrustRating', trustRatingSchema);
export default TrustRating; 