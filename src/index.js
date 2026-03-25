// Cargar variables de entorno desde .env (especificando ruta)
require('dotenv').config({ path: './.env' });

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

// ===== CONEXIÓN A MONGODB =====
const dbURI = process.env.MONGODB_URI;

console.log('🔍 MONGODB_URI:', dbURI ? '✅ Configurada' : '❌ No configurada');

if (!dbURI) {
    console.error('❌ Error: MONGODB_URI no está configurada');
    console.log('💡 Crea un archivo .env con MONGODB_URI=mongodb://127.0.0.1:27017/chat-database');
    console.log('📁 El archivo .env debe estar en:', __dirname);
    process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => {
        console.log('🟢 Base de datos conectada exitosamente');
        require('./sockets')(io);

        const PORT = process.env.PORT || 3000;
        
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log("🚀 Servidor en el puerto", PORT);
        });

    })
    .catch(err => {
        console.error('🔴 Error de conexión:', err.message);
        process.exit(1);
    });