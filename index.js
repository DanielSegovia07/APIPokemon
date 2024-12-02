//? Dependencias del servidor
const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const redoc = require('redoc-express');

//? Variables de entorno
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '070803';
const database = process.env.DB_NAME || 'pokemondb';
const db_port = process.env.DB_PORT || 3306;
const PORT = process.env.PORT || 3002;

//? Configuración del Swagger
const datosReadme = fs.readFileSync(path.join(__dirname, 'README.md'), { encoding: 'utf8', flag: 'r' });
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pokemon API',
            version: '1.0.0',
            description: datosReadme || 'API para gestionar información de Pokémon.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`
            }
        ],
    },
    apis: [`${path.join(__dirname, "index.js")}`],
};

//? Middlewares
const app = express();
// Configuración de CORS
app.use(cors({
    origin: '*', // Permitir todas las solicitudes. Cambia '*' por una URL específica en producción.
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));
app.use(express.json());

//? Conexion a la base de datos
const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    port: db_port,
    connectTimeout: 10000
});

//? Rutas del servidor


/**
 * @swagger
 * /pokemon:
 *   get:
 *     tags:
 *       - Pokémon
 *     summary: Obtiene una lista de todos los Pokémon disponibles en la base de datos.
 *     description: Endpoint que devuelve una lista de todos los Pokémon almacenados, incluyendo sus detalles básicos.
 *     responses:
 *       200:
 *         description: Lista de Pokémon obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: Identificador único del Pokémon.
 *                   nombre:
 *                     type: string
 *                     example: "Pikachu"
 *                     description: Nombre del Pokémon.
 *                   tipo:
 *                     type: string
 *                     example: "Eléctrico"
 *                     description: Tipo principal del Pokémon.
 *       500:
 *         description: Error al obtener los Pokémon.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los Pokémon."
 */
app.get('/pokemon', (req, res) => {
    const consulta = `SELECT * FROM Pokemon`;
    connection.query(consulta, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los Pokémon.' });
        }
        res.json(results);
    });
});


/**
 * @swagger
 * /pokemon/{id}:
 *   get:
 *     tags:
 *       - Pokémon
 *     summary: Obtiene los detalles de un Pokémon por su ID.
 *     description: Devuelve los datos completos de un Pokémon específico utilizando su ID único.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del Pokémon a consultar.
 *         schema:
 *           type: integer
 *           example: 25
 *     responses:
 *       200:
 *         description: Detalles del Pokémon encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 25
 *                   description: Identificador único del Pokémon.
 *                 nombre:
 *                   type: string
 *                   example: "Pikachu"
 *                   description: Nombre del Pokémon.
 *                 tipo:
 *                   type: string
 *                   example: "Eléctrico"
 *                   description: Tipo principal del Pokémon.
 *                 habilidad:
 *                   type: string
 *                   example: "Electricidad estática"
 *                   description: Habilidad principal del Pokémon.
 *       404:
 *         description: Pokémon no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pokémon no encontrado."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el Pokémon."
 */
app.get('/pokemon/:id', (req, res) => {
    const { id } = req.params;
    const consulta = `SELECT * FROM Pokemon WHERE id = ?`;
    connection.query(consulta, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el Pokémon.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json(results[0]);
    });
});

/**
 * @swagger
 * /pokemon/nombre/{nombre}:
 *   get:
 *     tags:
 *       - Pokémon
 *     summary: Obtiene los detalles de un Pokémon por su nombre.
 *     description: Devuelve los datos completos de un Pokémon específico utilizando su nombre único.
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: Nombre del Pokémon a consultar.
 *         schema:
 *           type: string
 *           example: "Pikachu"
 *     responses:
 *       200:
 *         description: Detalles del Pokémon encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 25
 *                   description: Identificador único del Pokémon.
 *                 nombre:
 *                   type: string
 *                   example: "Pikachu"
 *                   description: Nombre del Pokémon.
 *                 tipo:
 *                   type: string
 *                   example: "Eléctrico"
 *                   description: Tipo principal del Pokémon.
 *                 habilidad:
 *                   type: string
 *                   example: "Electricidad estática"
 *                   description: Habilidad principal del Pokémon.
 *       404:
 *         description: Pokémon no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pokémon no encontrado."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el Pokémon."
 */
