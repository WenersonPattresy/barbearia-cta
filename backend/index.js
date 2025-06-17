    // backend/index.js (Versão Final com todas as correções)

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
      // (código de setup do banco de dados, sem alterações)
      const createServicesTable = `CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, price NUMERIC(10, 2) NOT NULL);`;
      const createAppointmentsTable = `CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, customer_name VARCHAR(255) NOT NULL, service_id INTEGER REFERENCES services(id), price_at_time_of_booking NUMERIC(10, 2) NOT NULL, "date" VARCHAR(255) NOT NULL, "time" VARCHAR(255) NOT NULL);`;
      try {
        await pool.query(createServicesTable);
        await pool.query(createAppointmentsTable);
        console.log("Tabelas 'services' e 'appointments' verificadas/criadas com sucesso.");
        const { rows } = await pool.query("SELECT COUNT(*) as count FROM services");
        if (rows[0].count === '0') {
          console.log("Populando a tabela de serviços...");
          await pool.query(`INSERT INTO services (name, price) VALUES ('Corte de Cabelo', 35.00), ('Barba', 25.00), ('Corte + Barba', 55.00);`);
          console.log("Serviços padrão inseridos.");
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
            const { rows } = await pool.query("SELECT * FROM services ORDER BY price");
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });
    
    // (Restante das rotas: /api/schedule, /api/appointments, etc. que já tínhamos)
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
      setupDatabase();
    });
    