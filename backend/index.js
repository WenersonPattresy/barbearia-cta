// backend/index.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Importa o driver 'pg'
require('dotenv').config(); // Carrega as variáveis de ambiente

const app = express();
const PORT = 3001;

// Configuração da conexão com o PostgreSQL usando a URL do Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Função para criar as tabelas se não existirem
const createTables = async () => {
  const appointmentsTable = `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      service VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      time VARCHAR(255) NOT NULL
    );`;
  // ... (aqui poderíamos adicionar a tabela de usuários também)
  try {
    await pool.query(appointmentsTable);
    console.log("Tabela 'appointments' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao criar tabela", err);
  }
};

// Substitua a linha 'app.use(cors());' por este bloco:

const corsOptions = {
  origin: 'https://sistema-agendamento-barbearia-xi.vercel.app',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Rotas da API (Adaptadas para PostgreSQL) ---
// Note que os comandos SQL são quase idênticos! Apenas os placeholders mudam de '?' para '$1, $2, etc.'

app.get('/api/appointments', async (req, res) => {
    try {
        const sql = "SELECT * FROM appointments ORDER BY date, time";
        const { rows } = await pool.query(sql);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

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

        console.log(`🎉 Novo agendamento salvo com ID: ${result.rows[0].id}`);
        res.status(201).json({ success: true, message: 'Agendamento salvo!', appointmentId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ... (outras rotas seriam adaptadas de forma similar)

app.listen(PORT, () => {
  console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
  createTables(); // Chama a função para criar as tabelas ao iniciar
});