app.get('/pokemon/nombre/:nombre', (req, res) => {
    const { nombre } = req.params;
    const consulta = `SELECT * FROM Pokemon WHERE nombre = ?`;
    connection.query(consulta, [nombre], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el Pokémon.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json(results[0]);
    });
});

/**
 * @swagger
 * /pokemon:
 *   post:
 *     tags:
 *       - Pokémon
 *     summary: Agrega un nuevo Pokémon a la base de datos.
 *     description: Permite crear un nuevo registro de Pokémon proporcionando sus datos principales.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - tipos
 *               - descripcion
 *               - imagen
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del Pokémon.
 *                 example: "Charmander"
 *               tipos:
 *                 type: string
 *                 description: Tipos del Pokémon separados por comas.
 *                 example: "Fuego"
 *               descripcion:
 *                 type: string
 *                 description: Descripción breve del Pokémon.
 *                 example: "Este Pokémon prefiere lugares cálidos y emite llamas por su cola."
 *               imagen:
 *                 type: string
 *                 description: URL de la imagen del Pokémon.
 *                 example: "https://example.com/charmander.png"
 *     responses:
 *       201:
 *         description: Pokémon agregado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pokémon agregado exitosamente."
 *                 id:
 *                   type: integer
 *                   example: 101
 *       400:
 *         description: Datos incompletos o inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son obligatorios."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al agregar el Pokémon."
 */
app.post('/pokemon', (req, res) => {
    const { nombre, tipos, descripcion, imagen } = req.body;
    if (!nombre || !tipos || !descripcion || !imagen) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    const consulta = `INSERT INTO Pokemon (nombre, tipos, descripcion, imagen) VALUES (?, ?, ?, ?)`;
    connection.query(consulta, [nombre, tipos, descripcion, imagen], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al agregar el Pokémon.' });
        }
        res.status(201).json({ mensaje: 'Pokémon agregado exitosamente.', id: result.insertId });
    });
});
/**
 * @swagger
 * /pokemon/{id}:
 *   patch:
 *     tags:
 *       - Pokémon
 *     summary: Actualiza la información de un Pokémon existente.
 *     description: Permite actualizar uno o más campos de un Pokémon específico utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del Pokémon que se desea actualizar.
 *         schema:
 *           type: integer
 *           example: 25
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del Pokémon.
 *                 example: "Charizard"
 *               tipos:
 *                 type: string
 *                 description: Nuevos tipos del Pokémon separados por comas.
 *                 example: "Fuego, Volador"
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del Pokémon.
 *                 example: "Este Pokémon emite llamas intensas por su cola y puede volar."
 *               imagen:
 *                 type: string
 *                 description: Nueva URL de la imagen del Pokémon.
 *                 example: "https://example.com/charizard.png"
 *     responses:
 *       200:
 *         description: Pokémon actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pokémon actualizado exitosamente."
 *       404:
 *         description: Pokémon no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pokémon no encontrado."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar el Pokémon."
 */
app.patch('/pokemon/:id', (req, res) => {
    const { id } = req.params;
    const campos = req.body;
    const columnas = Object.keys(campos).map(key => `${key} = ?`).join(', ');
    const valores = Object.values(campos);

    connection.query(`UPDATE Pokemon SET ${columnas} WHERE id = ?`, [...valores, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar el Pokémon' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado' });
        }
        res.json({ mensaje: 'Pokémon actualizado exitosamente' });
    });
});

