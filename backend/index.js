// backend/index.js

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // Importamos o bcrypt

const app = express();
const PORT = 3001;
const saltRounds = 10; // Fator de "custo" para a criptografia

// Conexão com o Banco de Dados
const db = new sqlite3.Database('./schedule.db', (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados", err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    // Cria a tabela de agendamentos se ela não existir
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, service TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL
    )`);
    // <<< CRIA A NOVA TABELA DE USUÁRIOS >>>
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )`);
  }
});

app.use(cors());
app.use(express.json());

// --- Rotas da API de Autenticação ---

// <<< NOVA ROTA PARA REGISTRAR UM USUÁRIO >>>
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Nome de usuário e senha são obrigatórios." });
    }

    try {
        // Gera o "hash" seguro da senha
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;
        db.run(sql, [username, passwordHash], function(err) {
            if (err) {
                // Trata o erro de nome de usuário duplicado
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(409).json({ success: false, message: "Este nome de usuário já existe." });
                }
                console.error("Erro ao registrar usuário:", err.message);
                return res.status(500).json({ success: false, message: "Erro ao registrar usuário." });
            }
            console.log(`👤 Novo usuário registrado com ID: ${this.lastID}`);
            res.status(201).json({ success: true, message: "Usuário registrado com sucesso!", userId: this.lastID });
        });
    } catch (error) {
        console.error("Erro no processo de registro:", error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
});


// --- Rotas da API de Agendamentos (sem alterações) ---
// Rota GET para listar TODOS os agendamentos
app.get('/api/appointments', (req, res) => { /* ... seu código existente aqui ... */ });
// Rota GET para buscar UM agendamento
app.get('/api/appointments/:id', (req, res) => { /* ... seu código existente aqui ... */ });
// Rota POST para CRIAR um agendamento
app.post('/api/schedule', (req, res) => { /* ... seu código existente aqui ... */ });
// Rota PUT para ATUALIZAR um agendamento
app.put('/api/appointments/:id', (req, res) => { /* ... seu código existente aqui ... */ });
// Rota DELETE para EXCLUIR um agendamento
app.delete('/api/appointments/:id', (req, res) => { /* ... seu código existente aqui ... */ });


app.listen(PORT, () => {
  console.log(`🎉 Servidor backend rodando na porta ${PORT}`);
});