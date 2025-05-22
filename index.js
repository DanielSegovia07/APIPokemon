//? Dependencias del servidor
const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');
const { Pool } = require('pg'); // Cambiamos mysql2 por pg (PostgreSQL)
const fs = require('fs');
const redoc = require('redoc-express');

//? Variables de entorno
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'postgres'; // Usuario por defecto de PostgreSQL
const password = process.env.DB_PASSWORD || '070803';
const database = process.env.DB_NAME || 'pokemondb';
const db_port = process.env.DB_PORT || 5432; // Puerto por defecto de PostgreSQL
const PORT = process.env.PORT || 3002;

//? Configuración del Swagger (igual que antes)
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

//? Middlewares (igual que antes)
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

//? Conexion a la base de datos (cambiada para PostgreSQL)
const pool = new Pool({
    host: host,
    user: user,
    password: password,
    database: database,
    port: db_port,
    // PostgreSQL no tiene connectTimeout en la configuración del pool
    // En su lugar, puedes usar idleTimeout o connectionTimeout si lo necesitas
});

//? Rutas del servidor (modificadas para PostgreSQL)


// GET /pokemon
app.get('/pokemon', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Pokemon ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los Pokémon.' });
    }
});


// GET /pokemon/:id
app.get('/pokemon/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM Pokemon WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el Pokémon.' });
    }
});

// GET /pokemon/nombre/:nombre
app.get('/pokemon/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM Pokemon WHERE nombre = $1', [nombre]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el Pokémon.' });
    }
});

// POST /pokemon
app.post('/pokemon', async (req, res) => {
    const { nombre, tipos, descripcion, imagen } = req.body;
    if (!nombre || !tipos || !descripcion || !imagen) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    try {
        const { rows } = await pool.query(
            'INSERT INTO Pokemon (nombre, tipos, descripcion, imagen) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre, tipos, descripcion, imagen]
        );
        res.status(201).json({ mensaje: 'Pokémon agregado exitosamente.', id: rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el Pokémon.' });
    }
});

// PATCH /pokemon/:id
app.patch('/pokemon/:id', async (req, res) => {
    const { id } = req.params;
    const campos = req.body;

    if (Object.keys(campos).length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar.' });
    }

    const columnas = Object.keys(campos).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const valores = Object.values(campos);

    try {
        const query = `UPDATE Pokemon SET ${columnas} WHERE id = $${valores.length + 1} RETURNING *`;
        const { rows } = await pool.query(query, [...valores, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }

        res.json({ mensaje: 'Pokémon actualizado exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el Pokémon.' });
    }
});

// PATCH /pokemon/nombre/:nombre
app.patch('/pokemon/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params;
    const campos = req.body;

    if (Object.keys(campos).length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar.' });
    }

    const columnas = Object.keys(campos).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const valores = Object.values(campos);

    try {
        const query = `UPDATE Pokemon SET ${columnas} WHERE nombre = $${valores.length + 1} RETURNING *`;
        const { rows } = await pool.query(query, [...valores, nombre]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }

        res.json({ mensaje: 'Pokémon actualizado exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el Pokémon.' });
    }
});

// DELETE /pokemon/:id
app.delete('/pokemon/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM Pokemon WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json({ mensaje: 'Pokémon eliminado exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el Pokémon.' });
    }
});

// DELETE /pokemon/nombre/:nombre
app.delete('/pokemon/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM Pokemon WHERE nombre = $1', [nombre]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Pokémon no encontrado.' });
        }
        res.json({ mensaje: 'Pokémon eliminado exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el Pokémon.' });
    }
});

//? Configuración del Swagger (igual que antes)
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.get("/api-spec", (req, res) => {
    res.json(swaggerDocs);
});
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/api-redoc', redoc({ title: 'API de Pokémon', specUrl: '/api-spec' }));

module.exports = app;

//? Inicio del servidor (igual que antes)
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});