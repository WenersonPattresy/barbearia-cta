// backend/index.js

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3'); // Importa o better-sqlite3

const app = express();
const PORT = 3001;

// Conexão com o Banco de Dados usando better-sqlite3
const db = new Database('schedule.db', { verbose: console.log });

// Cria as tabelas se elas não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, service TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL
  );
`);

app.use(cors());
app.use(express.json());

// --- Rotas da API (Adaptadas para better-sqlite3) ---

// Rota GET para listar TODOS os agendamentos
app.get('/api/appointments', (req, res) => {
    try {
        const sql = "SELECT * FROM appointments ORDER BY date, time";
        const appointments = db.prepare(sql).all();
        res.json({ success: true, message: "Agendamentos listados com sucesso!", data: appointments });
    } catch (err) {
        res.status(400).json({ success: false, message: "Erro ao buscar agendamentos." });
    }
});

// Rota POST para CRIAR um novo agendamento
app.post('/api/schedule', (req, res) => {
    const { name, service, date, time } = req.body;
    try {
        // Verifica conflito
        const checkSql = `SELECT id FROM appointments WHERE date = ? AND time = ?`;
        const existing = db.prepare(checkSql).get(date, time);

        if (existing) {
            return res.status(409).json({ success: false, message: "Este horário já está ocupado. Por favor, escolha outro." });
        }

        // Insere o novo agendamento
        const insertSql = `INSERT INTO appointments (name, service, date, time) VALUES (?, ?, ?, ?)`;
        const info = db.prepare(insertSql).run(name, service, date, time);

        console.log(`🎉 Novo agendamento salvo com ID: ${info.lastInsertRowid}`);
        res.status(201).json({ success: true, message: 'Agendamento salvo com sucesso!', appointmentId: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ success: false, message: "Erro ao salvar o agendamento." });
    }
});

// ... (O resto das rotas, como register, delete, update, etc., seriam adaptadas da mesma forma)

app.listen(PORT, () => {
  console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
});