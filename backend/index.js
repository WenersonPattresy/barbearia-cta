// backend/index.js

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

// Função para criar/verificar todas as tabelas e popular os serviços
const setupDatabase = async () => {
  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(10, 2) NOT NULL 
    );`;

  const createAppointmentsTable = `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      service_id INTEGER REFERENCES services(id), 
      price_at_time_of_booking NUMERIC(10, 2) NOT NULL,
      "date" VARCHAR(255) NOT NULL,
      "time" VARCHAR(255) NOT NULL 
    );`;

  try {
    await pool.query(createServicesTable);
    await pool.query(createAppointmentsTable);
    console.log("Tabelas 'services' e 'appointments' verificadas/criadas com sucesso.");

    const { rows } = await pool.query("SELECT COUNT(*) as count FROM services");
    if (rows[0].count === '0') {
      console.log("Populando a tabela de serviços com dados padrão...");
      await pool.query(`
        INSERT INTO services (name, price) VALUES
          ('Corte de Cabelo', 35.00),
          ('Barba', 25.00),
          ('Corte + Barba', 55.00);
      `);
      console.log("Serviços padrão inseridos com sucesso.");
    }
  } catch (err) {
    console.error("Erro ao configurar o banco de dados:", err);
  }
};

// Configuração de CORS para produção
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

// --- ROTAS DA API ---

// Rota para buscar a lista de serviços e preços
app.get('/api/services', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM services ORDER BY name");
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Erro ao buscar serviços:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Rota para criar um novo agendamento (agora usando service_id)
app.post('/api/schedule', async (req, res) => {
    const { customer_name, service_id, date, time } = req.body;

    try {
        const check = await pool.query("SELECT id FROM appointments WHERE date = $1 AND \"time\" = $2", [date, time]);
        if (check.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Este horário já está ocupado." });
        }

        const serviceResult = await pool.query("SELECT price FROM services WHERE id = $1", [service_id]);
        if (serviceResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Serviço não encontrado." });
        }
        const price_at_time_of_booking = serviceResult.rows[0].price;

        const insertSql = `
            INSERT INTO appointments (customer_name, service_id, price_at_time_of_booking, "date", "time") 
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        const result = await pool.query(insertSql, [customer_name, service_id, price_at_time_of_booking, date, time]);
        
        console.log(`Agendamento salvo para ${customer_name} com o preço de ${price_at_time_of_booking}`);
        res.status(201).json({ success: true, message: 'Agendamento salvo!', appointmentId: result.rows[0].id });
    } catch (err) {
        console.error("Erro ao agendar:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Rota para listar agendamentos (agora com JOIN para pegar o nome do serviço)
app.get('/api/appointments', async (req, res) => {
    try {
        const sql = `
            SELECT 
                a.id, 
                a.customer_name, 
                s.name as service_name, 
                a.price_at_time_of_booking,
                a.date, 
                a.time 
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            ORDER BY a.date, a.time;
        `;
        const { rows } = await pool.query(sql);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Erro ao listar agendamentos:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});


// Inicia o servidor e chama a função de setup do banco de dados
app.listen(PORT, () => {
  console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
  setupDatabase();
});
