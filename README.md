# README: Sistema de Valoracions de Confiança (Backend)

## Descripció
Aquest mòdul implementa un sistema complet de valoracions de confiança entre usuaris per a l'aplicació Skynet. Permet als usuaris qualificar a altres mitjançant puntuacions i comentaris, mostrant el promig de valoració al perfil de cada usuari.


## Requisits implementats

### MongoDB
- **Nova col·lecció**: `trustratings` per emmagatzemar les valoracions de confiança
- **Relació amb col·leccions existents**: Vinculació amb la col·lecció d'usuaris mitjançant el camp `userId`
- **Tipus de dades**: 
  - ObjectId (userId, fromUser, toUser)
  - Number (rating, trustRatingAvg, trustRatingCount)
  - String (comment)
  - Date (createdAt)

### Backend (Express, TypeScript, Node.js)
- **Nous endpoints**: API RESTful completa per a gestionar valoracions
- **Nou model**: `TrustRating` definit a `trust_rating_models.ts`
- **Operacions CRUD**:
  - **Create**: POST `/api/trust-ratings`
  - **Read**: GET `/api/users/:userId/trust-ratings`
  - **Update**: PUT `/api/trust-ratings/:id`
  - **Delete**: DELETE `/api/trust-ratings/:id`
- **Llistat paginat**: Tots els endpoints GET implementen paginació (1 element per pàgina per defecte)
- **Cercador**: Funcionalitat implementada al servei `searchTrustRatings`
- **Endpoint addicional**: GET `/api/users-with-ratings` per obtenir tots els usuaris amb les seves valoracions

## Estructura del codi

### Models
- `trust_rating_models.ts`: Defineix l'esquema de la col·lecció a MongoDB i la interfície TypeScript

### Serveis
- `trust_rating_service.ts`: Implementa tota la lògica de negoci per a:
  - Afegir valoracions
  - Obtenir valoracions d'un usuari
  - Actualitzar valoracions
  - Eliminar valoracions
  - Obtenir usuaris amb les seves valoracions

### Controladors
- `trust_rating_controller.ts`: Gestiona les peticions HTTP, valida dades i retorna respostes

### Rutes
- `trust_rating_routes.ts`: Defineix els endpoints de l'API i la documentació Swagger

## Punts importants d'implementació

### Càlcul automàtic de valoració mitjana
Quan s'afegeix, actualitza o elimina una valoració, es recalcula automàticament la valoració mitjana de l'usuari:

```typescript
const ratingAvg = ratingSum / allRatings.length;
await User.updateOne(
    { _id: userId },
    { 
        trustRatingAvg: parseFloat(ratingAvg.toFixed(2)),
        trustRatingCount: allRatings.length
    }
);
```

### Paginació
Totes les consultes que retornen llistes implementen paginació amb els paràmetres `page` i `limit`:

```typescript
const skip = (page - 1) * limit;
const ratings = await TrustRating.find({ /* ... */ })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
```

## Notes addicionals
- El sistema no requereix identificar qui fa la valoració, només a qui se li fa
- Cada usuari pot rebre múltiples valoracions
- El sistema utilitza logs detallats per facilitar la depuració
- S'ha implementat un sistema robust de gestió d'errors

---

Desenvolupat per a l'examen de Minim 1 de EA (EETAC-UPC)