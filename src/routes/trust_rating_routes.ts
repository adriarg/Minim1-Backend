import express from 'express';
import { 
    addTrustRatingHandler, 
    getUserTrustRatingsHandler, 
    updateTrustRatingHandler, 
    deleteTrustRatingHandler,
    getAllUsersWithRatingsHandler
} from '../controllers/trust_rating_controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TrustRatings
 *   description: Gestión de valoraciones de confianza de los usuarios
 */

/**
 * @swagger
 * /api/users-with-ratings:
 *   get:
 *     summary: Obtener todos los usuarios con sus valoraciones
 *     tags: [TrustRatings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de usuarios por página (por defecto 1)
 *     responses:
 *       200:
 *         description: Lista de usuarios con sus valoraciones (1 valoración por usuario)
 *       500:
 *         description: Error del servidor
 */
router.get('/users-with-ratings', getAllUsersWithRatingsHandler);

/**
 * @swagger
 * /api/trust-ratings:
 *   post:
 *     summary: Añadir una nueva valoración de confianza
 *     tags: [TrustRatings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rating
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario a valorar (no se necesita identificar quién hace la valoración)
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Valoración (1-5)
 *               comment:
 *                 type: string
 *                 description: Comentario opcional
 *     responses:
 *       201:
 *         description: Valoración creada con éxito
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/trust-ratings', addTrustRatingHandler);

/**
 * @swagger
 * /api/users/{userId}/trust-ratings:
 *   get:
 *     summary: Obtener todas las valoraciones de un usuario
 *     tags: [TrustRatings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de elementos por página (por defecto 1)
 *     responses:
 *       200:
 *         description: Lista de valoraciones paginada (1 por página)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/users/:userId/trust-ratings', getUserTrustRatingsHandler);

/**
 * @swagger
 * /api/trust-ratings/{id}:
 *   put:
 *     summary: Actualizar una valoración
 *     tags: [TrustRatings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la valoración
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Valoración (1-5)
 *               comment:
 *                 type: string
 *                 description: Comentario opcional
 *     responses:
 *       200:
 *         description: Valoración actualizada con éxito
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/trust-ratings/:id', updateTrustRatingHandler);

/**
 * @swagger
 * /api/trust-ratings/{id}:
 *   delete:
 *     summary: Eliminar una valoración
 *     tags: [TrustRatings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la valoración
 *     responses:
 *       200:
 *         description: Valoración eliminada con éxito
 *       404:
 *         description: Valoración no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/trust-ratings/:id', deleteTrustRatingHandler);

export default router; 