/**
 * @swagger
 * /pokemon/nombre/{nombre}:
 *   patch:
 *     tags:
 *       - Pokémon
 *     summary: Actualiza la información de un Pokémon existente por su nombre.
 *     description: Permite actualizar uno o más campos de un Pokémon específico utilizando su nombre como identificador.
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: Nombre del Pokémon que se desea actualizar.
 *         schema:
 *           type: string
 *           example: "Pikachu"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipos:
 *                 type: string
 *                 description: Nuevos tipos del Pokémon separados por comas.
 *                 example: "Eléctrico, Acero"
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del Pokémon.
 *                 example: "Un Pokémon que acumula electricidad en sus mejillas para atacar."
 *               imagen:
 *                 type: string
 *                 description: Nueva URL de la imagen del Pokémon.
 *                 example: "https://example.com/pikachu-updated.png"
 *     responses:
 *       200:
 *         description: Pokémon actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pokémon actualizado exitosamente."
 *       404:
 *         description: Pokémon no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pokémon no encontrado."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar el Pokémon."
 */
app.patch('/pokemon/nombre/:nombre', (req, res) => {
    const { nombre } = req.params;
    const campos = req.body;
    const columnas = Object.keys(campos).map(key => `${key} = ?`).join(', ');
    const valores = Object.values(campos);

    connection.query(`UPDATE Pokemon SET ${columnas} WHERE nombre = ?`, [...valores, nombre], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar el Pokémon' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado' });
        }
        res.json({ mensaje: 'Pokémon actualizado exitosamente' });
    });
});
/**
 * @swagger
 * /pokemon/{id}:
 *   delete:
 *     tags:
 *       - Pokémon
 *     summary: Elimina un Pokémon de la base de datos.
 *     description: Permite eliminar un Pokémon específico de la base de datos utilizando su ID como identificador.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del Pokémon que se desea eliminar.
 *         schema:
 *           type: integer
 *           example: 25
 *     responses:
 *       200:
 *         description: Pokémon eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pokémon eliminado exitosamente."
 *       404:
 *         description: Pokémon no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pokémon no encontrado."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el Pokémon."
 */
app.delete('/pokemon/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM Pokemon WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el Pokémon.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json({ mensaje: 'Pokémon eliminado exitosamente.' });
    });
});
/**
 * @swagger
 * /pokemon/nombre/{nombre}:
 *   delete:
 *     tags:
 *       - Pokémon
 *     summary: Elimina un Pokémon de la base de datos por su nombre.
 *     description: Permite eliminar un Pokémon específico de la base de datos utilizando su nombre como identificador.
 *     parameters:
 *       - name: nombre
 *         in: path
 *         required: true
 *         description: Nombre del Pokémon que se desea eliminar.
 *         schema:
 *           type: string
 *           example: "Pikachu"
 *     responses:
 *       200:
 *         description: Pokémon eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pokémon eliminado exitosamente."
 *       404:
 *         description: Pokémon no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pokémon no encontrado."
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el Pokémon."
 */
app.delete('/pokemon/nombre/:nombre', (req, res) => {
    const { nombre } = req.params;
    connection.query('DELETE FROM Pokemon WHERE nombre = ?', [nombre], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el Pokémon.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json({ mensaje: 'Pokémon eliminado exitosamente.' });
    });
});


/**
 * @swagger
 * components:
 *   schemas:
 *     Pokemon:
 *       type: object
 *       required:
 *         - id
 *         - nombre
 *         - tipos
 *         - descripcion
 *         - imagen
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del Pokémon.
 *         nombre:
 *           type: string
 *           description: Nombre del Pokémon.
 *         tipos:
 *           type: string
 *           description: Tipos del Pokémon (e.g., agua, fuego, eléctrico).
 *         descripcion:
 *           type: string
 *           description: Descripción general del Pokémon.
 *         imagen:
 *           type: string
 *           description: URL de la imagen del Pokémon.
 *       example:
 *         id: 1
 *         nombre: Pikachu
 *         tipos: "eléctrico"
 *         descripcion: "Pokémon ratón conocido por su ataque eléctrico impactrueno."
 *         imagen: "https://example.com/pikachu.png"
 */


//? Configuración del Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.get("/api-spec", (req, res) => {
    res.json(swaggerDocs);
});
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/api-redoc', redoc({ title: 'API de Pokémon', specUrl: '/api-spec' }));

module.exports = app;


//? Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

