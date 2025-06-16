// backend/index.js (Versão Final com CORS Corrigido)

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
    console.error("Erro ao criar tabela:", err);
  }
};

// Configuração de CORS robusta para produção
const allowedOrigins = [
  'https://sistema-agendamento-barbearia-xi.vercel.app',
  'https://barbearia-cta-xi.vercel.app',
  'https://barbearia-cta.vercel.app' 
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A política de CORS não permite acesso desta Origem.'));
    }
  }
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Rotas da API ---

// GET /api/appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM appointments ORDER BY date, time");
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/booked-times/:date
app.get('/api/booked-times/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const { rows } = await pool.query("SELECT time FROM appointments WHERE date = $1", [date]);
        const bookedTimes = rows.map(row => row.time);
        res.json({ success: true, data: bookedTimes });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/schedule
app.post('/api/schedule', async (req, res) => {
    const { name, service, date, time } = req.body;
    try {
        const check = await pool.query("SELECT id FROM appointments WHERE date = $1 AND time = $2", [date, time]);
        if (check.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Este horário já está ocupado." });
        }
        const result = await pool.query("INSERT INTO appointments (name, service, date, time) VALUES ($1, $2, $3, $4) RETURNING id", [name, service, date, time]);
        res.status(201).json({ success: true, message: 'Agendamento salvo!', appointmentId: result.rows[0].id });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// (As rotas de Editar, Excluir, etc. também estariam aqui)

app.listen(PORT, () => {
  console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
  createTables();
});