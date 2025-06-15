// backend/index.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Função para criar as tabelas
const createTables = async () => {
  const appointmentsTable = `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      service VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      time VARCHAR(255) NOT NULL
    );`;
  try {
    await pool.query(appointmentsTable);
    console.log("Tabela 'appointments' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao criar tabela", err);
  }
};

const allowedOrigins = [
  'https://sistema-agendamento-barbearia-xi.vercel.app',
  'https://sistema-agendamento-barbearia-git-main-wenersons-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// --- ROTAS DA API ---

// 1. GET /api/appointments (Listar todos)
app.get('/api/appointments', async (req, res) => {
    try {
        const sql = "SELECT * FROM appointments ORDER BY date, time";
        const { rows } = await pool.query(sql);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. GET /api/appointments/:id (Buscar um)
app.get('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "SELECT * FROM appointments WHERE id = $1";
        const { rows } = await pool.query(sql, [id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Agendamento não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. POST /api/schedule (Criar)
app.post('/api/schedule', async (req, res) => {
    const { name, service, date, time } = req.body;
    try {
        const checkSql = `SELECT id FROM appointments WHERE date = $1 AND time = $2`;
        const { rows } = await pool.query(checkSql, [date, time]);
        if (rows.length > 0) {
            return res.status(409).json({ success: false, message: "Este horário já está ocupado." });
        }
        const insertSql = `INSERT INTO appointments (name, service, date, time) VALUES ($1, $2, $3, $4) RETURNING id`;
        const result = await pool.query(insertSql, [name, service, date, time]);
        res.status(201).json({ success: true, message: 'Agendamento salvo!', appointmentId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. PUT /api/appointments/:id (Atualizar/Editar)
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, service, date, time } = req.body;
        const sql = `UPDATE appointments SET name = $1, service = $2, date = $3, time = $4 WHERE id = $5`;
        await pool.query(sql, [name, service, date, time, id]);
        res.json({ success: true, message: "Agendamento atualizado com sucesso!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. DELETE /api/appointments/:id (Excluir)
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM appointments WHERE id = $1';
        const result = await pool.query(sql, [id]);
        if (result.rowCount > 0) {
            res.json({ success: true, message: "Agendamento excluído com sucesso!" });
        } else {
            res.status(404).json({ success: false, message: "Agendamento não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(PORT, () => {
  console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
  createTables();
});