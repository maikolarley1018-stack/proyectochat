const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// ===== CONFIGURACIÓN =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== SOCKETS =====
require('./sockets')(io);

// ===== CONEXIÓN A MONGODB =====
mongoose.connect('mongodb://127.0.0.1:27017/chat-database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('🟢 Base de datos conectada'))
.catch(err => console.log('🔴 Error en DB:', err));

// ===== SERVIDOR =====
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});